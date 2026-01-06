import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  transform(files: Array<Express.Multer.File>) {
    if (files.length === 0) {
      throw new BadRequestException('File is required');
    }

    for (const file of files) {
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Only JPG, PNG, and WEBP images are allowed',
        );
      }
    }

    return files;
  }
}
