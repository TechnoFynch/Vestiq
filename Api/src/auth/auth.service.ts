import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserProfileDto } from '../user_profile/dto/create-user_profile.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileService } from 'src/user_profile/user_profile.service';
import * as bcrypt from 'bcrypt';
import UserTypeEnum from './enums/user-type.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly AuthRepo: Repository<Auth>,
    private readonly userProfileService: UserProfileService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  public async create(
    createAuthDto: CreateAuthDto,
    createUserProfileDto: CreateUserProfileDto,
  ) {
    try {
      const rawPassword: string = createAuthDto.password;
      const hashedPassword: string = await bcrypt.hash(rawPassword, 10);

      let authUser = this.AuthRepo.create({
        email: createAuthDto.email,
        password_hash: hashedPassword,
        role: UserTypeEnum.USER,
      });

      authUser = await this.AuthRepo.save(authUser);

      this.logger.log(`New User created with ID: ${authUser.id}`);

      // TODO: Continue with profile creation (later)
      const userProfileResponse = await this.userProfileService.create(
        createUserProfileDto,
        authUser.id,
      );

      this.logger.log(
        `User ${authUser.email} linked to Profile with ID: ${userProfileResponse.userProfileId}`,
      );

      return {
        message: 'User registered successfully',
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof QueryFailedError) {
        const err: any = error;

        if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      }

      // 🔥 Bcrypt / unexpected errors
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  public async login(createAuthDto: CreateAuthDto) {
    const user = await this.findByEmail(createAuthDto.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(
      createAuthDto.password,
      user.password_hash,
    );

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async findByEmail(email: string) {
    try {
      const user = await this.AuthRepo.findOne({
        where: { email },
        relations: ['profile'],
      });

      return user;
    } catch (error) {
      this.logger.error(error);

      // 🔥 Bcrypt / unexpected errors
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
