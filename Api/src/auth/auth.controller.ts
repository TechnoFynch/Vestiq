import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserProfileDto } from 'src/user_profile/dto/create-user_profile.dto';
import { ApiBody } from '@nestjs/swagger';
import { RegisterRequestDto } from 'src/documentation/register-wrapper.swagger.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterRequestDto })
  create(
    @Body('user') createAuthDto: CreateAuthDto,
    @Body('user_profile') createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.authService.create(createAuthDto, createUserProfileDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
