import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Shubham Salunke',
    description: 'Full name of the recipient',
  })
  @IsString()
  @Length(1, 255)
  full_name!: string;

  @ApiProperty({
    example: '+91 9876543210',
    description: 'Phone number of the recipient',
  })
  @IsString()
  @Length(6, 20)
  phone!: string;

  @ApiProperty({
    example: 'Flat 12B, Green Heights, MG Road',
    description: 'Primary address line',
  })
  @IsString()
  @Length(1, 255)
  line1!: string;

  @ApiPropertyOptional({
    example: 'Near City Mall',
    description: 'Secondary address line (optional)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  line2?: string;

  @ApiProperty({
    example: 'Mumbai',
    description: 'City name',
  })
  @IsString()
  @Length(1, 100)
  city!: string;

  @ApiProperty({
    example: 'Maharashtra',
    description: 'State or region',
  })
  @IsString()
  @Length(1, 100)
  state!: string;

  @ApiProperty({
    example: 'India',
    description: 'Country name',
  })
  @IsString()
  @Length(1, 100)
  country!: string;

  @ApiProperty({
    example: '400001',
    description: 'Postal / ZIP code',
  })
  @IsString()
  @Length(3, 20)
  postal_code!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Mark this address as default',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
