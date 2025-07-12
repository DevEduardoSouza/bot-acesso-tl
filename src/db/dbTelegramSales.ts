import { ITransaction } from "@/types/ITransaction";
import { IProduct } from "@/types/IProduct";
import { IOrder } from "@/types/IOrder";
import { IAdmin } from "@/types/IAdmin";
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

/**
 * Classe responsável por gerenciar todas as operações de banco de dados
 * Inclui tabelas para transações, produtos, pedidos e administradores
 */
export class TelegramTransactionDB {
  private db: DatabaseType;

  constructor() {
    this.db = new Database("bot_acesso.db");
    this.createTables();
  }

  /**
   * Cria todas as tabelas necessárias para o funcionamento do sistema
   * Inclui tabelas para transações, produtos, pedidos e administradores
   */
  private createTables(): void {
    // Tabela de transações (mantida para compatibilidade)
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER,
          quantity INTEGER,
          price REAL,
          status TEXT DEFAULT 'pending',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          qr_code TEXT
        )`
      )
      .run();

    // Tabela de produtos digitais
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price INTEGER NOT NULL,
          download_link TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER NOT NULL
        )`
      )
      .run();

    // Tabela de pedidos/transações
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          user_name TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          total_price INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          mercado_pago_id TEXT,
          qr_code TEXT,
          payment_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          paid_at DATETIME,
          delivered_at DATETIME,
          payer_email TEXT,
          payer_first_name TEXT,
          payer_last_name TEXT,
          payer_identification_type TEXT,
          payer_identification_number TEXT
        )`
      )
      .run();

    // Tabela de administradores
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          role TEXT DEFAULT 'admin',
          status TEXT DEFAULT 'active'
        )`
      )
      .run();

    // Índices para melhor performance
    this.db
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`
      )
      .run();
    this.db
      .prepare(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`)
      .run();
    this.db
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`
      )
      .run();
    this.db
      .prepare(
        `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`
      )
      .run();
    this.db
      .prepare(`CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id)`)
      .run();
  }

  // ==================== MÉTODOS PARA PRODUTOS ====================

  /**
   * Adiciona um novo produto ao catálogo
   * @param product - Produto a ser adicionado
   */
  public async addProduct(
    product: Omit<IProduct, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO products (id, name, description, price, download_link, type, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      product.name,
      product.description,
      product.price,
      product.downloadLink,
      product.type,
      product.status,
      product.createdBy
    );
    return id;
  }

  /**
   * Remove um produto do catálogo
   * @param productId - ID do produto a ser removido
   */
  public async deleteProduct(productId: string): Promise<boolean> {
    const stmt = this.db.prepare(`DELETE FROM products WHERE id = ?`);
    const result = stmt.run(productId);
    return result.changes > 0;
  }

  /**
   * Obtém todos os produtos ativos
   */
  public getAllActiveProducts(): IProduct[] {
    return this.db
      .prepare(
        `SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC`
      )
      .all() as IProduct[];
  }

  /**
   * Obtém um produto específico por ID
   * @param productId - ID do produto
   */
  public getProductById(productId: string): IProduct | null {
    const product = this.db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .get(productId) as IProduct | undefined;
    return product || null;
  }

  /**
   * Atualiza um produto existente
   * @param productId - ID do produto
   * @param updates - Campos a serem atualizados
   */
  public async updateProduct(
    productId: string,
    updates: Partial<IProduct>
  ): Promise<boolean> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "createdAt"
    );
    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => (updates as any)[field]);
    values.push(new Date().toISOString()); // updated_at
    values.push(productId);

    const stmt = this.db.prepare(`
      UPDATE products 
      SET ${setClause}, updated_at = ? 
      WHERE id = ?
    `);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  // ==================== MÉTODOS PARA PEDIDOS ====================

  /**
   * Cria um novo pedido
   * @param order - Pedido a ser criado
   */
  public async createOrder(
    order: Omit<IOrder, "id" | "createdAt" | "expiresAt">
  ): Promise<string> {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const stmt = this.db.prepare(`
      INSERT INTO orders (
        id, user_id, user_name, product_id, product_name, quantity, total_price, 
        status, mercado_pago_id, qr_code, payment_url, expires_at,
        payer_email, payer_first_name, payer_last_name, 
        payer_identification_type, payer_identification_number
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      order.userId,
      order.userName,
      order.productId,
      order.productName,
      order.quantity,
      order.totalPrice,
      order.status,
      order.mercadoPagoId,
      order.qrCode,
      order.paymentUrl,
      expiresAt.toISOString(),
      order.payer?.email,
      order.payer?.firstName,
      order.payer?.lastName,
      order.payer?.identification.type,
      order.payer?.identification.number
    );

    return id;
  }

  /**
   * Atualiza o status de um pedido
   * @param orderId - ID do pedido
   * @param status - Novo status
   * @param mercadoPagoId - ID da transação no Mercado Pago (opcional)
   */
  public async updateOrderStatus(
    orderId: string,
    status: IOrder["status"],
    mercadoPagoId?: string
  ): Promise<boolean> {
    let stmt: any;
    let params: any[];

    if (status === "paid") {
      stmt = this.db.prepare(`
        UPDATE orders 
        SET status = ?, paid_at = ?, mercado_pago_id = ?
        WHERE id = ?
      `);
      params = [status, new Date().toISOString(), mercadoPagoId, orderId];
    } else if (status === "delivered") {
      stmt = this.db.prepare(`
        UPDATE orders 
        SET status = ?, delivered_at = ?
        WHERE id = ?
      `);
      params = [status, new Date().toISOString(), orderId];
    } else {
      stmt = this.db.prepare(`UPDATE orders SET status = ? WHERE id = ?`);
      params = [status, orderId];
    }

    const result = stmt.run(...params);
    return result.changes > 0;
  }

  /**
   * Obtém um pedido por ID
   * @param orderId - ID do pedido
   */
  public getOrderById(orderId: string): IOrder | null {
    const order = this.db
      .prepare(`SELECT * FROM orders WHERE id = ?`)
      .get(orderId) as IOrder | undefined;
    return order || null;
  }

  /**
   * Obtém pedidos pendentes de um usuário
   * @param userId - ID do usuário
   */
  public getPendingOrdersByUser(userId: number): IOrder[] {
    return this.db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE user_id = ? AND status = 'pending' AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `
      )
      .all(userId) as IOrder[];
  }

  /**
   * Obtém todos os pedidos (para administração)
   * @param limit - Limite de resultados (padrão: 50)
   */
  public getAllOrders(limit: number = 50): IOrder[] {
    return this.db
      .prepare(
        `
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT ?
    `
      )
      .all(limit) as IOrder[];
  }

  /**
   * Obtém pedidos por status
   * @param status - Status dos pedidos
   * @param limit - Limite de resultados
   */
  public getOrdersByStatus(
    status: IOrder["status"],
    limit: number = 50
  ): IOrder[] {
    return this.db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE status = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
      )
      .all(status, limit) as IOrder[];
  }

  /**
   * Obtém todos os pedidos de um usuário
   * @param userId - ID do usuário
   * @param limit - Limite de resultados
   */
  public getOrdersByUser(userId: number, limit: number = 50): IOrder[] {
    return this.db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
      )
      .all(userId, limit) as IOrder[];
  }

  /**
   * Expira pedidos antigos (executar periodicamente)
   */
  public async expireOldOrders(): Promise<number> {
    const stmt = this.db.prepare(`
      UPDATE orders 
      SET status = 'expired' 
      WHERE status = 'pending' AND expires_at <= datetime('now')
    `);
    const result = stmt.run();
    return result.changes;
  }

  // ==================== MÉTODOS PARA ADMINISTRADORES ====================

  /**
   * Adiciona um novo administrador
   * @param admin - Administrador a ser adicionado
   * @param adminId - ID do administrador (opcional, será gerado se não fornecido)
   */
  public async addAdmin(
    admin: Omit<IAdmin, "id" | "createdAt">,
    adminId?: number
  ): Promise<number> {
    const id = adminId || Math.floor(Math.random() * 1000000000);
    const stmt = this.db.prepare(`
      INSERT INTO admins (id, name, username, role, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      id,
      admin.name,
      admin.username,
      admin.role,
      admin.status
    );
    return id;
  }

  /**
   * Verifica se um usuário é administrador
   * @param userId - ID do usuário
   */
  public isAdmin(userId: number): boolean {
    const admin = this.db
      .prepare(
        `
      SELECT * FROM admins 
      WHERE id = ? AND status = 'active'
    `
      )
      .get(userId) as IAdmin | undefined;
    return !!admin;
  }

  /**
   * Obtém todos os administradores
   */
  public getAllAdmins(): IAdmin[] {
    return this.db
      .prepare(`SELECT * FROM admins ORDER BY created_at DESC`)
      .all() as IAdmin[];
  }

  /**
   * Remove um administrador
   * @param adminId - ID do administrador
   */
  public async removeAdmin(adminId: number): Promise<boolean> {
    const stmt = this.db.prepare(`DELETE FROM admins WHERE id = ?`);
    const result = stmt.run(adminId);
    return result.changes > 0;
  }

  // ==================== MÉTODOS LEGACY (COMPATIBILIDADE) ====================

  /**
   * @deprecated Use createOrder instead
   */
  public async addTransaction(transaction: ITransaction): Promise<void> {
    const {
      id,
      price,
      product_id,
      qr_code,
      quantity,
      status,
      timestamp,
      user_id,
    } = transaction;

    console.log(typeof id, typeof user_id, typeof price, typeof qr_code);

    const stmt = this.db.prepare(`
      INSERT INTO transactions (id, user_id, price, qr_code)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, user_id, price, qr_code);
  }

  /**
   * @deprecated Use getPendingOrdersByUser instead
   */
  public getAllTransactions(): any[] {
    return this.db.prepare(`SELECT * FROM transactions`).all() as any[];
  }

  /**
   * @deprecated Use getPendingOrdersByUser instead
   */
  public getTransactionByIdUser(userId: number) {
    const transaction = this.db
      .prepare(
        "SELECT * FROM transactions WHERE user_id = ? AND status = 'pending'"
      )
      .get(userId) as any;

    if (!transaction) return null;

    return transaction;
  }
}
