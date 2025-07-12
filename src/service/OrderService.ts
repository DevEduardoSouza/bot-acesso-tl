import { IOrder } from "@/types/IOrder";
import { IProduct } from "@/types/IProduct";
import { TelegramTransactionDB } from "@/db/dbTelegramSales";
import { MercadoPago } from "./gatway/MercadoPago";
import { ProductService } from "./ProductService";
import TelegramBot from "node-telegram-bot-api";

/**
 * Serviço responsável por gerenciar pedidos, pagamentos e liberação de produtos
 * Inclui integração com Mercado Pago e validação automática de pagamentos
 */
export class OrderService {
  private db: TelegramTransactionDB;
  private productService: ProductService;
  private mercadoPago: MercadoPago;

  constructor() {
    this.db = new TelegramTransactionDB();
    this.productService = new ProductService();

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      throw new Error("❌ Token do Mercado Pago não configurado");
    }
    this.mercadoPago = new MercadoPago(token);
  }

  /**
   * Cria um novo pedido e gera o pagamento via PIX
   * @param userId - ID do usuário
   * @param userName - Nome do usuário
   * @param productId - ID do produto
   * @param quantity - Quantidade (padrão: 1)
   */
  public async createOrder(
    userId: number,
    userName: string,
    productId: string,
    quantity: number = 1
  ): Promise<{ order: IOrder; qrCode: string; paymentUrl: string }> {
    // Verifica se o produto existe
    const product = this.productService.getProduct(productId);
    if (!product) {
      throw new Error("❌ Produto não encontrado");
    }

    if (product.status !== "active") {
      throw new Error("❌ Produto não está disponível para compra");
    }

    // Verifica se o usuário já tem um pedido pendente para este produto
    const pendingOrders = this.db.getPendingOrdersByUser(userId);
    const hasPendingOrder = pendingOrders.some(
      (order) => order.productId === productId
    );

    if (hasPendingOrder) {
      throw new Error("❌ Você já possui um pedido pendente para este produto");
    }

    // Calcula o preço total
    const totalPrice = product.price * quantity;

    // Cria o pedido no banco
    const orderData: Omit<IOrder, "id" | "createdAt" | "expiresAt"> = {
      userId,
      userName,
      productId,
      productName: product.name,
      quantity,
      totalPrice,
      status: "pending",
    };

    const orderId = await this.db.createOrder(orderData);

    // Gera o pagamento no Mercado Pago
    const paymentData = {
      transaction_amount: totalPrice / 100, // Converte centavos para reais
      payment_method_id: "pix",
      description: `Compra: ${product.name}`,
      payer: {
        email: `user_${userId}@telegram.com`,
        first_name: userName.split(" ")[0] || userName,
        last_name: userName.split(" ").slice(1).join(" ") || "",
        identification: {
          type: "CPF",
          number: "00000000000", // CPF genérico para usuários do Telegram
        },
      },
    };

    try {
      const paymentResponse = await this.mercadoPago.createPayment(paymentData);

      const qrCode =
        paymentResponse.point_of_interaction?.transaction_data?.qr_code;
      const paymentUrl =
        paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64;

      if (!qrCode) {
        throw new Error("❌ Erro ao gerar QR Code do PIX");
      }

      // Atualiza o pedido com as informações do pagamento
      await this.db.updateOrderStatus(
        orderId,
        "pending",
        paymentResponse.id?.toString()
      );

      // Obtém o pedido atualizado
      const order = this.db.getOrderById(orderId);
      if (!order) {
        throw new Error("❌ Erro ao recuperar pedido criado");
      }

      return {
        order,
        qrCode,
        paymentUrl: paymentUrl || qrCode,
      };
    } catch (error) {
      // Se falhar, cancela o pedido
      await this.db.updateOrderStatus(orderId, "cancelled");
      throw error;
    }
  }

  /**
   * Verifica o status de um pagamento e libera o produto se pago
   * @param orderId - ID do pedido
   * @param bot - Instância do bot do Telegram para notificar o usuário
   */
  public async checkPaymentStatus(
    orderId: string,
    bot?: TelegramBot
  ): Promise<boolean> {
    const order = this.db.getOrderById(orderId);
    if (!order) {
      throw new Error("❌ Pedido não encontrado");
    }

    if (order.status !== "pending") {
      return order.status === "paid";
    }

    // Verifica se o pedido expirou
    if (new Date() > new Date(order.expiresAt)) {
      await this.db.updateOrderStatus(orderId, "expired");
      return false;
    }

    // Verifica o status no Mercado Pago
    if (order.mercadoPagoId) {
      try {
        const paymentStatus = await this.mercadoPago.getPaymentStatus(
          order.mercadoPagoId
        );

        if (paymentStatus.status === "approved") {
          // Pagamento aprovado - libera o produto
          await this.db.updateOrderStatus(orderId, "paid", order.mercadoPagoId);

          // Marca como entregue
          await this.db.updateOrderStatus(orderId, "delivered");

          // Notifica o usuário se o bot estiver disponível
          if (bot) {
            await this.deliverProduct(order, bot);
          }

          return true;
        } else if (
          paymentStatus.status === "rejected" ||
          paymentStatus.status === "cancelled"
        ) {
          await this.db.updateOrderStatus(orderId, "cancelled");
          return false;
        }
      } catch (error) {
        console.error("❌ Erro ao verificar status do pagamento:", error);
      }
    }

    return false;
  }

  /**
   * Entrega o produto ao usuário (envia link de download)
   * @param order - Pedido a ser entregue
   * @param bot - Instância do bot do Telegram
   */
  private async deliverProduct(order: IOrder, bot: TelegramBot): Promise<void> {
    const product = this.productService.getProduct(order.productId);
    if (!product) {
      await bot.sendMessage(order.userId, "❌ Erro: Produto não encontrado");
      return;
    }

    const deliveryMessage = `🎉 *Pagamento Confirmado!*

✅ Seu pagamento foi aprovado e o produto foi liberado.

📦 *Produto:* ${product.name}
💰 *Valor:* ${this.productService.formatPrice(order.totalPrice)}
📅 *Data:* ${new Date().toLocaleString("pt-BR")}

🔗 *Link de Download:*
${product.downloadLink}

⚠️ *Importante:*
• Guarde este link com segurança
• O acesso é vitalício
• Em caso de problemas, entre em contato conosco

Obrigado pela compra! 🙏`;

    try {
      await bot.sendMessage(order.userId, deliveryMessage, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error("❌ Erro ao enviar produto:", error);
    }
  }

  /**
   * Obtém pedidos de um usuário
   * @param userId - ID do usuário
   */
  public getUserOrders(userId: number): IOrder[] {
    return this.db.getOrdersByUser(userId, 100); // Get up to 100 orders for the user
  }

  /**
   * Obtém todos os pedidos (para administração)
   * @param limit - Limite de resultados
   */
  public getAllOrders(limit: number = 50): IOrder[] {
    return this.db.getAllOrders(limit);
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
    return this.db.getOrdersByStatus(status, limit);
  }

  /**
   * Formata pedidos para exibição administrativa
   * @param orders - Lista de pedidos
   */
  public formatOrdersForAdmin(orders: IOrder[]): string {
    if (orders.length === 0) {
      return "📋 *Nenhum pedido encontrado.*";
    }

    let message = "📋 *Relatório de Pedidos:*\n\n";

    orders.forEach((order, index) => {
      const status = this.getStatusLabel(order.status);
      const price = this.productService.formatPrice(order.totalPrice);
      const date = new Date(order.createdAt).toLocaleString("pt-BR");

      message += `${index + 1}. *${order.productName}*\n`;
      message += `   👤 ${order.userName} (ID: ${order.userId})\n`;
      message += `   💰 ${price} | 📊 ${status}\n`;
      message += `   📅 ${date}\n`;
      message += `   🆔 \`${order.id}\`\n\n`;
    });

    return message;
  }

  /**
   * Formata pedidos de um usuário para exibição
   * @param orders - Lista de pedidos do usuário
   */
  public formatUserOrders(orders: IOrder[]): string {
    if (orders.length === 0) {
      return "📋 *Você ainda não fez nenhum pedido.*";
    }

    let message = "📋 *Seus Pedidos:*\n\n";

    orders.forEach((order, index) => {
      const status = this.getStatusLabel(order.status);
      const price = this.productService.formatPrice(order.totalPrice);
      const date = new Date(order.createdAt).toLocaleString("pt-BR");

      message += `${index + 1}. *${order.productName}*\n`;
      message += `   💰 ${price} | 📊 ${status}\n`;
      message += `   📅 ${date}\n\n`;
    });

    return message;
  }

  /**
   * Obtém o label do status do pedido
   * @param status - Status do pedido
   */
  private getStatusLabel(status: IOrder["status"]): string {
    const labels = {
      pending: "⏳ Pendente",
      paid: "✅ Pago",
      expired: "⏰ Expirado",
      cancelled: "❌ Cancelado",
      delivered: "📦 Entregue",
    };
    return labels[status] || status;
  }

  /**
   * Expira pedidos antigos (deve ser executado periodicamente)
   */
  public async expireOldOrders(): Promise<number> {
    return await this.db.expireOldOrders();
  }

  /**
   * Verifica todos os pedidos pendentes e processa pagamentos
   * @param bot - Instância do bot do Telegram
   */
  public async processPendingOrders(bot: TelegramBot): Promise<void> {
    const pendingOrders = this.db.getOrdersByStatus("pending");

    for (const order of pendingOrders) {
      try {
        await this.checkPaymentStatus(order.id, bot);
      } catch (error) {
        console.error(`❌ Erro ao processar pedido ${order.id}:`, error);
      }
    }
  }
}
