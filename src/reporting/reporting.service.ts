import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { GenerateReportInput, ReportListInput } from './dto/report-request.input';
import { 
  ReportType, 
  ReportStatus, 
  ReportFormat, 
  TimePeriod,
  SalesReportData,
  ProductReportData,
  CustomerReportData,
  CategoryReportData,
  ShippingReportData,
  TaxReportData,
  InventoryReportData,
  PaymentReportData,
  ReturnsReportData,
  SellerReportData
} from './models/report.model';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportingService {
  private readonly reportsDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('ReportingService');
    this.reportsDir = this.configService.get('app.reporting.reportsDir', './reports');
    
    // Ensure reports directory exists
    this.ensureReportsDir();
  }

  /**
   * Create and generate a new report
   */
  async generateReport(userId: string, input: GenerateReportInput) {
    try {
      this.logger.log(`Generating ${input.type} report requested by user ${userId}`);
      
      // Create a report metadata record
      const reportId = uuidv4();
      const dateRange = this.getDateRange(input.timePeriod, input.startDate, input.endDate);
      
      const reportMetadata = await this.prisma.reportMetadata.create({
        data: {
          id: reportId,
          name: input.name,
          type: input.type,
          format: input.format,
          status: ReportStatus.PENDING as any, // Using type assertion for status
          createdBy: userId as any, // Using type assertion for createdBy
          description: input.description,
          timePeriod: input.timePeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        } as any,
      });
      
      // Start report generation in the background
      this.processReport(reportMetadata).catch(error => {
        this.logger.error(`Error processing report ${reportId}: ${error.message}`, error.stack);
        
        // Update report status to FAILED
        this.prisma.reportMetadata.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.FAILED as any, // Using type assertion for status
            errorMessage: error.message,
          } as any,
        }).catch(updateError => {
          this.logger.error(
            `Failed to update report status for ${reportId}: ${updateError.message}`,
            updateError.stack,
          );
        });
      });
      
      return reportMetadata;
    } catch (error) {
      this.logger.error(`Error initiating report generation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a list of reports with filtering
   */
  async getReports(userId: string, input: ReportListInput = {}) {
    try {
      const where: any = {
        createdBy: userId as any // Using type assertion for createdBy
      };
      
      if (input.type) {
        where.type = input.type;
      }
      
      if (input.startDate) {
        where.createdAt = {
          ...where.createdAt,
          gte: input.startDate,
        };
      }
      
      if (input.endDate) {
        where.createdAt = {
          ...where.createdAt,
          lte: input.endDate,
        };
      }
      
      return this.prisma.reportMetadata.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error getting reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a report by ID
   */
  async getReportById(userId: string, reportId: string) {
    try {
      const report = await this.prisma.reportMetadata.findFirst({
        where: {
          id: reportId,
          createdBy: userId as any, // Using type assertion for createdBy
        } as any,
      });
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      return report;
    } catch (error) {
      this.logger.error(`Error getting report by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(userId: string, reportId: string) {
    try {
      const report = await this.prisma.reportMetadata.findFirst({
        where: {
          id: reportId,
          createdBy: userId as any, // Using type assertion for createdBy
        } as any,
      });
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Delete the report file if it exists
      if (report.url) {
        const filePath = this.getReportFilePath(reportId, report.format as any);
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete the report metadata
      await this.prisma.reportMetadata.delete({
        where: { id: reportId },
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process the report generation
   */
  private async processReport(reportMetadata: any) {
    try {
      // Update status to PROCESSING
      await this.prisma.reportMetadata.update({
        where: { id: reportMetadata.id },
        data: {
          status: ReportStatus.PROCESSING as any, // Using type assertion for status
        } as any,
      });
      
      let reportData: any;
      
      // Generate the appropriate report based on type
      switch (reportMetadata.type) {
        case ReportType.SALES:
          reportData = await this.generateSalesReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.PRODUCTS:
          reportData = await this.generateProductReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.CUSTOMERS:
          reportData = await this.generateCustomerReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.CATEGORIES:
          reportData = await this.generateCategoryReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.SHIPPING:
          reportData = await this.generateShippingReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.TAXES:
          reportData = await this.generateTaxReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.INVENTORY:
          reportData = await this.generateInventoryReport();
          break;
        case ReportType.PAYMENTS:
          reportData = await this.generatePaymentReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.RETURNS:
          reportData = await this.generateReturnsReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        case ReportType.SELLERS:
          reportData = await this.generateSellerReport(
            reportMetadata.startDate,
            reportMetadata.endDate,
          );
          break;
        default:
          throw new Error(`Unsupported report type: ${reportMetadata.type}`);
      }
      
      // Save the report data to a file
      const filePath = this.saveReportToFile(
        reportMetadata.id,
        reportData,
        reportMetadata.format,
      );
      
      // Generate a URL for the report
      const reportUrl = `/reports/${reportMetadata.id}.${reportMetadata.format.toLowerCase()}`;
      
      // Update the report metadata
      await this.prisma.reportMetadata.update({
        where: { id: reportMetadata.id },
        data: {
          status: ReportStatus.COMPLETED as any, // Using type assertion for status
          url: reportUrl,
          completedAt: new Date(),
        } as any,
      });
      
      this.logger.log(`Report ${reportMetadata.id} generated successfully`);
      
      return reportUrl;
    } catch (error) {
      this.logger.error(`Error processing report: ${error.message}`, error.stack);
      
      // Update report status to FAILED
      await this.prisma.reportMetadata.update({
        where: { id: reportMetadata.id },
        data: {
          status: ReportStatus.FAILED as any, // Using type assertion for status
          errorMessage: error.message,
        } as any,
      });
      
      throw error;
    }
  }

  /**
   * Save report data to a file
   */
  private saveReportToFile(reportId: string, data: any, format: ReportFormat): string {
    const filePath = this.getReportFilePath(reportId, format);
    
    switch (format) {
      case ReportFormat.JSON:
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        break;
      case ReportFormat.CSV:
        fs.writeFileSync(filePath, this.convertToCSV(data));
        break;
      case ReportFormat.PDF:
      case ReportFormat.EXCEL:
        // These formats would require additional libraries to generate
        // For now, we'll just save as JSON
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        break;
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
    
    return filePath;
  }

  /**
   * Get the file path for a report
   */
  private getReportFilePath(reportId: string, format: ReportFormat): string {
    const extension = format.toLowerCase();
    return path.join(this.reportsDir, `${reportId}.${extension}`);
  }

  /**
   * Ensure the reports directory exists
   */
  private ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    if (!data || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return '';
    }
    
    const items = data.items;
    const headers = Object.keys(items[0]);
    
    const headerRow = headers.join(',');
    const dataRows = items.map(item => {
      return headers.map(header => {
        const value = item[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if the value contains commas or quotes
          if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        } else if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }).join(',');
    }).join('\n');
    
    return `${headerRow}\n${dataRows}`;
  }

  /**
   * Get date range based on time period
   */
  private getDateRange(timePeriod: TimePeriod, startDate?: Date, endDate?: Date) {
    const now = new Date();
    let start = new Date();
    const end = new Date();
    
    if (timePeriod === TimePeriod.CUSTOM && startDate && endDate) {
      return { startDate, endDate };
    }
    
    switch (timePeriod) {
      case TimePeriod.DAILY:
        start.setDate(start.getDate() - 1);
        break;
      case TimePeriod.WEEKLY:
        start.setDate(start.getDate() - 7);
        break;
      case TimePeriod.MONTHLY:
        start.setMonth(start.getMonth() - 1);
        break;
      case TimePeriod.QUARTERLY:
        start.setMonth(start.getMonth() - 3);
        break;
      case TimePeriod.YEARLY:
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1); // Default to monthly
    }
    
    // Set start to beginning of day and end to end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  }

  /**
   * Generate a sales report
   */
  private async generateSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData> {
    try {
      // Get orders in the date range
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          orderItems: true as any, // Using type assertion for orderItems
        } as any,
      });
      
      // Calculate totals
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Group orders by date
      const ordersByDate = {};
      
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!ordersByDate[date]) {
          ordersByDate[date] = {
            orders: 0,
            revenue: 0,
            tax: 0,
            shipping: 0,
            refunds: 0,
            discount: 0,
          };
        }
        
        ordersByDate[date].orders += 1;
        ordersByDate[date].revenue += order.total;
        ordersByDate[date].tax += order.tax;
        ordersByDate[date].shipping += order.shipping;
        ordersByDate[date].discount += order.discount;
      });
      
      // Get refunds in the date range
      const refunds = await (this.prisma as any).refund.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'APPROVED',
        },
        include: {
          order: true,
        },
      });
      
      // Add refunds to the data
      refunds.forEach(refund => {
        const date = refund.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (ordersByDate[date]) {
          ordersByDate[date].refunds += refund.amount;
        }
      });
      
      // Convert to array and calculate net revenue
      const items = Object.entries(ordersByDate).map(([date, data]) => {
        const { orders, revenue, tax, shipping, refunds, discount } = data as any;
        const netRevenue = revenue - refunds;
        
        return {
          date,
          orders,
          revenue,
          tax,
          shipping,
          refunds,
          discount,
          netRevenue,
        };
      });
      
      // Sort by date
      items.sort((a, b) => a.date.localeCompare(b.date));
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating sales report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a product report
   */
  private async generateProductReport(startDate: Date, endDate: Date): Promise<ProductReportData> {
    try {
      // Get all products with their order items in the date range
      const products = await this.prisma.product.findMany({
        include: {
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      
      // Calculate totals
      const totalProducts = products.length;
      
      // Transform data
      const items = products.map(product => {
        const sold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = product.orderItems.reduce((sum, item) => sum + item.total, 0);
        
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku || undefined,
          category: product.category?.name,
          quantity: product.quantity,
          sold,
          price: product.price,
          revenue,
          // Profit and margin would require cost data, which is not in our model
        };
      });
      
      // Sort by revenue (highest first)
      items.sort((a, b) => b.revenue - a.revenue);
      
      const totalSold = items.reduce((sum, item) => sum + item.sold, 0);
      const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
      
      return {
        totalProducts,
        totalSold,
        totalRevenue,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating product report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a customer report
   */
  private async generateCustomerReport(startDate: Date, endDate: Date): Promise<CustomerReportData> {
    try {
      // Get all users with their orders in the date range
      const users = await this.prisma.user.findMany({
        where: {
          role: 'USER',
        },
        include: {
          orders: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      });
      
      // Calculate totals
      const totalCustomers = users.length;
      const newCustomers = users.filter(
        user => user.createdAt >= startDate && user.createdAt <= endDate
      ).length;
      
      // Transform data
      const items = users.map(user => {
        const totalOrders = user.orders.length;
        const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
        const lastPurchaseDate = user.orders.length > 0
          ? user.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
          : undefined;
        
        return {
          customerId: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
          email: user.email,
          registrationDate: user.createdAt,
          totalOrders,
          totalSpent,
          lastPurchaseDate,
        };
      });
      
      // Sort by total spent (highest first)
      items.sort((a, b) => b.totalSpent - a.totalSpent);
      
      const totalSpent = items.reduce((sum, item) => sum + item.totalSpent, 0);
      const averageLifetimeValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
      
      return {
        totalCustomers,
        newCustomers,
        totalSpent,
        averageLifetimeValue,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating customer report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a category report
   */
  private async generateCategoryReport(startDate: Date, endDate: Date): Promise<CategoryReportData> {
    try {
      // Get all categories with their products and order items
      const categories = await this.prisma.category.findMany({
        include: {
          products: {
            include: {
              orderItems: {
                where: {
                  order: {
                    createdAt: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              },
            },
          },
        },
      });
      
      // Calculate totals
      const totalCategories = categories.length;
      
      // Transform data
      const items = categories.map(category => {
        const productCount = category.products.length;
        let soldCount = 0;
        let revenue = 0;
        
        category.products.forEach(product => {
          soldCount += product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          revenue += product.orderItems.reduce((sum, item) => sum + item.total, 0);
        });
        
        return {
          categoryId: category.id,
          name: category.name,
          productCount,
          soldCount,
          revenue,
          percentageOfTotal: 0, // Will calculate after
        };
      });
      
      // Calculate percentages
      const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
      
      items.forEach(item => {
        item.percentageOfTotal = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
      });
      
      // Sort by revenue (highest first)
      items.sort((a, b) => b.revenue - a.revenue);
      
      return {
        totalCategories,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating category report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a shipping report
   */
  private async generateShippingReport(startDate: Date, endDate: Date): Promise<ShippingReportData> {
    try {
      // Get all orders in the date range with their shipping information
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          shipping: true,
          trackingNumber: true as any, // Using type assertion for trackingNumber
        } as any, // Using type assertion for select
      });
      
      // Calculate totals
      const totalShipments = orders.length;
      const totalShippingCost = orders.reduce((sum, order) => sum + ((order.shipping as any) as number), 0);
      const averageShippingCost = totalShipments > 0 ? totalShippingCost / totalShipments : 0;
      
      // Group by shipping method (this is simplified as we don't have a dedicated shipping method field)
      const shipmentsByMethod = {
        'Standard': {
          count: 0,
          cost: 0,
        },
        'Express': {
          count: 0,
          cost: 0,
        },
        'Free': {
          count: 0,
          cost: 0,
        },
      };
      
      // Simulated classification based on shipping cost
      orders.forEach(order => {
        const shipping = (order.shipping as any) as number; // Using double type assertion for shipping
        if (shipping === 0) {
          shipmentsByMethod['Free'].count += 1;
          shipmentsByMethod['Free'].cost += shipping;
        } else if (shipping > 10) {
          shipmentsByMethod['Express'].count += 1;
          shipmentsByMethod['Express'].cost += shipping;
        } else {
          shipmentsByMethod['Standard'].count += 1;
          shipmentsByMethod['Standard'].cost += shipping;
        }
      });
      
      // Transform data
      const items = Object.entries(shipmentsByMethod).map(([method, data]) => {
        const { count, cost } = data as any;
        const percentage = totalShipments > 0 ? (count / totalShipments) * 100 : 0;
        
        return {
          method,
          count,
          cost,
          percentage,
        };
      });
      
      // Sort by count (highest first)
      items.sort((a, b) => b.count - a.count);
      
      return {
        totalShipments,
        totalShippingCost,
        averageShippingCost,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating shipping report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a tax report
   */
  private async generateTaxReport(startDate: Date, endDate: Date): Promise<TaxReportData> {
    try {
      // Get all orders in the date range with tax information
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          tax: true,
          subTotal: true,
          address: {
            select: {
              state: true,
              country: true,
            },
          } as any, // Using type assertion for address select
        },
      });
      
      // Group by region (state/country)
      const taxByRegion = {};
      
      orders.forEach(order => {
        const address = order.address as any; // Using type assertion for address access
        const region = address 
          ? `${address.country}${address.state ? ` - ${address.state}` : ''}` 
          : 'Unknown';
        
        if (!taxByRegion[region]) {
          taxByRegion[region] = {
            taxableAmount: 0,
            taxCollected: 0,
          };
        }
        
        taxByRegion[region].taxableAmount += order.subTotal;
        taxByRegion[region].taxCollected += order.tax;
      });
      
      // Transform data
      const items = Object.entries(taxByRegion).map(([region, data]) => {
        const { taxableAmount, taxCollected } = data as any;
        const taxRate = taxableAmount > 0 ? (taxCollected / taxableAmount) * 100 : 0;
        
        return {
          region,
          taxRate,
          taxableAmount,
          taxCollected,
        };
      });
      
      // Sort by tax collected (highest first)
      items.sort((a, b) => b.taxCollected - a.taxCollected);
      
      const totalTaxCollected = items.reduce((sum, item) => sum + item.taxCollected, 0);
      
      return {
        totalTaxCollected,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating tax report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate an inventory report
   */
  private async generateInventoryReport(): Promise<InventoryReportData> {
    try {
      // Get all products with their inventory information
      const products = await this.prisma.product.findMany({
        include: {
          category: {
            select: {
              name: true,
            },
          },
          orderItems: true,
        },
      });
      
      // Define thresholds for inventory status
      const LOW_STOCK_THRESHOLD = 5;
      
      // Calculate totals
      const totalProducts = products.length;
      const lowStockProducts = products.filter(
        product => product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD
      ).length;
      const outOfStockProducts = products.filter(product => product.quantity === 0).length;
      
      // Transform data
      const items = products.map(product => {
        const sold = (product as any).sold || product.orderItems.reduce((sum, item) => sum + item.quantity, 0); // Using calculated value if sold not available
        let status = 'In Stock';
        
        if (product.quantity === 0) {
          status = 'Out of Stock';
        } else if (product.quantity <= LOW_STOCK_THRESHOLD) {
          status = 'Low Stock';
        }
        
        const stockValue = product.quantity * product.price;
        
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku || undefined,
          category: product.category?.name,
          quantity: product.quantity,
          sold,
          stockValue,
          status,
        };
      });
      
      // Sort by quantity (lowest first)
      items.sort((a, b) => a.quantity - b.quantity);
      
      return {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating inventory report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a payment report
   */
  private async generatePaymentReport(startDate: Date, endDate: Date): Promise<PaymentReportData> {
    try {
      // Get all payments in the date range
      const payments = await this.prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: PaymentStatus.COMPLETED,
        },
      });
      
      // Group by payment method
      const paymentsByMethod = {};
      
      payments.forEach(payment => {
        if (!paymentsByMethod[payment.method]) {
          paymentsByMethod[payment.method] = {
            count: 0,
            amount: 0,
          };
        }
        
        paymentsByMethod[payment.method].count += 1;
        paymentsByMethod[payment.method].amount += payment.amount;
      });
      
      // Transform data
      const items = Object.entries(paymentsByMethod).map(([method, data]) => {
        const { count, amount } = data as any;
        
        return {
          method,
          count,
          amount,
          percentage: 0, // Will calculate after
          fees: 0, // Would require additional data
        };
      });
      
      // Calculate percentages
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      
      items.forEach(item => {
        item.percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
      });
      
      // Sort by amount (highest first)
      items.sort((a, b) => b.amount - a.amount);
      
      return {
        totalRevenue: totalAmount,
        totalTransactions: payments.length,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating payment report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a returns report
   */
  private async generateReturnsReport(startDate: Date, endDate: Date): Promise<ReturnsReportData> {
    try {
      // Get all refunds in the date range
      const refunds = await (this.prisma as any).refund.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'APPROVED',
        },
      });
      
      // Get total orders in the date range for return rate calculation
      const totalOrders = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      // Group by reason
      const refundsByReason = {};
      
      refunds.forEach(refund => {
        if (!refundsByReason[refund.reason]) {
          refundsByReason[refund.reason] = {
            count: 0,
            amount: 0,
          };
        }
        
        refundsByReason[refund.reason].count += 1;
        refundsByReason[refund.reason].amount += refund.amount;
      });
      
      // Transform data
      const items = Object.entries(refundsByReason).map(([reason, data]) => {
        const { count, amount } = data as any;
        
        return {
          reason,
          count,
          amount,
          percentage: 0, // Will calculate after
        };
      });
      
      // Calculate percentages
      const totalRefunds = refunds.length;
      
      items.forEach(item => {
        item.percentage = totalRefunds > 0 ? (item.count / totalRefunds) * 100 : 0;
      });
      
      // Sort by count (highest first)
      items.sort((a, b) => b.count - a.count);
      
      const totalRefundAmount = items.reduce((sum, item) => sum + item.amount, 0);
      const returnRate = totalOrders > 0 ? (totalRefunds / totalOrders) * 100 : 0;
      
      return {
        totalReturns: totalRefunds,
        totalRefundAmount,
        returnRate,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating returns report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a seller report
   */
  private async generateSellerReport(startDate: Date, endDate: Date): Promise<SellerReportData> {
    try {
      // Get all sellers with their products and order items
      const sellers = await this.prisma.seller.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          products: {
            include: {
              orderItems: {
                where: {
                  order: {
                    createdAt: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              },
            },
          },
        },
      });
      
      // Calculate totals
      const totalSellers = sellers.length;
      
      // Transform data
      const items = sellers.map(seller => {
        const productCount = seller.products.length;
        
        let orderCount = 0;
        let revenue = 0;
        const orderIds = new Set();
        
        seller.products.forEach(product => {
          product.orderItems.forEach(item => {
            revenue += item.total;
            orderIds.add(item.orderId);
          });
        });
        
        orderCount = orderIds.size;
        
        // Assume commission is 10% of revenue
        const commission = revenue * 0.1;
        const netEarnings = revenue - commission;
        
        const name = seller.user
          ? `${seller.user.firstName || ''} ${seller.user.lastName || ''}`.trim() ||
            seller.user.email
          : (seller as any).companyName || 'Unknown Seller'; // Using type assertion for companyName
        
        return {
          sellerId: seller.id,
          name,
          productCount,
          orderCount,
          revenue,
          commission,
          netEarnings,
        };
      });
      
      // Sort by revenue (highest first)
      items.sort((a, b) => b.revenue - a.revenue);
      
      const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
      
      return {
        totalSellers,
        totalRevenue,
        items,
      };
    } catch (error) {
      this.logger.error(`Error generating seller report: ${error.message}`, error.stack);
      throw error;
    }
  }
}
