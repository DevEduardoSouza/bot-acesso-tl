import { keyboards } from "@/config/keyboards";
import { messages } from "@/config/messagesDeafult";
import TelegramBot from "node-telegram-bot-api";


export const messageHandlers = {
  start: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    await bot.sendMessage(msg.chat.id, messages.telegramWelcome, {
      parse_mode: "Markdown",
      reply_markup: keyboards.payment,
    });
  },

  default: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    await bot.sendMessage(
      msg.chat.id,
      "❓ Comando não reconhecido. Use /start."
    );
  },
};
