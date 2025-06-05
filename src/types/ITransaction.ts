export interface ITransaction {
  id: string;
  user_id: number;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: Date;
  qr_code: string;
}
