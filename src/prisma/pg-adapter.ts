import { Pool, QueryResult } from 'pg';
import { Logger } from '@nestjs/common';

/**
 * PostgreSQL adapter that acts as a compatibility layer for the app
 * while bypassing Prisma's dependency on libssl.so.1.1
 */
export class PgAdapter {
  private readonly logger = new Logger(PgAdapter.name);
  private pool: Pool;

  constructor() {
    this.logger.log('Initializing PostgreSQL adapter');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.logger.log('PostgreSQL adapter initialized');
  }

  /**
   * Connects to the database
   */
  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release(); // Release immediately, we just want to verify the connection
      this.logger.log('Successfully connected to PostgreSQL database');
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnects from the database
   */
  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('Successfully disconnected from PostgreSQL database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from PostgreSQL database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const result: QueryResult = await this.pool.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      this.logger.error(`Query error: ${error.message}`);
      this.logger.debug(`Failed SQL: ${sql}`);
      throw error;
    }
  }

  /**
   * Find many records from the specified table
   */
  async findMany<T = any>(table: string, options: {
    where?: Record<string, any>;
    select?: string[];
    orderBy?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
  } = {}): Promise<T[]> {
    try {
      const { where = {}, select = ['*'], orderBy = {}, limit, offset } = options;
      
      // Build SELECT clause
      const selectClause = select.join(', ');
      
      // Build WHERE clause
      const whereConditions = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(where)) {
        // Use quoted column names for case-sensitivity
        const quotedKey = `"${key}"`;
        if (value === null) {
          whereConditions.push(`${quotedKey} IS NULL`);
        } else {
          whereConditions.push(`${quotedKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';
      
      // Build ORDER BY clause
      const orderByItems = Object.entries(orderBy).map(
        ([key, dir]) => `${key} ${dir}`
      );
      const orderByClause = orderByItems.length
        ? `ORDER BY ${orderByItems.join(', ')}`
        : '';
      
      // Build LIMIT and OFFSET clauses
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const offsetClause = offset ? `OFFSET ${offset}` : '';
      
      // Combine everything into the final query
      const sql = `
        SELECT ${selectClause}
        FROM "${table}"
        ${whereClause}
        ${orderByClause}
        ${limitClause}
        ${offsetClause}
      `;
      
      const result = await this.pool.query(sql, values);
      return result.rows as T[];
    } catch (error) {
      this.logger.error(`findMany error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a single record from the specified table
   */
  async findUnique<T = any>(table: string, options: {
    where: Record<string, any>;
    select?: string[];
  }): Promise<T | null> {
    try {
      const results = await this.findMany<T>(table, {
        ...options,
        limit: 1
      });
      
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.error(`findUnique error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a record in the specified table
   */
  async create<T = any>(table: string, options: {
    data: Record<string, any>;
    select?: string[];
  }): Promise<T> {
    try {
      const { data, select = ['*'] } = options;
      
      // Quote column names for case-sensitivity
      const columns = Object.keys(data).map(key => `"${key}"`);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`);
      
      const sql = `
        INSERT INTO "${table}" (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING ${select.join(', ')}
      `;
      
      const result = await this.pool.query(sql, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Failed to create record in table ${table}`);
      }
      
      return result.rows[0] as T;
    } catch (error) {
      this.logger.error(`create error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a record in the specified table
   */
  async update<T = any>(table: string, options: {
    where: Record<string, any>;
    data: Record<string, any>;
    select?: string[];
  }): Promise<T> {
    try {
      const { where, data, select = ['*'] } = options;
      
      // Build SET clause
      const setClauses = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(data)) {
        // Use quoted column names for case-sensitivity
        const quotedKey = `"${key}"`;
        setClauses.push(`${quotedKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
      
      // Build WHERE clause
      const whereConditions = [];
      
      for (const [key, value] of Object.entries(where)) {
        // Use quoted column names for case-sensitivity
        const quotedKey = `"${key}"`;
        if (value === null) {
          whereConditions.push(`${quotedKey} IS NULL`);
        } else {
          whereConditions.push(`${quotedKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      if (whereConditions.length === 0) {
        throw new Error(`Cannot update table ${table} without WHERE conditions`);
      }
      
      const sql = `
        UPDATE "${table}"
        SET ${setClauses.join(', ')}
        WHERE ${whereConditions.join(' AND ')}
        RETURNING ${select.join(', ')}
      `;
      
      const result = await this.pool.query(sql, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Record not found in table ${table} with the given where conditions`);
      }
      
      return result.rows[0] as T;
    } catch (error) {
      this.logger.error(`update error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a record from the specified table
   */
  async delete<T = any>(table: string, options: {
    where: Record<string, any>;
    select?: string[];
  }): Promise<T> {
    try {
      const { where, select = ['*'] } = options;
      
      const whereConditions = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(where)) {
        // Use quoted column names for case-sensitivity
        const quotedKey = `"${key}"`;
        if (value === null) {
          whereConditions.push(`${quotedKey} IS NULL`);
        } else {
          whereConditions.push(`${quotedKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      if (whereConditions.length === 0) {
        throw new Error(`Cannot delete from table ${table} without WHERE conditions`);
      }
      
      const sql = `
        DELETE FROM "${table}"
        WHERE ${whereConditions.join(' AND ')}
        RETURNING ${select.join(', ')}
      `;
      
      const result = await this.pool.query(sql, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Record not found in table ${table} with the given where conditions`);
      }
      
      return result.rows[0] as T;
    } catch (error) {
      this.logger.error(`delete error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Count records in the specified table
   */
  async count(table: string, options: {
    where?: Record<string, any>;
  } = {}): Promise<number> {
    try {
      const { where = {} } = options;
      
      // Build WHERE clause
      const whereConditions = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(where)) {
        // Use quoted column names for case-sensitivity
        const quotedKey = `"${key}"`;
        if (value === null) {
          whereConditions.push(`${quotedKey} IS NULL`);
        } else {
          whereConditions.push(`${quotedKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';
      
      const sql = `
        SELECT COUNT(*) as count
        FROM "${table}"
        ${whereClause}
      `;
      
      const result = await this.pool.query(sql, values);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      this.logger.error(`count error on table ${table}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query with a transaction
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}