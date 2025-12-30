import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @IsEmail()
  @MaxLength(125)
  @ApiProperty({ example: 'user.email@example.com' })
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @ApiProperty({ example: 'RanDomStrongPa55word' })
  password!: string;
}
