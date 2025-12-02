import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from '@/products/products.service';

@ApiTags('products')
@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('list')
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso' })
  findAll() {
    return this.productsService.findAll();
  }
}
