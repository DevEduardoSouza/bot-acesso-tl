import dotenv from "dotenv";
dotenv.config();

import { MercadoPago } from "./service/gatway/MercadoPago";
import TelegramBot from "node-telegram-bot-api";
import { Telegram } from "./service/bot/Telegram";
import { messages } from "./config/messagesDeafult";
import { keyboards, markdownConfig } from "./config/keyboards";
import { TelegramTransactionDB } from "./db/dbTelegramSales";

async function main() {
  //   const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  //   if (!token) {
  //     throw new Error(
  //       "❌ Token de acesso do Mercado Pago não encontrado no .env"
  //     );
  //   }

  //   const mp = new MercadoPago(token);

  //   const body = {
  //     transaction_amount: 100,
  //     payment_method_id: "pix",
  //     description: "Pagamento de teste PIX",
  //     payer: {
  //       email: "comprador-teste@email.com",
  //       first_name: "João",
  //       last_name: "Silva",
  //       identification: {
  //         type: "CPF",
  //         number: "1234567809",
  //       },
  //     },
  //   };

  try {
    const token = process.env.TELEGRAM_TOKEN || "";
    const tl = new Telegram(token);
  } catch (error) {
    console.error("❌ Erro ao criar o pagamento:", error);
  }
}

main();
