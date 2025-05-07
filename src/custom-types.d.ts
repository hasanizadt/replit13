// Custom type declarations to help TypeScript recognize NestJS modules
declare module '@nestjs/common' {
  export const Injectable: any;
  export const Logger: any;
  export const ValidationPipe: any;
  export const Controller: any;
  export const Get: any;
  export const OnModuleInit: any;
  export type OnModuleInit = any;
  export const OnModuleDestroy: any;
  export type OnModuleDestroy = any;
  export const Module: any;
  export const Global: any;
  export const Inject: any;
  export const UseGuards: any;
  export const NotFoundException: any;
  export const ConflictException: any;
  export const BadRequestException: any;
  export const NestInterceptor: any;
  export type NestInterceptor = any;
  export const ExecutionContext: any;
  export type ExecutionContext = any;
  export const CallHandler: any;
  export type CallHandler = any;
  export const HttpException: any;
  export const HttpStatus: any;
  export const CanActivate: any;
  export type CanActivate = any;
  export const SetMetadata: any;
  export const UseInterceptors: any;
  export const Req: any;
  export const Post: any;
  export const Body: any;
  export const Query: any;
  export const Param: any;
  export const Headers: any;
  export const UseFilters: any;
  export const Catch: any;
  export const ArgumentsHost: any;
  export type ArgumentsHost = any;
  export const ExceptionFilter: any;
  export type ExceptionFilter = any;
  export const HttpCode: any;
  export const Delete: any;
  export const Put: any;
  export const Patch: any;
  export const Optional: any;
  export const ParseIntPipe: any;
  export const ParseBoolPipe: any;
  export const ParseArrayPipe: any;
  export const Res: any;
  export const UnauthorizedException: any;
  export const ForbiddenException: any;
  export const InternalServerErrorException: any;
  export const Request: any;
  export const Response: any;
  export const Next: any;
  export const NestFactory: any;
  export const APP_GUARD: any;
  export const APP_INTERCEPTOR: any;
  export const APP_FILTER: any;
  export const APP_PIPE: any;
  export const Type: any;
  export const PipeTransform: any;
  export type PipeTransform = any;
  export const ArgumentMetadata: any;
  export type ArgumentMetadata = any;
  export const UseClass: any;
  export const DynamicModule: any;
  export const InjectableOptions: any;
  export const ModuleMetadata: any;
  export const MiddlewareConsumer: any;
  export type MiddlewareConsumer = any;
  export const NestMiddleware: any;
  export type NestMiddleware = any;
  export const forwardRef: any;
  export const LoggerService: any;
  export interface LoggerService {}
  
  export interface ValidationError {
    property: string;
    constraints?: Record<string, string>;
    children?: ValidationError[];
    target?: object;
    value?: any;
    message?: string;
    context?: any;
  }
}

declare module '@nestjs/core' {
  export class Reflector {
    get<T>(metadataKey: string, target: object): T;
    getAllAndOverride<T>(metadataKey: string, targets: object[]): T;
    getAllAndMerge<T>(metadataKey: string, targets: object[]): T[];
  }
  
  export const NestFactory: {
    create(module: any, options?: any): Promise<any>;
  };

  export const APP_GUARD: unique symbol;
  export const APP_INTERCEPTOR: unique symbol;
  export const APP_FILTER: unique symbol;
  export const APP_PIPE: unique symbol;
}

declare module '@nestjs/config' {
  export class ConfigService {
    get<T = any>(propertyPath: string, defaultValue?: any): T;
    getOrThrow<T = any>(propertyPath: string): T;
  }
  export const ConfigModule: {
    forRoot(options?: any): any;
    forFeature(factory: any): any;
  };
  export const ConfigFactory: any;
  export const registerAs: any;
}

declare module '@nestjs/terminus' {
  export const HealthCheck: any;
  export const HealthCheckService: any;
  export type HealthCheckService = any;
  export const HttpHealthIndicator: any;
  export type HttpHealthIndicator = any;
  export const PrismaHealthIndicator: any;
  export type PrismaHealthIndicator = any;
  export const MemoryHealthIndicator: any;
  export type MemoryHealthIndicator = any;
  export const DiskHealthIndicator: any;
  export type DiskHealthIndicator = any;
  export const TerminusModule: any;
}

declare module 'nestjs-i18n' {
  export const I18nModule: any;
  export class I18nService {
    translate(key: string, options?: any): string;
    t(key: string, options?: any): string;
  }
  export const AcceptLanguageResolver: any;
  export const HeaderResolver: any;
  export const QueryResolver: any;
  
