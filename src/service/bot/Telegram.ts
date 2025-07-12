import { messages } from "@/config/messagesDeafult";
import { callbackHandlers } from "@/handlers/callbackHandlers";
import { messageHandlers } from "@/handlers/messageHandlers";
import { OrderService } from "@/service/OrderService";
import TelegramBot from "node-telegram-bot-api";

/**
 * Classe principal do bot do Telegram
 * Gerencia todos os eventos e comandos do sistema de vendas
 */
export class Telegram {
  private bot: TelegramBot;
  private orderService: OrderService;
  private paymentCheckInterval: NodeJS.Timeout | null = null;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.orderService = new OrderService();

    this.setupListeners();
    this.startPaymentCheckInterval();
  }

  /**
   * Configura todos os listeners de eventos do bot
   */
  private setupListeners() {
    // ==================== COMANDOS DE TEXTO ====================

    // Comando /start
    this.bot.onText(/^\/start$/, (msg) => {
      messageHandlers.start(this.bot, msg);
    });

    // Comando /produtos
    this.bot.onText(/^\/produtos$/, (msg) => {
      messageHandlers.produtos(this.bot, msg);
    });

    // Comando /meus_pedidos
    this.bot.onText(/^\/meus_pedidos$/, (msg) => {
      messageHandlers.meus_pedidos(this.bot, msg);
    });

    // Comando /ajuda
    this.bot.onText(/^\/ajuda$/, (msg) => {
      messageHandlers.ajuda(this.bot, msg);
    });

    // Comando /admin
    this.bot.onText(/^\/admin$/, (msg) => {
      messageHandlers.admin(this.bot, msg);
    });

    // Comando /addproduto
    this.bot.onText(/^\/addproduto$/, (msg) => {
      messageHandlers.addproduto(this.bot, msg);
    });

    // Comando /delproduto
    this.bot.onText(/^\/delproduto$/, (msg) => {
      messageHandlers.delproduto(this.bot, msg);
    });

    // Comando /pedidos
    this.bot.onText(/^\/pedidos$/, (msg) => {
      messageHandlers.pedidos(this.bot, msg);
    });

    // Comando /addadmin
    this.bot.onText(/^\/addadmin$/, (msg) => {
      messageHandlers.addadmin(this.bot, msg);
    });

    // Comando /deladmin
    this.bot.onText(/^\/deladmin$/, (msg) => {
      messageHandlers.deladmin(this.bot, msg);
    });

    // Comando /relatorio
    this.bot.onText(/^\/relatorio$/, (msg) => {
      messageHandlers.relatorio(this.bot, msg);
    });

    // Comando /faq
    this.bot.onText(/^\/faq$/, (msg) => {
      messageHandlers.faq(this.bot, msg);
    });

    // Comando /contato
    this.bot.onText(/^\/contato$/, (msg) => {
      messageHandlers.contato(this.bot, msg);
    });

    // ==================== MENSAGENS DE TEXTO ====================

    // Handler para mensagens que não são comandos
    this.bot.on("message", (msg) => {
      if (!msg.text?.startsWith("/")) {
        messageHandlers.default(this.bot, msg);
      }
    });

    // ==================== CALLBACKS DE BOTÕES ====================

    // Handler para callbacks de botões inline
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

    // ==================== EVENTOS DE ERRO ====================

    // Handler para erros
    this.bot.on("error", (error) => {
      console.error("❌ Erro no bot:", error);
    });

    // Handler para polling error
    this.bot.on("polling_error", (error) => {
      console.error("❌ Erro de polling:", error);
    });

    // ==================== EVENTOS DE WEBHOOK ====================

    // Handler para webhook error (se usar webhook)
    this.bot.on("webhook_error", (error) => {
      console.error("❌ Erro de webhook:", error);
    });
  }

  /**
   * Inicia o intervalo de verificação de pagamentos
   * Verifica pagamentos pendentes a cada 30 segundos
   */
  private startPaymentCheckInterval() {
    this.paymentCheckInterval = setInterval(async () => {
      try {
        await this.orderService.processPendingOrders(this.bot);
      } catch (error) {
        console.error("❌ Erro ao processar pagamentos:", error);
      }
    }, 30000); // 30 segundos
  }

  /**
   * Para o intervalo de verificação de pagamentos
   */
  public stopPaymentCheckInterval() {
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
      this.paymentCheckInterval = null;
    }
  }

  /**
   * Envia uma mensagem para um chat específico
   * @param chatId - ID do chat
   * @param text - Texto da mensagem
   * @param options - Opções adicionais
   */
  async sendMessage(
    chatId: number,
    text: string,
    options?: TelegramBot.SendMessageOptions
  ): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(chatId, text, options);
  }

  /**
   * Edita uma mensagem existente
   * @param chatId - ID do chat
   * @param messageId - ID da mensagem
   * @param text - Novo texto
   * @param options - Opções adicionais
   */
  async editMessage(
    chatId: number,
    messageId: number,
    text: string,
    options?: TelegramBot.EditMessageTextOptions
  ): Promise<TelegramBot.Message | boolean> {
    return this.bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    });
  }

  /**
   * Responde a uma callback query
   * @param callbackQueryId - ID da callback query
   * @param options - Opções da resposta
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    options?: TelegramBot.AnswerCallbackQueryOptions
  ): Promise<boolean> {
    return this.bot.answerCallbackQuery(callbackQueryId, options);
  }

  /**
   * Envia uma mensagem de notificação para administradores
   * @param message - Mensagem a ser enviada
   */
  async notifyAdmins(message: string): Promise<void> {
    try {
      // Em uma implementação real, você teria uma lista de admins
      // Por simplicidade, vamos apenas logar a mensagem
      console.log("📢 Notificação para admins:", message);
    } catch (error) {
      console.error("❌ Erro ao notificar admins:", error);
    }
  }

  /**
   * Envia uma mensagem de erro para o usuário
   * @param chatId - ID do chat
   * @param error - Erro ocorrido
   */
  async sendErrorMessage(chatId: number, error: any): Promise<void> {
    try {
      const errorMessage = `❌ *Erro:* ${
        error.message || "Erro desconhecido"
      }\n\nTente novamente em alguns instantes.`;
      await this.sendMessage(chatId, errorMessage, {
        parse_mode: "Markdown",
      });
    } catch (sendError) {
      console.error("❌ Erro ao enviar mensagem de erro:", sendError);
    }
  }

  /**
   * Envia uma mensagem de sucesso para o usuário
   * @param chatId - ID do chat
   * @param message - Mensagem de sucesso
   */
  async sendSuccessMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.sendMessage(chatId, `✅ ${message}`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem de sucesso:", error);
    }
  }

  /**
   * Envia uma mensagem de informação para o usuário
   * @param chatId - ID do chat
   * @param message - Mensagem informativa
   */
  async sendInfoMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.sendMessage(chatId, `ℹ️ ${message}`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem informativa:", error);
    }
  }

  /**
   * Envia uma mensagem de aviso para o usuário
   * @param chatId - ID do chat
   * @param message - Mensagem de aviso
   */
  async sendWarningMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.sendMessage(chatId, `⚠️ ${message}`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem de aviso:", error);
    }
  }

  /**
   * Obtém informações do bot
   */
  async getBotInfo(): Promise<TelegramBot.User> {
    return this.bot.getMe();
  }

  /**
   * Obtém informações de um chat
   * @param chatId - ID do chat
   */
  async getChatInfo(chatId: number): Promise<TelegramBot.Chat> {
    return this.bot.getChat(chatId);
  }

  /**
   * Obtém informações de um usuário
   * @param userId - ID do usuário
   */
  async getUserInfo(userId: number): Promise<TelegramBot.ChatMember> {
    return this.bot.getChatMember(userId, userId);
  }

  /**
   * Para o bot
   */
  async stop(): Promise<void> {
    this.stopPaymentCheckInterval();
    await this.bot.stopPolling();
  }

  /**
   * Inicia o bot (se não estiver rodando)
   */
  async start(): Promise<void> {
    try {
      const botInfo = await this.getBotInfo();
      console.log(`🤖 Bot iniciado: @${botInfo.username}`);
      console.log(`📱 Nome: ${botInfo.first_name}`);
      console.log(`🆔 ID: ${botInfo.id}`);
    } catch (error) {
      console.error("❌ Erro ao iniciar bot:", error);
    }
  }

  /**
   * Verifica se o bot está funcionando
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.getBotInfo();
      return true;
    } catch (error) {
      console.error("❌ Bot não está saudável:", error);
      return false;
    }
  }

  /**
   * Obtém estatísticas do bot
   */
  async getStats(): Promise<any> {
    try {
      const botInfo = await this.getBotInfo();
      return {
        botId: botInfo.id,
        botName: botInfo.first_name,
        botUsername: botInfo.username,
        isActive: true,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    } catch (error) {
      console.error("❌ Erro ao obter estatísticas:", error);
      return {
        isActive: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
