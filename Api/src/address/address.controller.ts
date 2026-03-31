import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('address')
@ApiBearerAuth('access-token')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.addressService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Param('userId') userId: string) {
    return this.addressService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }

  @Patch(':id/default')
  @UseGuards(JwtAuthGuard)
  setDefault(@Param('id') id: string) {
    return this.addressService.setDefault(id);
  }
}