  // Define Path type constructor
  export type Path<T> = any;
  export const Path: any;
}

declare module '@nestjs/schedule' {
  export const Cron: any;
  export const CronExpression: any;
  export const Interval: any;
  export const Timeout: any;
  export const ScheduleModule: any;
}

declare module '@nestjs/graphql' {
  export const Field: any;
  export const ObjectType: any;
  export const InputType: any;
  export const Args: any;
  export const Query: any;
  export const Mutation: any;
  export const Resolver: any;
  export const Context: any;
  export const Info: any;
  export const ResolveField: any;
  export const Parent: any;
  export const ID: any;
  export const Int: any;
  export const Float: any;
  export const registerEnumType: any;
  
  // Improved GraphQLModule definition
  export class GraphQLModule {
    static forRoot<T = any>(options?: T): any;
  }
  
  // Add GqlExecutionContext for auth.guard.ts
  export const GqlExecutionContext: {
    create(context: any): {
      getContext(): any;
      getArgs(): any;
      getInfo(): any;
      getRoot(): any;
    };
  };
}

declare module '@nestjs/jwt' {
  export const JwtModule: {
    register(options?: any): any;
    registerAsync(options?: any): any;
  };
  export class JwtService {
    constructor(options?: any);
    sign(payload: any, options?: any): string;
    verify(token: string, options?: any): any;
    verifyAsync(token: string, options?: any): Promise<any>;
    decode(token: string, options?: any): any;
  }
}

declare module '@nestjs/passport' {
  export const PassportModule: any;
  export const PassportStrategy: any;
  export const AuthGuard: any;
}

declare module 'uuid' {
  export const v4: () => string;
}

declare module 'fs' {
  export const accessSync: any;
  export const constants: any;
  export const existsSync: any;
  export const mkdirSync: any;
}

// Third-party libraries
declare module 'class-validator' {
  export const IsString: any;
  export const IsOptional: any;
  export const IsInt: any;
  export const Min: any;
  export const Max: any;
  export const IsEnum: any;
  export const IsBoolean: any;
  export const IsNumber: any;
  export const IsDate: any;
  export const IsDateString: any;
  export const IsEmail: any;
  export const IsUUID: any;
  export const IsNotEmpty: any;
  export const Length: any;
  export const MinLength: any;
  export const MaxLength: any;
  export const Matches: any;
  export const IsUrl: any;
  export const IsPositive: any;
  export const IsNegative: any;
  export const IsArray: any;
  export const ArrayMinSize: any;
  export const ArrayMaxSize: any;
  export const IsAlpha: any;
  export const IsAlphanumeric: any;
  export const IsFQDN: any;
  export const IsIP: any;
  export const IsMilitaryTime: any;
  export const IsObject: any;
  export const ValidateNested: any;
  export const Contains: any;
  export const Allow: any;
  export const ValidateIf: any;
}

declare module '@nestjs/throttler' {
  export const ThrottlerModule: {
    forRoot(options?: any): any;
    forRootAsync(options?: any): any;
  };
  export const ThrottlerGuard: any;
}

declare module '@nestjs/apollo' {
  export interface ApolloDriverConfig {
    // Basic options
    typePaths?: string[];
    typeDefs?: any;
    resolvers?: any[];
    directiveResolvers?: any;
    driver?: any;
    path?: string;
    subscriptions?: any;
    definitions?: any;
    context?: any;
    uploads?: any;
    
    // Advanced options
    playground?: boolean | any;
    debug?: boolean;
    introspection?: boolean;
    cors?: boolean | any;
    bodyParserConfig?: any;
    installSubscriptionHandlers?: boolean;
    includeStacktraceInErrorResponses?: boolean;
    formatError?: (error: any) => any;
    transformSchema?: (schema: any) => any;
    transformAutoSchemaFile?: boolean;
    autoSchemaFile?: boolean | string;
    sortSchema?: boolean;
    fieldResolverEnhancers?: string[];
    cache?: boolean | any;
    persistedQueries?: boolean | any;
    buildSchemaOptions?: any;
    csrfPrevention?: boolean;
  }

  export const ApolloDriver: any;
}

declare module '@nestjs/cache-manager' {
  export interface CacheModuleAsyncOptions<T = any> {
    imports?: any[];
    useFactory?: (...args: any[]) => Promise<any> | any;
    inject?: any[];
    useClass?: any;
    useExisting?: any;
    extraProviders?: any[];
  }

  export const CacheModule: {
    register(options?: any): any;
    registerAsync(options?: CacheModuleAsyncOptions): any;
  };
  
  export const CACHE_MANAGER: string | symbol;
}

// Global declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;