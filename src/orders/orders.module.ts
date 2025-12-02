import { Module } from '@nestjs/common';
import { OrdersService } from '@/orders/orders.service';
import { OrdersController } from '@/orders/orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
