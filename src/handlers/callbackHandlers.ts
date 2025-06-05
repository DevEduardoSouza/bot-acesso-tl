import { TelegramTransactionDB } from "@/db/dbTelegramSales";
import { MercadoPago } from "@/service/gatway/MercadoPago";
import { ITransaction } from "@/types/ITransaction";
import TelegramBot from "node-telegram-bot-api";
import { v4 as uuidv4 } from "uuid";

export const callbackHandlers = {
  payment: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    const chatId = query.message?.chat.id;
    const db = new TelegramTransactionDB();
    const user = {
      name: query.from?.first_name,
      username: query.from?.username,
      id: query.from?.id,
    };
    if (!chatId) return;

    // Verifica se o usuário possui uma transação pendente para o produto
    const transaction = db.getTransactionByIdUser(user.id);
    if (transaction) {
      await bot.sendMessage(chatId, "Você possui um pagamento pendente.");
      return;
    }

    // Fluxo de pagamento segue normalmente, não é necessário validar compras já aprovadas

    await bot.sendMessage(chatId, "🔄 Gerando QR Code do Pix...");
    console.log(query);

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      throw new Error(
        "❌ Token de acesso do Mercado Pago não encontrado no arquivo .env."
      );
    }

    const mp = new MercadoPago(token);

    const body = {
      transaction_amount: 33,
      payment_method_id: "pix",
      description: "Pagamento de teste PIX",
      payer: {
        email: "comprador-teste@email.com",
        first_name: "João",
        last_name: "Silva",
        identification: {
          type: "CPF",
          number: "123456789", // Substituir por um CPF válido para testes
        },
      },
    };

    try {
      const response = await mp.createPayment(body);
      const code = response.point_of_interaction?.transaction_data?.qr_code;

      if (!code) {
        console.log("QR Code não foi gerado.");
        return;
      }

      const transaction: ITransaction = {
        id: uuidv4(),
        user_id: user.id,
        price: 10,
        product_id: "test",
        status: "pending",
        quantity: 1,
        timestamp: new Date(),
        qr_code: code,
      };

      db.addTransaction(transaction);

      await bot.sendMessage(chatId, `${code}`);
    } catch (error) {
      console.error("❌ Erro ao gerar QR Code:", error);
      await bot.sendMessage(chatId, "❌ Ocorreu um erro ao gerar o QR Code.");
    }
  },
};
