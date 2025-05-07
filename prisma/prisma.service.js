"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
var common_1 = require("@nestjs/common");
var pg_adapter_1 = require("./pg-adapter");
/**
 * PrismaService provides a database interface compatible with the application
 * while bypassing Prisma's dependency on libssl.so.1.1 by using a direct
 * PostgreSQL adapter.
 */
var PrismaService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PrismaService = _classThis = /** @class */ (function () {
        function PrismaService_1() {
            // Add property for PrismaHealthIndicator compatibility
            this.$extends = { $metrics: { json: { parse: JSON.parse } } };
            this.logger = new common_1.Logger(PrismaService.name);
            this.modelProxies = {};
            this.adapter = new pg_adapter_1.PgAdapter();
            this.logger.log('PrismaService initialized with PostgreSQL adapter');
            this.initializeModelProxies();
        }
        PrismaService_1.prototype.initializeModelProxies = function () {
            // Create proxy objects for all models
            // These proxies will map Prisma-like methods to our PgAdapter methods
            var models = [
                'user', 'product', 'category', 'order', 'orderItem',
                'seller', 'productImage', 'productVariant', 'productVariantAttribute',
                'productAttribute', 'attribute', 'attributeValue', 'brand',
                'payment', 'shipping', 'address', 'review', 'wishlist',
                'cart', 'cartItem', 'notification', 'feedback', 'apiKey',
                'webhook', 'webhookLog', 'coupon', 'usedCoupon', 'couponUser',
                'pointTransaction', 'reportMetadata', 'statusTracking',
                'ticket', 'ticketReply'
            ];
            for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
                var modelName = models_1[_i];
                this.modelProxies[modelName] = this.createModelProxy(modelName);
            }
        };
        PrismaService_1.prototype.createModelProxy = function (tableName) {
            var _this = this;
            // Create a model proxy object with methods compatible with Prisma client
            return {
                findMany: function (args) {
                    if (args === void 0) { args = {}; }
                    return _this.adapter.findMany(tableName, {
                        where: args.where,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined,
                        orderBy: args.orderBy,
                        limit: args.take,
                        offset: args.skip
                    });
                },
                findUnique: function (args) {
                    return _this.adapter.findUnique(tableName, {
                        where: args.where,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined
                    });
                },
                findFirst: function (args) {
                    return _this.adapter.findMany(tableName, {
                        where: args.where,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined,
                        orderBy: args.orderBy,
                        limit: 1
                    }).then(function (results) { return results[0] || null; });
                },
                create: function (args) {
                    return _this.adapter.create(tableName, {
                        data: args.data,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined
                    });
                },
                update: function (args) {
                    return _this.adapter.update(tableName, {
                        where: args.where,
                        data: args.data,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined
                    });
                },
                delete: function (args) {
                    return _this.adapter.delete(tableName, {
                        where: args.where,
                        select: args.select ? Object.keys(args.select).filter(function (k) { return args.select[k]; }) : undefined
                    });
                },
                deleteMany: function (args) {
                    if (args === void 0) { args = {}; }
                    return _this.adapter.transaction(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var records, deletePromises;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.adapter.findMany(tableName, {
                                        where: args.where,
                                        select: ['id'] // Assuming all tables have an id
                                    })];
                                case 1:
                                    records = _a.sent();
                                    if (records.length === 0) {
                                        return [2 /*return*/, { count: 0 }];
                                    }
                                    deletePromises = records.map(function (record) {
                                        return _this.adapter.delete(tableName, { where: { id: record.id } });
                                    });
                                    return [4 /*yield*/, Promise.all(deletePromises)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, { count: records.length }];
                            }
                        });
                    }); });
                },
                count: function (args) {
                    if (args === void 0) { args = {}; }
                    return _this.adapter.count(tableName, {
                        where: args.where
                    });
                }
            };
        };
        Object.defineProperty(PrismaService_1.prototype, "user", {
            // Provide access to model proxies
            get: function () { return this.modelProxies.user; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "product", {
            get: function () { return this.modelProxies.product; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "category", {
            get: function () { return this.modelProxies.category; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "order", {
            get: function () { return this.modelProxies.order; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "orderItem", {
            get: function () { return this.modelProxies.orderItem; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "seller", {
            get: function () { return this.modelProxies.seller; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "productImage", {
            get: function () { return this.modelProxies.productImage; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "productVariant", {
            get: function () { return this.modelProxies.productVariant; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "productVariantAttribute", {
            get: function () { return this.modelProxies.productVariantAttribute; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "productAttribute", {
            get: function () { return this.modelProxies.productAttribute; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "attribute", {
            get: function () { return this.modelProxies.attribute; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "attributeValue", {
            get: function () { return this.modelProxies.attributeValue; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "brand", {
            get: function () { return this.modelProxies.brand; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "payment", {
            get: function () { return this.modelProxies.payment; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "shipping", {
            get: function () { return this.modelProxies.shipping; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "address", {
            get: function () { return this.modelProxies.address; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "review", {
            get: function () { return this.modelProxies.review; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "wishlist", {
            get: function () { return this.modelProxies.wishlist; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "cart", {
            get: function () { return this.modelProxies.cart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "cartItem", {
            get: function () { return this.modelProxies.cartItem; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "notification", {
            get: function () { return this.modelProxies.notification; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "feedback", {
            get: function () { return this.modelProxies.feedback; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "apiKey", {
            get: function () { return this.modelProxies.apiKey; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "webhook", {
            get: function () { return this.modelProxies.webhook; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "webhookLog", {
            get: function () { return this.modelProxies.webhookLog; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "coupon", {
            get: function () { return this.modelProxies.coupon; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "usedCoupon", {
            get: function () { return this.modelProxies.usedCoupon; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "couponUser", {
            get: function () { return this.modelProxies.couponUser; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "pointTransaction", {
            get: function () { return this.modelProxies.pointTransaction; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "reportMetadata", {
            get: function () { return this.modelProxies.reportMetadata; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "statusTracking", {
            get: function () { return this.modelProxies.statusTracking; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "ticket", {
            get: function () { return this.modelProxies.ticket; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PrismaService_1.prototype, "ticketReply", {
            get: function () { return this.modelProxies.ticketReply; },
            enumerable: false,
            configurable: true
        });
        // Raw query execution with support for both string queries and template literals
        PrismaService_1.prototype.$queryRaw = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var firstArg, sql, params, strings, values, rawSql;
                return __generator(this, function (_a) {
                    firstArg = args[0];
                    // If it's a string, treat as regular query
                    if (typeof firstArg === 'string') {
                        sql = args[0], params = args.slice(1);
                        return [2 /*return*/, this.adapter.query(sql, params)];
                    }
                    // If it's TemplateStringsArray, handle as tagged template
                    if (firstArg && typeof firstArg.raw === 'object' && Array.isArray(firstArg.raw)) {
                        strings = Array.from(firstArg);
                        values = args.slice(1);
                        // If there are no parameters, just return the raw SQL
                        if (values.length === 0) {
                            return [2 /*return*/, this.adapter.query(strings.join(''), [])];
                        }
                        rawSql = strings.join('?');
                        return [2 /*return*/, this.adapter.query(rawSql, values)];
                    }
                    // Fallback for other cases
                    throw new Error('Invalid arguments for $queryRaw');
                });
            });
        };
        // Transaction support
        PrismaService_1.prototype.$transaction = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adapter.transaction(callback)];
                });
            });
        };
        // Required for PrismaHealthIndicator
        PrismaService_1.prototype.$connect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adapter.connect()];
                });
            });
        };
        // Required for PrismaHealthIndicator
        PrismaService_1.prototype.$disconnect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adapter.disconnect()];
                });
            });
        };
        // Required for PrismaHealthIndicator
        PrismaService_1.prototype.isConnected = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.adapter.query('SELECT 1', [])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, true];
                        case 2:
                            error_1 = _a.sent();
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // Get model by name (for dynamic access)
        PrismaService_1.prototype.getModel = function (name) {
            return this.modelProxies[name] || null;
        };
        PrismaService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Attempting to connect to the database...');
                            return [4 /*yield*/, this.adapter.connect()];
                        case 1:
                            _a.sent();
                            this.logger.log('Successfully connected to the database');
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error("Failed to connect to the database: ".concat(error_2.message));
                            // Don't rethrow the error to prevent app crash
                            this.logger.warn('Application will continue without database connection');
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PrismaService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.adapter.disconnect()];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error("Error disconnecting from database: ".concat(error_3.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PrismaService_1.prototype.cleanDatabase = function () {
            return __awaiter(this, void 0, void 0, function () {
                var models;
                var _this = this;
                return __generator(this, function (_a) {
                    if (process.env.NODE_ENV === 'production') {
                        throw new Error('Database cleaning is not allowed in production');
                    }
                    models = [
                        'bank',
                        'flash',
                        'notification',
                        'orderSeller',
                        'paymentTransaction',
                        'pointTransaction',
                        'refund',
                        'refundable',
                        'seller',
                        'shippingMethod',
                        'shippingZone',
                        'tag',
                        'ticketDepartment'
                    ];
                    return [2 /*return*/, Promise.all(models.map(function (modelName) {
                            try {
                                var model = _this.getModel(modelName);
                                if (model) {
                                    return model.deleteMany();
                                }
                                else {
                                    _this.logger.warn("Model ".concat(modelName, " not found"));
                                    return Promise.resolve({ count: 0 });
                                }
                            }
                            catch (error) {
                                _this.logger.error("Error deleting from model ".concat(modelName, ": ").concat(error.message));
                                return Promise.resolve({ count: 0 });
                            }
                        }))];
                });
            });
        };
        PrismaService_1.prototype.softDelete = function (modelName, where) {
            return __awaiter(this, void 0, void 0, function () {
                var model;
                return __generator(this, function (_a) {
                    model = this.getModel(modelName);
                    if (!model) {
                        throw new Error("Model ".concat(modelName, " not found"));
                    }
                    return [2 /*return*/, model.update({
                            where: where,
                            data: {
                                deletedAt: new Date(),
                            },
                        })];
                });
            });
        };
        PrismaService_1.prototype.restore = function (modelName, where) {
            return __awaiter(this, void 0, void 0, function () {
                var model;
                return __generator(this, function (_a) {
                    model = this.getModel(modelName);
                    if (!model) {
                        throw new Error("Model ".concat(modelName, " not found"));
                    }
                    return [2 /*return*/, model.update({
                            where: where,
                            data: {
                                deletedAt: null,
                            },
                        })];
                });
            });
        };
        return PrismaService_1;
    }());
    __setFunctionName(_classThis, "PrismaService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PrismaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PrismaService = _classThis;
}();
exports.PrismaService = PrismaService;
