"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgAdapter = void 0;
var pg_1 = require("pg");
var common_1 = require("@nestjs/common");
/**
 * PostgreSQL adapter that acts as a compatibility layer for the app
 * while bypassing Prisma's dependency on libssl.so.1.1
 */
var PgAdapter = /** @class */ (function () {
    function PgAdapter() {
        this.logger = new common_1.Logger(PgAdapter.name);
        this.logger.log('Initializing PostgreSQL adapter');
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        this.logger.log('PostgreSQL adapter initialized');
    }
    /**
     * Connects to the database
     */
    PgAdapter.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        client.release(); // Release immediately, we just want to verify the connection
                        this.logger.log('Successfully connected to PostgreSQL database');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Failed to connect to PostgreSQL database: ".concat(error_1.message));
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnects from the database
     */
    PgAdapter.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.end()];
                    case 1:
                        _a.sent();
                        this.logger.log('Successfully disconnected from PostgreSQL database');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Failed to disconnect from PostgreSQL database: ".concat(error_2.message));
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a raw SQL query
     */
    PgAdapter.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var result, error_3;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.query(sql, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error("Query error: ".concat(error_3.message));
                        this.logger.debug("Failed SQL: ".concat(sql));
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find many records from the specified table
     */
    PgAdapter.prototype.findMany = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options) {
            var _a, where, _b, select, _c, orderBy, limit, offset, selectClause, whereConditions, values, paramCount, _i, _d, _e, key, value, quotedKey, whereClause, orderByItems, orderByClause, limitClause, offsetClause, sql, result, error_4;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        _a = options.where, where = _a === void 0 ? {} : _a, _b = options.select, select = _b === void 0 ? ['*'] : _b, _c = options.orderBy, orderBy = _c === void 0 ? {} : _c, limit = options.limit, offset = options.offset;
                        selectClause = select.join(', ');
                        whereConditions = [];
                        values = [];
                        paramCount = 1;
                        for (_i = 0, _d = Object.entries(where); _i < _d.length; _i++) {
                            _e = _d[_i], key = _e[0], value = _e[1];
                            quotedKey = "\"".concat(key, "\"");
                            if (value === null) {
                                whereConditions.push("".concat(quotedKey, " IS NULL"));
                            }
                            else {
                                whereConditions.push("".concat(quotedKey, " = $").concat(paramCount));
                                values.push(value);
                                paramCount++;
                            }
                        }
                        whereClause = whereConditions.length
                            ? "WHERE ".concat(whereConditions.join(' AND '))
                            : '';
                        orderByItems = Object.entries(orderBy).map(function (_a) {
                            var key = _a[0], dir = _a[1];
                            return "".concat(key, " ").concat(dir);
                        });
                        orderByClause = orderByItems.length
                            ? "ORDER BY ".concat(orderByItems.join(', '))
                            : '';
                        limitClause = limit ? "LIMIT ".concat(limit) : '';
                        offsetClause = offset ? "OFFSET ".concat(offset) : '';
                        sql = "\n        SELECT ".concat(selectClause, "\n        FROM \"").concat(table, "\"\n        ").concat(whereClause, "\n        ").concat(orderByClause, "\n        ").concat(limitClause, "\n        ").concat(offsetClause, "\n      ");
                        return [4 /*yield*/, this.pool.query(sql, values)];
                    case 1:
                        result = _f.sent();
                        return [2 /*return*/, result.rows];
                    case 2:
                        error_4 = _f.sent();
                        this.logger.error("findMany error on table ".concat(table, ": ").concat(error_4.message));
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find a single record from the specified table
     */
    PgAdapter.prototype.findUnique = function (table, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.findMany(table, __assign(__assign({}, options), { limit: 1 }))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.length > 0 ? results[0] : null];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error("findUnique error on table ".concat(table, ": ").concat(error_5.message));
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a record in the specified table
     */
    PgAdapter.prototype.create = function (table, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a, select, columns, values, placeholders, sql, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        data = options.data, _a = options.select, select = _a === void 0 ? ['*'] : _a;
                        columns = Object.keys(data).map(function (key) { return "\"".concat(key, "\""); });
                        values = Object.values(data);
                        placeholders = values.map(function (_, i) { return "$".concat(i + 1); });
                        sql = "\n        INSERT INTO \"".concat(table, "\" (").concat(columns.join(', '), ")\n        VALUES (").concat(placeholders.join(', '), ")\n        RETURNING ").concat(select.join(', '), "\n      ");
                        return [4 /*yield*/, this.pool.query(sql, values)];
                    case 1:
                        result = _b.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Failed to create record in table ".concat(table));
                        }
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_6 = _b.sent();
                        this.logger.error("create error on table ".concat(table, ": ").concat(error_6.message));
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update a record in the specified table
     */
    PgAdapter.prototype.update = function (table, options) {
        return __awaiter(this, void 0, void 0, function () {
            var where, data, _a, select, setClauses, values, paramCount, _i, _b, _c, key, value, quotedKey, whereConditions, _d, _e, _f, key, value, quotedKey, sql, result, error_7;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        where = options.where, data = options.data, _a = options.select, select = _a === void 0 ? ['*'] : _a;
                        setClauses = [];
                        values = [];
                        paramCount = 1;
                        for (_i = 0, _b = Object.entries(data); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], value = _c[1];
                            quotedKey = "\"".concat(key, "\"");
                            setClauses.push("".concat(quotedKey, " = $").concat(paramCount));
                            values.push(value);
                            paramCount++;
                        }
                        whereConditions = [];
                        for (_d = 0, _e = Object.entries(where); _d < _e.length; _d++) {
                            _f = _e[_d], key = _f[0], value = _f[1];
                            quotedKey = "\"".concat(key, "\"");
                            if (value === null) {
                                whereConditions.push("".concat(quotedKey, " IS NULL"));
                            }
                            else {
                                whereConditions.push("".concat(quotedKey, " = $").concat(paramCount));
                                values.push(value);
                                paramCount++;
                            }
                        }
                        if (whereConditions.length === 0) {
                            throw new Error("Cannot update table ".concat(table, " without WHERE conditions"));
                        }
                        sql = "\n        UPDATE \"".concat(table, "\"\n        SET ").concat(setClauses.join(', '), "\n        WHERE ").concat(whereConditions.join(' AND '), "\n        RETURNING ").concat(select.join(', '), "\n      ");
                        return [4 /*yield*/, this.pool.query(sql, values)];
                    case 1:
                        result = _g.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Record not found in table ".concat(table, " with the given where conditions"));
                        }
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_7 = _g.sent();
                        this.logger.error("update error on table ".concat(table, ": ").concat(error_7.message));
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a record from the specified table
     */
    PgAdapter.prototype.delete = function (table, options) {
        return __awaiter(this, void 0, void 0, function () {
            var where, _a, select, whereConditions, values, paramCount, _i, _b, _c, key, value, quotedKey, sql, result, error_8;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        where = options.where, _a = options.select, select = _a === void 0 ? ['*'] : _a;
                        whereConditions = [];
                        values = [];
                        paramCount = 1;
                        for (_i = 0, _b = Object.entries(where); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], value = _c[1];
                            quotedKey = "\"".concat(key, "\"");
                            if (value === null) {
                                whereConditions.push("".concat(quotedKey, " IS NULL"));
                            }
                            else {
                                whereConditions.push("".concat(quotedKey, " = $").concat(paramCount));
                                values.push(value);
                                paramCount++;
                            }
                        }
                        if (whereConditions.length === 0) {
                            throw new Error("Cannot delete from table ".concat(table, " without WHERE conditions"));
                        }
                        sql = "\n        DELETE FROM \"".concat(table, "\"\n        WHERE ").concat(whereConditions.join(' AND '), "\n        RETURNING ").concat(select.join(', '), "\n      ");
                        return [4 /*yield*/, this.pool.query(sql, values)];
                    case 1:
                        result = _d.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Record not found in table ".concat(table, " with the given where conditions"));
                        }
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_8 = _d.sent();
                        this.logger.error("delete error on table ".concat(table, ": ").concat(error_8.message));
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Count records in the specified table
     */
    PgAdapter.prototype.count = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options) {
            var _a, where, whereConditions, values, paramCount, _i, _b, _c, key, value, quotedKey, whereClause, sql, result, error_9;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = options.where, where = _a === void 0 ? {} : _a;
                        whereConditions = [];
                        values = [];
                        paramCount = 1;
                        for (_i = 0, _b = Object.entries(where); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], value = _c[1];
                            quotedKey = "\"".concat(key, "\"");
                            if (value === null) {
                                whereConditions.push("".concat(quotedKey, " IS NULL"));
                            }
                            else {
                                whereConditions.push("".concat(quotedKey, " = $").concat(paramCount));
                                values.push(value);
                                paramCount++;
                            }
                        }
                        whereClause = whereConditions.length
                            ? "WHERE ".concat(whereConditions.join(' AND '))
                            : '';
                        sql = "\n        SELECT COUNT(*) as count\n        FROM \"".concat(table, "\"\n        ").concat(whereClause, "\n      ");
                        return [4 /*yield*/, this.pool.query(sql, values)];
                    case 1:
                        result = _d.sent();
                        return [2 /*return*/, parseInt(result.rows[0].count, 10)];
                    case 2:
                        error_9 = _d.sent();
                        this.logger.error("count error on table ".concat(table, ": ").concat(error_9.message));
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a raw SQL query with a transaction
     */
    PgAdapter.prototype.transaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, 8, 9]);
                        return [4 /*yield*/, client.query('BEGIN')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, callback(client)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, client.query('COMMIT')];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_10 = _a.sent();
                        return [4 /*yield*/, client.query('ROLLBACK')];
                    case 7:
                        _a.sent();
                        throw error_10;
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return PgAdapter;
}());
exports.PgAdapter = PgAdapter;
