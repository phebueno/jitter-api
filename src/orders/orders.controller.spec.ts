import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersController } from '@/orders/orders.controller';
import { OrdersService } from '@/orders/orders.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user123',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should create a new order', async () => {
      const mockOrder = {
        id: '1',
        orderId: createOrderDto.numeroPedido,
        value: createOrderDto.valorTotal,
        items: [
          { id: 'item1', productId: 'prod1', quantity: 2, price: 50 },
        ],
      };

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createOrderDto, mockRequest);

      expect(ordersService.create).toHaveBeenCalledWith(
        createOrderDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException if order ID already exists', async () => {
      mockOrdersService.create.mockRejectedValue(
        new BadRequestException('Número do pedido ORD001 já existe'),
      );

      await expect(
        controller.create(createOrderDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockOrdersService.create.mockRejectedValue(
        new NotFoundException('Produto(s) não encontrado(s): prod1'),
      );

      await expect(
        controller.create(createOrderDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all orders for the user', async () => {
      const mockOrders = [
        {
          id: '1',
          orderId: 'ORD001',
          userId: mockRequest.user.id,
          items: [],
        },
        {
          id: '2',
          orderId: 'ORD002',
          userId: mockRequest.user.id,
          items: [],
        },
      ];

      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll(mockRequest);

      expect(ordersService.findAll).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array if user has no orders', async () => {
      mockOrdersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const orderId = 'ORD001';

    it('should return a specific order', async () => {
      const mockOrder = {
        id: '1',
        orderId,
        userId: mockRequest.user.id,
        items: [
          { id: 'item1', productId: 'prod1', quantity: 2, price: 50 },
        ],
      };

      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, mockRequest);

      expect(ordersService.findOne).toHaveBeenCalledWith(
        orderId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrdersService.findOne.mockRejectedValue(
        new NotFoundException(`Pedido ${orderId} não encontrado`),
      );

      await expect(controller.findOne(orderId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const orderId = 'ORD001';
    const updateOrderDto = {
      numeroPedido: 'ORD001',
      valorTotal: 150,
      dataCriacao: '2025-12-01T10:00:00Z',
      items: [
        { idItem: 'prod1', quantidadeItem: 3, valorItem: 50 },
      ],
    };

    it('should update an order', async () => {
      const mockUpdatedOrder = {
        id: '1',
        orderId,
        value: updateOrderDto.valorTotal,
        items: [
          { id: 'item1', productId: 'prod1', quantity: 3, price: 50 },
        ],
      };

      mockOrdersService.update.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.update(
        orderId,
        updateOrderDto,
        mockRequest,
      );

      expect(ordersService.update).toHaveBeenCalledWith(
        orderId,
        updateOrderDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrdersService.update.mockRejectedValue(
        new NotFoundException(`Pedido ${orderId} não encontrado`),
      );

      await expect(
        controller.update(orderId, updateOrderDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockOrdersService.update.mockRejectedValue(
        new NotFoundException('Produto(s) não encontrado(s): prod1'),
      );

      await expect(
        controller.update(orderId, updateOrderDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const orderId = 'ORD001';

    it('should delete an order', async () => {
      const mockResponse = {
        message: `Pedido ${orderId} deletado com sucesso`,
      };

      mockOrdersService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(orderId, mockRequest);

      expect(ordersService.remove).toHaveBeenCalledWith(
        orderId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrdersService.remove.mockRejectedValue(
        new NotFoundException(`Pedido ${orderId} não encontrado`),
      );

      await expect(controller.remove(orderId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
