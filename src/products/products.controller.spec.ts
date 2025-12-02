import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '@/products/products.controller';
import { ProductsService } from '@/products/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
        { id: '3', name: 'Product 3' },
      ];

      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(productsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products exist', async () => {
      mockProductsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(productsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockProductsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service error');
      expect(productsService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
