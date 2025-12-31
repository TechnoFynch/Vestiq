import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user_profile.dto';
import { UpdateUserProfileDto } from './dto/update-user_profile.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user_profile.entity';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) {}

  private readonly logger = new Logger(UserProfileService.name);

  public async create(
    createUserProfileDto: CreateUserProfileDto,
    authUserId: string,
  ) {
    try {
      let newUserProfile = this.userProfileRepo.create(createUserProfileDto);

      newUserProfile.user = { id: authUserId } as Auth;

      newUserProfile = await this.userProfileRepo.save(newUserProfile);

      this.logger.log(`New Profile created with ID: ${newUserProfile.id}`);

      return {
        success: true,
        userProfileId: newUserProfile.id,
      };
    } catch (error) {
      this.logger.error(error);
      // 🔥 Bcrypt / unexpected errors
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  findAll() {
    return `This action returns all userProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userProfile`;
  }

  update(id: number, updateUserProfileDto: UpdateUserProfileDto) {
    return `This action updates a #${id} userProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} userProfile`;
  }
}
