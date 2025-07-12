import { TelegramTransactionDB } from "@/db/dbTelegramSales";
import { MercadoPago } from "@/service/gatway/MercadoPago";
import { ProductService } from "@/service/ProductService";
import { OrderService } from "@/service/OrderService";
import { ITransaction } from "@/types/ITransaction";
import { messages } from "@/config/messagesDeafult";
import { keyboards } from "@/config/keyboards";
import TelegramBot from "node-telegram-bot-api";
import { v4 as uuidv4 } from "uuid";

/**
 * Handlers para callbacks de botões inline do bot
 * Inclui todas as funcionalidades de navegação e ações do sistema de vendas
 */
export const callbackHandlers = {
  // ==================== NAVEGAÇÃO PRINCIPAL ====================

  /**
   * Menu principal
   */
  main_menu: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      await bot.editMessageText(messages.telegramWelcome, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.mainMenu,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback main_menu:", error);
    }
  },

  /**
   * Visualizar produtos
   */
  view_products: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.editMessageText(messages.noProducts, {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const productsList = productService.formatProductsList(products);
      await bot.editMessageText(productsList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.productsList,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback view_products:", error);
    }
  },

  /**
   * Meus pedidos
   */
  my_orders: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const orderService = new OrderService();
      const orders = orderService.getUserOrders(query.from!.id);
      const ordersList = orderService.formatUserOrders(orders);

      await bot.editMessageText(ordersList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.userOrders,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback my_orders:", error);
    }
  },

  /**
   * Ajuda
   */
  help: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      await bot.editMessageText(messages.help, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.help,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback help:", error);
    }
  },

  /**
   * Contato
   */
  contact: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      await bot.editMessageText(messages.contact, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.contact,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback contact:", error);
    }
  },

  // ==================== PRODUTOS ====================

  /**
   * Comprar produto
   */
  buy_product: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Nenhum produto disponível",
        });
        return;
      }

      // Por simplicidade, vamos comprar o primeiro produto
      // Em uma implementação real, você teria uma seleção de produtos
      const product = products[0];

      const productDetails = productService.formatProductForDisplay(product);
      await bot.editMessageText(productDetails, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.productDetails,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback buy_product:", error);
    }
  },

  /**
   * Comprar agora
   */
  buy_now: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Nenhum produto disponível",
        });
        return;
      }

      const product = products[0]; // Primeiro produto
      const orderService = new OrderService();

      await bot.editMessageText(messages.generatingPayment, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
      });

      try {
        const { order, qrCode, paymentUrl } = await orderService.createOrder(
          query.from!.id,
          query.from!.first_name || "Usuário",
          product.id
        );

        const paymentMessage = `${messages.paymentGenerated}
${messages.paymentInstructions}

💳 *QR Code PIX:*
\`${qrCode}\`

🔗 *Link de Pagamento:*
${paymentUrl}

⏰ *Pedido expira em:* 10 minutos
🆔 *ID do Pedido:* \`${order.id}\``;

        await bot.editMessageText(paymentMessage, {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.paymentStatus,
        });

        // Inicia verificação periódica do pagamento
        setTimeout(async () => {
          try {
            const isPaid = await orderService.checkPaymentStatus(order.id, bot);
            if (isPaid) {
              await bot.editMessageText(messages.paymentConfirmed, {
                chat_id: query.message?.chat.id,
                message_id: query.message?.message_id,
                parse_mode: "Markdown",
                reply_markup: keyboards.mainMenu,
              });
            }
          } catch (error) {
            console.error("❌ Erro ao verificar pagamento:", error);
          }
        }, 30000); // Verifica após 30 segundos
      } catch (error) {
        console.error("❌ Erro ao criar pedido:", error);
        await bot.editMessageText(messages.paymentError, {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
      }

      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback buy_now:", error);
    }
  },

  /**
   * Verificar status do pagamento
   */
  check_payment_status: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      await bot.answerCallbackQuery(query.id, {
        text: "🔄 Verificando pagamento...",
      });

      // Em uma implementação real, você teria o ID do pedido armazenado
      // Por simplicidade, vamos simular uma verificação
      const orderService = new OrderService();

      // Processa todos os pedidos pendentes do usuário
      await orderService.processPendingOrders(bot);

      await bot.editMessageText(
        "✅ Verificação concluída! Verifique suas mensagens.",
        {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        }
      );
    } catch (error) {
      console.error("❌ Erro no callback check_payment_status:", error);
    }
  },

  // ==================== ADMINISTRAÇÃO ====================

  /**
   * Painel administrativo
   */
  admin_panel: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      await bot.editMessageText(messages.adminWelcome, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminPanel,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback admin_panel:", error);
    }
  },

  /**
   * Gerenciar produtos (admin)
   */
  admin_products: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const productService = new ProductService();
      const products = productService.getActiveProducts();

      let message = "📦 *Gerenciamento de Produtos*\n\n";
      if (products.length === 0) {
        message += "Nenhum produto cadastrado.";
      } else {
        products.forEach((product, index) => {
          message += `${index + 1}. *${product.name}*\n`;
          message += `   💰 ${productService.formatPrice(product.price)}\n`;
          message += `   🆔 \`${product.id}\`\n\n`;
        });
      }

      await bot.editMessageText(message, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminProducts,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback admin_products:", error);
    }
  },

  /**
   * Gerenciar pedidos (admin)
   */
  admin_orders: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const orderService = new OrderService();
      const orders = orderService.getAllOrders(10); // Últimos 10 pedidos
      const ordersList = orderService.formatOrdersForAdmin(orders);

      await bot.editMessageText(ordersList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminOrders,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback admin_orders:", error);
    }
  },

  /**
   * Gerenciar usuários (admin)
   */
  admin_users: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const admins = db.getAllAdmins();

      let message = "👥 *Gerenciamento de Administradores*\n\n";
      admins.forEach((admin, index) => {
        message += `${index + 1}. *${admin.name}*\n`;
        message += `   🆔 ${admin.id}\n`;
        message += `   📊 ${admin.role}\n\n`;
      });

      await bot.editMessageText(message, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminUsers,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback admin_users:", error);
    }
  },

  /**
   * Relatórios (admin)
   */
  admin_reports: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const orderService = new OrderService();
      const allOrders = orderService.getAllOrders();
      const paidOrders = orderService.getOrdersByStatus("paid");
      const deliveredOrders = orderService.getOrdersByStatus("delivered");

      const totalRevenue = paidOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );
      const totalProducts = deliveredOrders.length;
      const uniqueCustomers = new Set(paidOrders.map((order) => order.userId))
        .size;

      const report = `
📊 *Relatórios Disponíveis*

💰 *Receita Total:* ${(totalRevenue / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
📦 *Produtos Vendidos:* ${totalProducts}
👥 *Clientes Únicos:* ${uniqueCustomers}
📋 *Total de Pedidos:* ${allOrders.length}

Selecione um relatório para visualizar:
      `;

      await bot.editMessageText(report, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminReports,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback admin_reports:", error);
    }
  },

  // ==================== AÇÕES DE PRODUTOS ====================

  /**
   * Adicionar produto (admin)
   */
  add_product: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const instructions = `
📦 *Adicionar Novo Produto*

Para adicionar um produto, envie as informações no seguinte formato:

\`\`\`
Nome: Nome do Produto
Descrição: Descrição detalhada do produto
Preço: 29.90 (em reais)
Tipo: ebook/curso/software/template/outro
Link: https://exemplo.com/download
\`\`\`
      `;

      await bot.editMessageText(instructions, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.cancel,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback add_product:", error);
    }
  },

  /**
   * Remover produto (admin)
   */
  remove_product: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.editMessageText(messages.noProducts, {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.adminPanel,
        });
        return;
      }

      let message = "🗑️ *Selecione o produto para remover:*\n\n";
      products.forEach((product, index) => {
        message += `${index + 1}. *${product.name}* (ID: \`${product.id}\`)\n`;
      });

      await bot.editMessageText(message, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.confirmation,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback remove_product:", error);
    }
  },

  // ==================== AÇÕES DE PEDIDOS ====================

  /**
   * Todos os pedidos (admin)
   */
  all_orders: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const orderService = new OrderService();
      const orders = orderService.getAllOrders(20);
      const ordersList = orderService.formatOrdersForAdmin(orders);

      await bot.editMessageText(ordersList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminOrders,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback all_orders:", error);
    }
  },

  /**
   * Pedidos pendentes (admin)
   */
  pending_orders: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const orderService = new OrderService();
      const orders = orderService.getOrdersByStatus("pending", 20);
      const ordersList = orderService.formatOrdersForAdmin(orders);

      await bot.editMessageText(ordersList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.adminOrders,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback pending_orders:", error);
    }
  },

  /**
   * Processar pagamentos (admin)
   */
  process_payments: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      await bot.answerCallbackQuery(query.id, {
        text: "🔄 Processando pagamentos...",
      });

      const orderService = new OrderService();
      await orderService.processPendingOrders(bot);

      await bot.editMessageText(
        "✅ Pagamentos processados! Verifique os pedidos.",
        {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.adminOrders,
        }
      );
    } catch (error) {
      console.error("❌ Erro no callback process_payments:", error);
    }
  },

  // ==================== AÇÕES DE USUÁRIOS ====================

  /**
   * Adicionar admin
   */
  add_admin: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const instructions = `
👥 *Adicionar Novo Administrador*

Para adicionar um administrador, envie as informações no seguinte formato:

\`\`\`
ID: 123456789 (ID do usuário no Telegram)
Nome: Nome do Administrador
Username: @username (opcional)
Role: admin/super_admin
\`\`\`
      `;

      await bot.editMessageText(instructions, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.cancel,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback add_admin:", error);
    }
  },

  /**
   * Remover admin
   */
  remove_admin: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(query.from!.id);

      if (!isAdmin) {
        await bot.answerCallbackQuery(query.id, { text: "❌ Acesso negado" });
        return;
      }

      const admins = db.getAllAdmins();

      if (admins.length <= 1) {
        await bot.editMessageText(
          "❌ *Não é possível remover o último administrador.*",
          {
            chat_id: query.message?.chat.id,
            message_id: query.message?.message_id,
            parse_mode: "Markdown",
            reply_markup: keyboards.adminPanel,
          }
        );
        return;
      }

      let message = "🗑️ *Selecione o administrador para remover:*\n\n";
      admins.forEach((admin, index) => {
        if (admin.id !== query.from!.id) {
          // Não permite remover a si mesmo
          message += `${index + 1}. *${admin.name}* (ID: ${admin.id})\n`;
        }
      });

      await bot.editMessageText(message, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.confirmation,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback remove_admin:", error);
    }
  },

  // ==================== AÇÕES GERAIS ====================

  /**
   * Cancelar ação
   */
  cancel: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      await bot.editMessageText(messages.cancelled, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.mainMenu,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback cancel:", error);
    }
  },

  /**
   * Voltar
   */
  back: async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    try {
      await bot.editMessageText(messages.telegramWelcome, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.mainMenu,
      });
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Erro no callback back:", error);
    }
  },

  /**
   * Atualizar
   */
  refresh_products: async (
    bot: TelegramBot,
    query: TelegramBot.CallbackQuery
  ) => {
    try {
      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.editMessageText(messages.noProducts, {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const productsList = productService.formatProductsList(products);
      await bot.editMessageText(productsList, {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboards.productsList,
      });
      await bot.answerCallbackQuery(query.id, { text: "🔄 Atualizado!" });
    } catch (error) {
      console.error("❌ Erro no callback refresh_products:", error);
    }
  },

  // ==================== CALLBACKS LEGACY (COMPATIBILIDADE) ====================

  /**
   * @deprecated Use buy_now instead
   */
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
