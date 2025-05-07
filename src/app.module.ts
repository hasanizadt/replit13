import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { CacheModule } from './common/cache/cache.module';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { I18nModule } from './i18n/i18n.module';
import { SearchModule } from './common/search/search.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AddressModule } from './address/address.module';
import { AttributesModule } from './attributes/attributes.module';
import { ShippingModule } from './shipping/shipping.module';
import { FeedbackModule } from './feedback/feedback.module';
// Ticket Module commented out temporarily due to missing module
// import { TicketModule } from './ticket/ticket.module';
import { NotificationModule } from './notification/notification.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { WebhookModule } from './webhook/webhook.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CouponModule } from './coupon/coupon.module';
import { StatusTrackingModule } from './status-tracking/status-tracking.module';
import { appConfig } from './config/app.config';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    CoreModule,
    PrismaModule,
    LoggerModule,
    CacheModule,

    // Infrastructure Modules
    // Use our custom ThrottlerModule
    ThrottlerModule,
    ScheduleModule.forRoot(),
    TerminusModule,
    I18nModule,
    SearchModule,

    // Authentication and User Management
    AuthModule,
    UserModule,

    // Product and Catalog Management
    CategoryModule,
    ProductModule,
    BrandModule,
    AttributesModule,

    // Order and Cart Management
    OrderModule,
    CartModule,

    // Customer Features
    AddressModule,
    ShippingModule,
    FeedbackModule,
    // TicketModule, // Commented out temporarily due to missing module

    // Developer Tools
    ApiKeyModule,
    WebhookModule,

    // Analytics and Reporting
    AnalyticsModule,

    // Real-time Features
    NotificationModule,
    CouponModule,
    StatusTrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}