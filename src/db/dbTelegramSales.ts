import { ITransaction } from "@/types/ITransaction";
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

export class TelegramTransactionDB {
  private db: DatabaseType;

  constructor() {
    this.db = new Database("transactions.db");
    this.createTable();
  }

  private createTable(): void {
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
  }

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

  public getAllTransactions(): any[] {
    return this.db.prepare(`SELECT * FROM transactions`).all();
  }

  public getTransactionByIdUser(userId: number) {
    const transaction = this.db
      .prepare(
        "SELECT * FROM transactions WHERE user_id = ? AND status = 'pending'"
      )
      .get(userId);

    if (!transaction) return null;

    return transaction;
  }
}
