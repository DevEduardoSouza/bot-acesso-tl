/**
 * Interface que define a estrutura de um pedido/transação
 * Contém todas as informações necessárias para rastreamento e liberação de produtos
 */
export interface IOrder {
  /** ID único do pedido */
  id: string;
  /** ID do usuário que fez o pedido */
  userId: number;
  /** Nome do usuário para referência */
  userName: string;
  /** ID do produto comprado */
  productId: string;
  /** Nome do produto para referência */
  productName: string;
  /** Quantidade comprada */
  quantity: number;
  /** Preço total em centavos */
  totalPrice: number;
  /** Status do pedido */
  status: "pending" | "paid" | "expired" | "cancelled" | "delivered";
  /** ID da transação no Mercado Pago */
  mercadoPagoId?: string;
  /** QR Code gerado para pagamento */
  qrCode?: string;
  /** Link de pagamento do Mercado Pago */
  paymentUrl?: string;
  /** Data de criação do pedido */
  createdAt: Date;
  /** Data de expiração do pedido (10 minutos após criação) */
  expiresAt: Date;
  /** Data de pagamento confirmado */
  paidAt?: Date;
  /** Data de entrega do produto */
  deliveredAt?: Date;
  /** Informações do pagador */
  payer?: {
    email: string;
    firstName: string;
    lastName: string;
    identification: {
      type: string;
      number: string;
    };
  };
}
