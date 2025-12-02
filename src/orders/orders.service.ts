import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const { numeroPedido, valorTotal, dataCriacao, items } = createOrderDto;

    const existingOrder = await this.prisma.order.findUnique({
      where: {
        orderId: numeroPedido,
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        `Número do pedido ${numeroPedido} já existe`,
      );
    }

    const groupedItems = items.reduce((acc, item) => {
      const existing = acc.find((i) => i.idItem === item.idItem);
      if (existing) {
        existing.quantidadeItem += item.quantidadeItem;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as typeof items);

    const productIds = groupedItems.map((item) => item.idItem);
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundProductIds = products.map((p) => p.id);
    const invalidProductIds = productIds.filter(
      (id) => !foundProductIds.includes(id),
    );

    if (invalidProductIds.length > 0) {
      throw new NotFoundException(
        `Produto(s) não encontrado(s): ${invalidProductIds.join(', ')}`,
      );
    }

    return this.prisma.order.create({
      data: {
        orderId: numeroPedido,
        value: valorTotal,
        creationDate: new Date(dataCriacao),
        userId,
        items: {
          create: groupedItems.map((item) => ({
            productId: item.idItem,
            quantity: item.quantidadeItem,
            price: item.valorItem,
          })),
        },
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
  }

  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderId,
        userId,
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    }

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: {
        creationDate: 'desc',
      },
    });
  }

  async update(orderId: string, updateOrderDto: CreateOrderDto, userId: string) {
    await this.findOne(orderId, userId);

    const { numeroPedido, valorTotal, dataCriacao, items } = updateOrderDto;

    const groupedItems = items.reduce((acc, item) => {
      const existing = acc.find((i) => i.idItem === item.idItem);
      if (existing) {
        existing.quantidadeItem += item.quantidadeItem;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as typeof items);

    const productIds = groupedItems.map((item) => item.idItem);
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundProductIds = products.map((p) => p.id);
    const invalidProductIds = productIds.filter(
      (id) => !foundProductIds.includes(id),
    );

    if (invalidProductIds.length > 0) {
      throw new NotFoundException(
        `Produto(s) não encontrado(s): ${invalidProductIds.join(', ')}`,
      );
    }

    await this.prisma.item.deleteMany({
      where: { orderId },
    });

    return this.prisma.order.update({
      where: { orderId },
      data: {
        ...(numeroPedido && { orderId: numeroPedido }),
        ...(valorTotal !== undefined && { value: valorTotal }),
        ...(dataCriacao && { creationDate: new Date(dataCriacao) }),
        items: {
          create: groupedItems.map((item) => ({
            productId: item.idItem,
            quantity: item.quantidadeItem,
            price: item.valorItem,
          })),
        },
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
  }

  async remove(orderId: string, userId: string) {
    await this.findOne(orderId, userId);

    await this.prisma.item.deleteMany({
      where: { orderId },
    });

    await this.prisma.order.delete({
      where: { orderId },
    });

    return { message: `Pedido ${orderId} deletado com sucesso` };
  }
}
