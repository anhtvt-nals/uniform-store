import {apiClient} from '@/lib/api';

const MULTIPART_THRESHOLD = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export type UploadedImage = {
  id?: string;
  url: string;
  key?: string;
};

type UploadMetadata = {
  entityType?: string;
  entityId?: string;
  variantId?: string;
};

type MultipartStart = {
  key: string;
  uploadId: string;
  partSize: number;
  parts: Array<{partNumber: number; uploadUrl: string}>;
};

async function uploadPart(uploadUrl: string, body: Blob, partNumber: number): Promise<{partNumber: number; etag: string}> {
  let response: Response;
  try {
    response = await fetch(uploadUrl, {method: 'PUT', body});
  } catch {
    throw new Error(
      `Không thể kết nối R2 để tải phần ${partNumber}. Kiểm tra CORS của bucket: origin Admin phải được phép PUT.`,
    );
  }

  if (!response.ok) {
    const details = (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 240);
    throw new Error(`R2 từ chối phần ${partNumber} (HTTP ${response.status})${details ? `: ${details}` : ''}`);
  }

  const etag = response.headers.get('etag');
  if (!etag) {
    throw new Error(`R2 đã nhận phần ${partNumber} nhưng không trả ETag. Thêm ETag vào ExposeHeaders của CORS bucket.`);
  }
  return {partNumber, etag};
}

export async function uploadImage(file: File, token: string | null, metadata: UploadMetadata = {}): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Ảnh tối đa 10 MB');
  }

  if (file.size <= MULTIPART_THRESHOLD) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.entityType) formData.append('entityType', metadata.entityType);
    if (metadata.entityId) formData.append('entityId', metadata.entityId);
    if (metadata.variantId) formData.append('variantId', metadata.variantId);
    const response = await apiClient<UploadedImage>('/uploads/upload', {
      method: 'POST', body: formData, token, formData: true,
    });
    return response.data;
  }

  const start = await apiClient<MultipartStart>('/uploads/multipart', {
    method: 'POST',
    token,
    body: {...metadata, filename: file.name, contentType: file.type, size: file.size},
  });
  const {key, uploadId, partSize, parts} = start.data;

  try {
    const completedParts = await Promise.all(parts.map(({partNumber, uploadUrl}) => {
      const offset = (partNumber - 1) * partSize;
      return uploadPart(uploadUrl, file.slice(offset, Math.min(offset + partSize, file.size)), partNumber);
    }));

    const complete = await apiClient<UploadedImage>('/uploads/multipart/complete', {
      method: 'POST',
      token,
      body: {...metadata, key, uploadId, parts: completedParts, filename: file.name, contentType: file.type, size: file.size},
    });
    return complete.data;
  } catch (error: unknown) {
    // Cleanup must never replace the actual R2/complete failure shown to the user.
    await apiClient('/uploads/multipart/abort', {method: 'POST', token, body: {key, uploadId}}).catch(() => undefined);
    const message = error instanceof Error ? error.message : 'Không thể hoàn tất multipart upload.';
    throw new Error(message);
  }
}
