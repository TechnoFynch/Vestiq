import { Module } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user_profile.entity';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
  imports: [TypeOrmModule.forFeature([UserProfile])],
})
export class UserProfileModule {}
