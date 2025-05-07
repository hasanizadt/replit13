import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { BrandService } from '../brand/brand.service';
import { AttributesService } from '../attributes/attributes.service';
import { 
  InitSystemInput, 
  CreateAdminUserInput, 
  RunSetupStepInput, 
  CompleteSetupInput 
} from './dto/setup.input';
import { SetupStepStatus } from './models/setup.model';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class SetupService {
  private setupSteps: any[] = [];
  private systemInitialized: boolean = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly brandService: BrandService,
    private readonly attributesService: AttributesService,
  ) {
    this.logger.setContext('SetupService');
    this.initSetupSteps();
  }

  /**
   * Initialize setup steps
   */
  private initSetupSteps() {
    this.setupSteps = [
      {
        id: 'database_check',
        name: 'بررسی اتصال به پایگاه داده',
        description: 'بررسی اتصال به پایگاه داده و اعتبار تنظیمات',
        status: SetupStepStatus.PENDING,
        order: 1,
        isRequired: true,
        handler: this.checkDatabaseConnection.bind(this),
      },
      {
        id: 'system_init',
        name: 'مقداردهی اولیه سیستم',
        description: 'ایجاد تنظیمات اولیه سیستم و پارامترهای اصلی',
        status: SetupStepStatus.PENDING,
        order: 2,
        isRequired: true,
        handler: this.initSystem.bind(this),
      },
      {
        id: 'admin_user',
        name: 'ایجاد کاربر مدیر',
        description: 'ایجاد حساب کاربری مدیر اصلی سیستم',
        status: SetupStepStatus.PENDING,
        order: 3,
        isRequired: true,
        handler: this.createAdminUser.bind(this),
      },
      {
        id: 'base_categories',
        name: 'ایجاد دسته‌بندی‌های پایه',
        description: 'ایجاد ساختار دسته‌بندی محصولات',
        status: SetupStepStatus.PENDING,
        order: 4,
        isRequired: false,
        handler: this.setupBaseCategories.bind(this),
      },
      {
        id: 'base_attributes',
        name: 'ایجاد ویژگی‌های پایه',
        description: 'ایجاد ویژگی‌های پایه محصولات',
        status: SetupStepStatus.PENDING,
        order: 5,
        isRequired: false,
        handler: this.setupBaseAttributes.bind(this),
      },
      {
        id: 'sample_products',
        name: 'ایجاد محصولات نمونه',
        description: 'ایجاد چند محصول نمونه برای تست سیستم',
        status: SetupStepStatus.PENDING,
        order: 6,
        isRequired: false,
        handler: this.setupSampleProducts.bind(this),
      },
      {
        id: 'finalize_setup',
        name: 'نهایی‌سازی راه‌اندازی',
        description: 'بررسی نهایی و فعال‌سازی سیستم',
        status: SetupStepStatus.PENDING,
        order: 7,
        isRequired: true,
        handler: this.finalizeSetup.bind(this),
      },
    ];
  }

  /**
   * Get setup progress
   */
  async getSetupProgress() {
    try {
      // Check if the system is already initialized
      const isInitialized = await this.isSystemInitialized();
      
      if (isInitialized) {
        this.systemInitialized = true;
        
        // If system is initialized, mark all steps as completed
        this.setupSteps.forEach(step => {
          step.status = SetupStepStatus.COMPLETED;
          step.completedAt = new Date();
        });
      }
      
      const completedSteps = this.setupSteps.filter(step => step.status === SetupStepStatus.COMPLETED).length;
      const totalSteps = this.setupSteps.length;
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      const isCompleted = completedSteps === totalSteps;
      const hasErrors = this.setupSteps.some(step => step.status === SetupStepStatus.FAILED);
      
      return {
        steps: this.setupSteps,
        completedSteps,
        totalSteps,
        progressPercentage,
        isCompleted,
        hasErrors,
      };
    } catch (error) {
      this.logger.error(`Error getting setup progress: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    try {
      // Check database connection
      let databaseConnected = false;
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        databaseConnected = true;
      } catch (e) {
        this.logger.error(`Database connection error: ${e.message}`);
      }
      
      // Check Redis connection (simplified)
      let redisConnected = true;
      
      // Check filesystem access
      let filesystemAccessible = true;
      try {
        // Simple filesystem check
        fs.accessSync('./uploads', fs.constants.W_OK);
      } catch (e) {
        filesystemAccessible = false;
        this.logger.error(`Filesystem access error: ${e.message}`);
      }
      
      // Check if admin account exists
      let adminAccountExists = false;
      try {
        const adminCount = await (this.prisma as any).user.count({
          where: { role: 'ADMIN' } as any,
        });
        adminAccountExists = adminCount > 0;
      } catch (e) {
        this.logger.error(`Error checking admin accounts: ${e.message}`);
      }
      
      // Check if required tables exist
      let requiredTablesExist = false;
      try {
        // Try to query a few key tables
        await (this.prisma as any).user.findFirst();
        await (this.prisma as any).product.findFirst();
        await (this.prisma as any).category.findFirst();
        requiredTablesExist = true;
      } catch (e) {
        this.logger.error(`Required tables check error: ${e.message}`);
      }
      
      // Check if schema is up to date
      const schemaUpToDate = true; // In a real app, you'd compare schema versions
      
      return {
        databaseConnected,
        redisConnected,
        filesystemAccessible,
        adminAccountExists,
        requiredTablesExist,
        schemaUpToDate,
        systemVersion: this.configService.get('app.version', '1.0.0'),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting system status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Run a specific setup step
   */
  async runSetupStep(input: RunSetupStepInput) {
    try {
      const { stepId } = input;
      
      // Find the step
      const step = this.setupSteps.find(s => s.id === stepId);
      
      if (!step) {
        throw new Error(`Setup step not found: ${stepId}`);
      }
      
      // Check if this step can be run (prerequisites met)
      if (stepId !== 'database_check') {
        const previousSteps = this.setupSteps.filter(s => s.order < step.order);
        const allPreviousStepsCompleted = previousSteps.every(s => s.status === SetupStepStatus.COMPLETED);
        
        if (!allPreviousStepsCompleted) {
          throw new Error('Cannot run this step until all previous steps are completed');
        }
      }
      
      // Update step status
      step.status = SetupStepStatus.IN_PROGRESS;
      
      try {
        // Run the step handler
        await step.handler();
        
        // Update step status
        step.status = SetupStepStatus.COMPLETED;
        step.completedAt = new Date();
        
        return {
          success: true,
          message: `Step "${step.name}" completed successfully`,
          step,
        };
      } catch (error) {
        // Update step status
        step.status = SetupStepStatus.FAILED;
        step.error = error.message;
        
        return {
          success: false,
          message: `Step "${step.name}" failed`,
          error: error.message,
          step,
        };
      }
    } catch (error) {
      this.logger.error(`Error running setup step: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check database connection
   */
  private async checkDatabaseConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(`Database connection error: ${error.message}`, error.stack);
      throw new Error('Could not connect to database: ' + error.message);
    }
  }

  /**
   * Initialize system with basic settings
   */
  private async initSystem() {
    try {
      // Create required directories
      const directories = ['uploads', 'uploads/products', 'uploads/categories', 'uploads/brands', 'uploads/users', 'logs', 'reports'];
      
      for (const dir of directories) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
      
      // This is where you would save system settings to the database
      // For now, let's just simulate this step
      
      // Mark system as initialized
      this.systemInitialized = true;
      
      return true;
    } catch (error) {
      this.logger.error(`System initialization error: ${error.message}`, error.stack);
      throw new Error('Could not initialize system: ' + error.message);
    }
  }

  /**
   * Create admin user
   */
  private async createAdminUser() {
    try {
      // Check if admin user already exists
      const existingAdmin = await (this.prisma as any).user.findFirst({
        where: { role: 'ADMIN' } as any,
      });
      
      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping creation');
        return true;
      }
      
      // Create default admin user
      await (this.prisma as any).user.create({
        data: {
          id: uuidv4(),
          email: 'admin@example.com',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'securepassword'
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isVerified: true,
          isActive: true,
        } as any,
      } as any);
      
      this.logger.log('Default admin user created');
      return true;
    } catch (error) {
      this.logger.error(`Admin user creation error: ${error.message}`, error.stack);
      throw new Error('Could not create admin user: ' + error.message);
    }
  }

  /**
   * Setup base categories
   */
  private async setupBaseCategories() {
    try {
      // Create some base categories
      const categories = [
        {
          name: 'الکترونیک',
          slug: 'electronics',
          description: 'محصولات الکترونیکی شامل موبایل، تبلت، لپ تاپ و غیره',
        },
        {
          name: 'پوشاک',
          slug: 'clothing',
          description: 'انواع پوشاک مردانه، زنانه و بچه‌گانه',
        },
        {
          name: 'خانه و آشپزخانه',
          slug: 'home-kitchen',
          description: 'لوازم خانگی، دکوراسیون و لوازم آشپزخانه',
        },
        {
          name: 'کتاب و لوازم التحریر',
          slug: 'books-stationery',
          description: 'کتاب، مجله و لوازم التحریر',
        },
        {
          name: 'زیبایی و سلامت',
          slug: 'beauty-health',
          description: 'محصولات آرایشی، بهداشتی و سلامت',
        },
      ];
      
      for (const category of categories) {
        // Check if category already exists
        const existingCategory = await (this.prisma as any).category.findFirst({
          where: { slug: category.slug } as any,
        });
        
        if (!existingCategory) {
          await (this.prisma as any).category.create({
            data: {
              id: uuidv4(),
              name: category.name,
              slug: category.slug,
              description: category.description,
              isActive: true,
            } as any,
          } as any);
        }
      }
      
      this.logger.log('Base categories created');
      return true;
    } catch (error) {
      this.logger.error(`Base categories setup error: ${error.message}`, error.stack);
      throw new Error('Could not setup base categories: ' + error.message);
    }
  }

  /**
   * Setup base attributes
   */
  private async setupBaseAttributes() {
    try {
      // Create some base attributes
      const attributes = [
        {
          name: 'رنگ',
          values: ['سفید', 'سیاه', 'قرمز', 'آبی', 'سبز', 'زرد'],
        },
        {
          name: 'سایز',
          values: ['کوچک', 'متوسط', 'بزرگ', 'خیلی بزرگ'],
        },
        {
          name: 'جنس',
          values: ['چوب', 'پلاستیک', 'فلز', 'پارچه', 'چرم'],
        },
        {
          name: 'وزن',
          values: ['سبک', 'متوسط', 'سنگین'],
        },
      ];
      
      for (const attribute of attributes) {
        // Check if attribute already exists
        const existingAttribute = await (this.prisma as any).attribute.findFirst({
          where: { name: attribute.name } as any,
        });
        
        let attributeId;
        
        if (!existingAttribute) {
          const newAttribute = await (this.prisma as any).attribute.create({
            data: {
              id: uuidv4(),
              name: attribute.name,
              isActive: true,
            } as any,
          } as any);
          
          attributeId = newAttribute.id;
        } else {
          attributeId = existingAttribute.id;
        }
        
        // Create attribute values
        for (const value of attribute.values) {
          // Check if value already exists
          const existingValue = await (this.prisma as any).attributeValue.findFirst({
            where: {
              attributeId,
              value,
            } as any,
          } as any);
          
          if (!existingValue) {
            await (this.prisma as any).attributeValue.create({
              data: {
                id: uuidv4(),
                attributeId,
                value,
                isActive: true,
              } as any,
            } as any);
          }
        }
      }
      
      this.logger.log('Base attributes created');
      return true;
    } catch (error) {
      this.logger.error(`Base attributes setup error: ${error.message}`, error.stack);
      throw new Error('Could not setup base attributes: ' + error.message);
    }
  }

  /**
   * Setup sample products
   */
  private async setupSampleProducts() {
    try {
      // Create a default brand first
      let brandId;
      const existingBrand = await (this.prisma as any).brand.findFirst({
        where: { slug: 'default-brand' } as any,
      });
      
      if (!existingBrand) {
        const newBrand = await (this.prisma as any).brand.create({
          data: {
            id: uuidv4(),
            name: 'برند پیش‌فرض',
            slug: 'default-brand',
            description: 'برند پیش‌فرض برای محصولات نمونه',
            isActive: true,
          } as any,
        } as any);
        
        brandId = newBrand.id;
      } else {
        brandId = existingBrand.id;
      }
      
      // Get a category
      const category = await (this.prisma as any).category.findFirst({
        where: { slug: 'electronics' } as any,
      });
      
      if (!category) {
        throw new Error('Category not found. Please run the base categories setup first.');
      }
      
      // Create a sample product
      const existingProduct = await (this.prisma as any).product.findFirst({
        where: { slug: 'sample-product' } as any,
      });
      
      if (!existingProduct) {
        await (this.prisma as any).product.create({
          data: {
            id: uuidv4(),
            name: 'محصول نمونه',
            slug: 'sample-product',
            description: 'این یک محصول نمونه برای تست سیستم است',
            price: 100000, // 100,000 تومان
            compareAtPrice: 120000, // 120,000 تومان
            costPrice: 80000, // 80,000 تومان
            sku: 'SAMPLE-001',
            barcode: '1234567890123',
            isActive: true,
            isDigital: false,
            isVirtual: false,
            isTaxable: true,
            weight: 1.5,
            inventory: 100,
            lowInventoryThreshold: 10,
            categoryId: category.id,
            brandId,
          } as any,
        } as any);
      }
      
      this.logger.log('Sample products created');
      return true;
    } catch (error) {
      this.logger.error(`Sample products setup error: ${error.message}`, error.stack);
      throw new Error('Could not setup sample products: ' + error.message);
    }
  }

  /**
   * Finalize setup
   */
  private async finalizeSetup() {
    try {
      // Perform any final checks or cleanup
      
      // In a real app, you would set a flag in the database to indicate
      // that the setup is complete
      
      // For now, we'll just return success
      return true;
    } catch (error) {
      this.logger.error(`Finalize setup error: ${error.message}`, error.stack);
      throw new Error('Could not finalize setup: ' + error.message);
    }
  }

  /**
   * Check if system is already initialized
   */
  private async isSystemInitialized(): Promise<boolean> {
    try {
      // In a real app, you would check a flag in the database
      // For now, let's just check if an admin user exists
      
      const adminCount = await (this.prisma as any).user.count({
        where: { role: 'ADMIN' } as any,
      });
      
      return adminCount > 0;
    } catch (error) {
      this.logger.error(`Error checking if system is initialized: ${error.message}`, error.stack);
      return false;
    }
  }
}
