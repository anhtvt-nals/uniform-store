import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
  FileValidator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { SignedUrlDto } from './dto/signed-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Uploads')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('signed-url')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get a presigned upload URL for direct S3 upload' })
  getSignedUploadUrl(@Body() dto: SignedUrlDto) {
    return this.uploadsService.getSignedUploadUrl(dto);
  }

  @Post('confirm')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Confirm upload and link file to entity (product image, category image, brand logo)' })
  confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.uploadsService.confirmUpload(dto);
  }

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'analyst')
  @ApiOperation({ summary: 'List all uploaded assets (product images) with pagination' })
  listAssets(@Query() dto: ListAssetsDto) {
    return this.uploadsService.listAssets(dto);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'analyst')
  @ApiOperation({ summary: 'Get asset detail' })
  getAsset(@Param('id') id: string) {
    return this.uploadsService.getAsset(id);
  }

  @Post('upload')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Upload file directly to S3 and link to entity' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|gif|avif)/, skipMagicNumbersValidation: true }),
        ],
      }),
    ) file: any,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
    @Body('alt') alt?: string,
    @Body('variantId') variantId?: string,
  ) {
    return this.uploadsService.uploadFile(file, {
      entityType,
      entityId,
      alt: alt ? JSON.parse(alt) : undefined,
      variantId,
    });
  }

  @Delete()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Delete a file from S3 and optionally remove entity association' })
  deleteFile(@Body() dto: DeleteFileDto) {
    return this.uploadsService.deleteFile(dto);
  }
}
