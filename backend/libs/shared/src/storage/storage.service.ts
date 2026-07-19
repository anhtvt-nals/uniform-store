import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly defaultBucket: string;
  private readonly publicUrlBase: string;

  constructor(private readonly configService: ConfigService) {
    const storage = this.configService.get('app.storage');
    this.s3 = new S3Client({
      endpoint: storage.endpoint || undefined,
      region: storage.region || 'us-east-1',
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.defaultBucket = storage.bucket || 'uniform-store';
    this.publicUrlBase = storage.publicUrl || '';
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string,
  ): Promise<{ url: string }> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket || this.defaultBucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return { url: this.buildPublicUrl(key) };
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket || this.defaultBucket,
        Key: key,
      }),
    );
  }

  async getPresignedUploadUrl(
    bucket: string,
    key: string,
    expiresIn?: number,
    contentType?: string,
    maxSize?: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket || this.defaultBucket,
      Key: key,
      ContentType: contentType,
      ...(maxSize ? { ContentLength: maxSize } : {}),
    });
    return getSignedUrl(this.s3, command, {
      expiresIn: expiresIn || 3600,
    });
  }

  async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn?: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket || this.defaultBucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, {
      expiresIn: expiresIn || 3600,
    });
  }

  buildPublicUrl(key: string): string {
    if (this.publicUrlBase) {
      const base = this.publicUrlBase.replace(/\/+$/, '');
      return `${base}/${key}`;
    }
    return key;
  }
}
