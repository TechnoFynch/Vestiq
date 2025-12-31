import { ApiProperty } from '@nestjs/swagger';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { CreateUserProfileDto } from 'src/user_profile/dto/create-user_profile.dto';

export class RegisterRequestDto {
  @ApiProperty({ type: CreateAuthDto })
  user!: CreateAuthDto;

  @ApiProperty({ type: CreateUserProfileDto })
  user_profile!: CreateUserProfileDto;
}
