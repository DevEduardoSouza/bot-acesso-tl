import { messages } from "@/config/messagesDeafult";
import { callbackHandlers } from "@/handlers/callbackHandlers";
import { messageHandlers } from "@/handlers/messageHandlers";
import TelegramBot from "node-telegram-bot-api";

export class Telegram {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });

    this.setupListeners();
  }

  private setupListeners() {
    this.bot.onText(/^\/start$/, (msg) => {
      messageHandlers.start(this.bot, msg);
    });

    this.bot.on("message", (msg) => {
      if (!msg.text?.startsWith("/")) {
        messageHandlers.default(this.bot, msg);
      }
    });

    this.bot.on("callback_query", (query) => {
      const action = query.data || "";
      const handler = callbackHandlers[action as keyof typeof callbackHandlers];

      if (handler) {
        handler(this.bot, query);
      } else {
        this.bot.answerCallbackQuery(query.id, {
          text: "❌ Ação desconhecida.",
        });
      }
    });
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: TelegramBot.SendMessageOptions
  ): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(chatId, text, options);
  }
}
