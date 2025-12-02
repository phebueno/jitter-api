import { IsString, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 'clxyz123456789',
  })
  @IsString()
  idItem: string;

  @ApiProperty({
    description: 'Quantidade do item',
    example: 2,
  })
  @IsNumber()
  quantidadeItem: number;

  @ApiProperty({
    description: 'Valor unitário do item',
    example: 29.99,
  })
  @IsNumber()
  valorItem: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Número único do pedido',
    example: 'v10089016vdb',
  })
  @IsString()
  numeroPedido: string;

  @ApiProperty({
    description: 'Valor total do pedido',
    example: 59.98,
  })
  @IsNumber()
  valorTotal: number;

  @ApiProperty({
    description: 'Data de criação do pedido (ISO 8601)',
    example: '2025-12-01T10:30:00Z',
  })
  @IsDateString()
  dataCriacao: string;

  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
