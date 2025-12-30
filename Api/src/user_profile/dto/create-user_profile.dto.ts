import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    maxLength: 64,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    maxLength: 64,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  lastName!: string;

  @ApiProperty({
    description: 'Phone number (without country code)',
    example: '9876543210',
    maxLength: 10,
  })
  @IsString()
  @MinLength(7)
  @MaxLength(10)
  phone!: string;
}
