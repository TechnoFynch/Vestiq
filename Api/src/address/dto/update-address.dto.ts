import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, Length } from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the recipient',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  full_name?: string;

  @ApiPropertyOptional({
    example: '+91 9876543210',
    description: 'Phone number of the recipient',
  })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Flat 12B, Green Heights, MG Road',
    description: 'Primary address line',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  line1?: string;

  @ApiPropertyOptional({
    example: 'Near City Mall',
    description: 'Secondary address line (optional)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  line2?: string;

  @ApiPropertyOptional({
    example: 'Mumbai',
    description: 'City name',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiPropertyOptional({
    example: 'Maharashtra',
    description: 'State or region',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @ApiPropertyOptional({
    example: 'India',
    description: 'Country name',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @ApiPropertyOptional({
    example: '400001',
    description: 'Postal / ZIP code',
  })
  @IsOptional()
  @IsString()
  @Length(3, 20)
  postal_code?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Mark this address as default',
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
