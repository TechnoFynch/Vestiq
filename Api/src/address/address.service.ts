import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    try {
      // Validate user exists
      const user = await this.authService.findById(createAddressDto.userId);

      if (!user) {
        throw new NotFoundException(
          `User ${createAddressDto.userId} not found`,
        );
      }

      // If setting as default, unset other default addresses
      if (createAddressDto.is_default) {
        await this.addressRepo.update(
          { user: { id: createAddressDto.userId } },
          { is_default: false },
        );
      }

      // Create new address
      const address = this.addressRepo.create({
        user,
        full_name: createAddressDto.full_name,
        phone: createAddressDto.phone,
        line1: createAddressDto.line1,
        line2: createAddressDto.line2,
        city: createAddressDto.city,
        state: createAddressDto.state,
        country: createAddressDto.country,
        postal_code: createAddressDto.postal_code,
        is_default: createAddressDto.is_default || false,
      });

      const savedAddress = await this.addressRepo.save(address);

      this.logger.log(
        `Address created: ${savedAddress.id} for user ${createAddressDto.userId}`,
      );
      return {
        success: true,
        address: savedAddress,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Error creating address:', error);
      throw new InternalServerErrorException('Failed to create address');
    }
  }

  async findAll() {
    try {
      const addresses = await this.addressRepo.find({
        relations: ['user'],
        order: {
          created_at: 'DESC',
        },
      });

      return addresses;
    } catch (error) {
      this.logger.error('Error fetching addresses:', error);
      throw new InternalServerErrorException('Failed to fetch addresses');
    }
  }

  async findByUserId(userId: string) {
    try {
      // Validate user exists
      const user = await this.authService.findById(userId);

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const addresses = await this.addressRepo.find({
        where: { user: { id: userId } },
        relations: ['user'],
        order: {
          is_default: 'DESC',
          created_at: 'DESC',
        },
      });

      return addresses;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching addresses for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch user addresses');
    }
  }

  async findOne(id: string) {
    try {
      const address = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      return address;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching address with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch address');
    }
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    try {
      const address = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // If setting as default, unset other default addresses for this user
      if (updateAddressDto.is_default) {
        await this.addressRepo.update(
          { user: { id: address.user.id } },
          { is_default: false },
        );
      }

      // Update address fields
      Object.assign(address, updateAddressDto);

      const updatedAddress = await this.addressRepo.save(address);

      this.logger.log(`Address ${id} updated for user ${address.user.id}`);
      return {
        success: true,
        address: updatedAddress,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating address with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update address');
    }
  }

  async remove(id: string) {
    try {
      const address = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // Check if it's the only address for the user
      const userAddresses = await this.addressRepo.find({
        where: { user: { id: address.user.id } },
      });

      if (userAddresses.length === 1) {
        throw new BadRequestException(
          'Cannot delete the only address for a user',
        );
      }

      // If deleting default address, set another as default
      if (address.is_default) {
        const remainingAddresses = userAddresses.filter(
          (addr) => addr.id !== id,
        );
        if (remainingAddresses.length > 0) {
          await this.addressRepo.update(
            { id: remainingAddresses[0].id },
            { is_default: true },
          );
        }
      }

      await this.addressRepo.delete(id);

      this.logger.log(`Address ${id} deleted for user ${address.user.id}`);
      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error deleting address with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete address');
    }
  }

  async setDefault(id: string) {
    try {
      const address = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // Unset all other default addresses for this user
      await this.addressRepo.update(
        { user: { id: address.user.id } },
        { is_default: false },
      );

      // Set this address as default
      address.is_default = true;
      const updatedAddress = await this.addressRepo.save(address);

      this.logger.log(
        `Address ${id} set as default for user ${address.user.id}`,
      );
      return {
        success: true,
        address: updatedAddress,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error setting default address ${id}:`, error);
      throw new InternalServerErrorException('Failed to set default address');
    }
  }
}
