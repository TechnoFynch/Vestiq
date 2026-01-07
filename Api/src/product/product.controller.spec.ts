import { Test, TestingModule } from '@nestjs/testing';
import { ProductAdminController } from './product-admin.controller';
import { ProductAdminService } from './product-admin.service';

describe('ProductController', () => {
  let controller: ProductAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductAdminController],
      providers: [ProductAdminService],
    }).compile();

    controller = module.get<ProductAdminController>(ProductAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
