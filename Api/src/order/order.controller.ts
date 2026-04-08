import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('order')
@ApiBearerAuth('access-token')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user.sub as string;
    return this.orderService.create(createOrderDto, user);
  }

  // TODO: Move to Admin Controller Later
  // @Get()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // findAll() {
  //   return this.orderService.findAll();
  // }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  findByUserId(
    @Req() req: any,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ) {
    const userId = req.user.sub;
    return this.orderService.findByUserId(userId, limit, page);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.orderService.findOne(id, userId);
  }

  // TODO: Move to AdminController Later
  // @Patch(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(id, updateOrderDto);
  // }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.orderService.cancel(id, userId);
  }
}
