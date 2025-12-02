import { IsString, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsString()
  idItem: string;

  @IsNumber()
  quantidadeItem: number;

  @IsNumber()
  valorItem: number;
}

export class CreateOrderDto {
  @IsString()
  numeroPedido: string;

  @IsNumber()
  valorTotal: number;

  @IsDateString()
  dataCriacao: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
