import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SuggestQueryPipe implements PipeTransform {
  transform(value: unknown): string {
    // 1. Ensure value exists
    if (typeof value !== 'string') {
      throw new BadRequestException('Query parameter is required');
    }

    // 2. Trim whitespace
    const query = value.trim();

    // 3. Ensure not empty after trim
    if (!query) {
      throw new BadRequestException('Query parameter cannot be empty');
    }

    // 4. Enforce minimum length
    if (query.length < 3) {
      throw new BadRequestException('Query must be at least 3 characters long');
    }

    // 5. Normalize (optional but recommended)
    return query.toLowerCase();
  }
}
