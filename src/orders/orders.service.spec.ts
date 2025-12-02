import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '@/orders/orders.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    item: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrderDto = {
      numeroPedido: 'ORD001',
      valorTotal: 100,
      dataCriacao: '2025-12-01T10:00:00Z',
      items: [
        { idItem: 'prod1', quantidadeItem: 2, valorItem: 50 },
      ],
    };
    const userId = 'user123';

    it('should create a new order successfully', async () => {
      const mockOrder = {
        id: '1',
        orderId: createOrderDto.numeroPedido,
        value: createOrderDto.valorTotal,
        items: [
          { id: 'item1', productId: 'prod1', quantity: 2, price: 50 },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(null);
      mockPrismaService.product.findMany.mockResolvedValue([{ id: 'prod1' }]);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto, userId);

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { orderId: createOrderDto.numeroPedido },
      });
      expect(prismaService.product.findMany).toHaveBeenCalled();
      expect(prismaService.order.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException if order ID already exists', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.create(createOrderDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createOrderDto, userId)).rejects.toThrow(
        `Número do pedido ${createOrderDto.numeroPedido} já existe`,
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(service.create(createOrderDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createOrderDto, userId)).rejects.toThrow(
        'Produto(s) não encontrado(s): prod1',
      );
    });

    it('should group duplicate items by summing quantities', async () => {
      const dtoWithDuplicates = {
        ...createOrderDto,
        items: [
          { idItem: 'prod1', quantidadeItem: 2, valorItem: 50 },
          { idItem: 'prod1', quantidadeItem: 3, valorItem: 50 },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(null);
      mockPrismaService.product.findMany.mockResolvedValue([{ id: 'prod1' }]);
      mockPrismaService.order.create.mockResolvedValue({});

      await service.create(dtoWithDuplicates, userId);

      expect(prismaService.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: {
              create: [
                expect.objectContaining({
                  productId: 'prod1',
                  quantity: 5, // 2 + 3
                  price: 50,
                }),
              ],
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const orderId = 'ORD001';
    const userId = 'user123';

    it('should return an order by ID for the user', async () => {
      const mockOrder = {
        id: '1',
        orderId,
        userId,
        items: [],
      };

      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId, userId);

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { orderId, userId },
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
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        `Pedido ${orderId} não encontrado`,
      );
    });
  });

  describe('findAll', () => {
    const userId = 'user123';

    it('should return all orders for a user', async () => {
      const mockOrders = [
        { id: '1', orderId: 'ORD001', userId, items: [] },
        { id: '2', orderId: 'ORD002', userId, items: [] },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array if user has no orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const orderId = 'ORD001';
    const userId = 'user123';
    const updateOrderDto = {
      numeroPedido: 'ORD001',
      valorTotal: 150,
      dataCriacao: '2025-12-01T10:00:00Z',
      items: [
        { idItem: 'prod1', quantidadeItem: 3, valorItem: 50 },
      ],
    };

    it('should update an order successfully', async () => {
      const mockOrder = { id: '1', orderId, userId, items: [] };
      const mockUpdatedOrder = { ...mockOrder, value: 150 };

      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.product.findMany.mockResolvedValue([{ id: 'prod1' }]);
      mockPrismaService.item.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.update(orderId, updateOrderDto, userId);

      expect(prismaService.order.findFirst).toHaveBeenCalled();
      expect(prismaService.product.findMany).toHaveBeenCalled();
      expect(prismaService.item.deleteMany).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(prismaService.order.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(
        service.update(orderId, updateOrderDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        id: '1',
        orderId,
      });
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(
        service.update(orderId, updateOrderDto, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(orderId, updateOrderDto, userId),
      ).rejects.toThrow('Produto(s) não encontrado(s): prod1');
    });
  });

  describe('remove', () => {
    const orderId = 'ORD001';
    const userId = 'user123';

    it('should delete an order successfully', async () => {
      const mockOrder = { id: '1', orderId, userId };

      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.item.deleteMany.mockResolvedValue({ count: 2 });
      mockPrismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.remove(orderId, userId);

      expect(prismaService.order.findFirst).toHaveBeenCalled();
      expect(prismaService.item.deleteMany).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(prismaService.order.delete).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(result).toEqual({
        message: `Pedido ${orderId} deletado com sucesso`,
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.remove(orderId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.item.deleteMany).not.toHaveBeenCalled();
      expect(prismaService.order.delete).not.toHaveBeenCalled();
    });
  });
});
