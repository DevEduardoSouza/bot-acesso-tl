import { keyboards, markdownConfig } from "@/config/keyboards";
import { messages } from "@/config/messagesDeafult";
import { ProductService } from "@/service/ProductService";
import { OrderService } from "@/service/OrderService";
import { TelegramTransactionDB } from "@/db/dbTelegramSales";
import TelegramBot from "node-telegram-bot-api";

/**
 * Handlers para mensagens de texto do bot
 * Inclui todos os comandos e funcionalidades do sistema de vendas
 */
export const messageHandlers = {
  /**
   * Handler para o comando /start
   * Exibe a mensagem de boas-vindas e menu principal
   */
  start: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      await bot.sendMessage(msg.chat.id, messages.telegramWelcome, {
        parse_mode: "Markdown",
        reply_markup: keyboards.mainMenu,
      });
    } catch (error) {
      console.error("❌ Erro no comando /start:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /produtos
   * Exibe o catálogo de produtos disponíveis
   */
  produtos: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.sendMessage(msg.chat.id, messages.noProducts, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const productsList = productService.formatProductsList(products);
      await bot.sendMessage(msg.chat.id, productsList, {
        parse_mode: "Markdown",
        reply_markup: keyboards.productsList,
      });
    } catch (error) {
      console.error("❌ Erro no comando /produtos:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /meus_pedidos
   * Exibe os pedidos do usuário
   */
  meus_pedidos: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const orderService = new OrderService();
      const orders = orderService.getUserOrders(msg.from!.id);
      const ordersList = orderService.formatUserOrders(orders);

      await bot.sendMessage(msg.chat.id, ordersList, {
        parse_mode: "Markdown",
        reply_markup: keyboards.userOrders,
      });
    } catch (error) {
      console.error("❌ Erro no comando /meus_pedidos:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /ajuda
   * Exibe a mensagem de ajuda com comandos disponíveis
   */
  ajuda: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      await bot.sendMessage(msg.chat.id, messages.help, {
        parse_mode: "Markdown",
        reply_markup: keyboards.help,
      });
    } catch (error) {
      console.error("❌ Erro no comando /ajuda:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /admin
   * Exibe o painel administrativo (apenas para admins)
   */
  admin: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      await bot.sendMessage(msg.chat.id, messages.adminWelcome, {
        parse_mode: "Markdown",
        reply_markup: keyboards.adminPanel,
      });
    } catch (error) {
      console.error("❌ Erro no comando /admin:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /addproduto
   * Inicia o processo de adição de produto (apenas para admins)
   */
  addproduto: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
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

*Exemplo:*
\`\`\`
Nome: E-book Marketing Digital
Descrição: Guia completo de marketing digital para iniciantes
Preço: 29.90
Tipo: ebook
Link: https://drive.google.com/file/d/123456/view
\`\`\`
      `;

      await bot.sendMessage(msg.chat.id, instructions, {
        parse_mode: "Markdown",
        reply_markup: keyboards.cancel,
      });
    } catch (error) {
      console.error("❌ Erro no comando /addproduto:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /delproduto
   * Inicia o processo de remoção de produto (apenas para admins)
   */
  delproduto: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const productService = new ProductService();
      const products = productService.getActiveProducts();

      if (products.length === 0) {
        await bot.sendMessage(msg.chat.id, messages.noProducts, {
          parse_mode: "Markdown",
          reply_markup: keyboards.adminPanel,
        });
        return;
      }

      let message = "🗑️ *Selecione o produto para remover:*\n\n";
      products.forEach((product, index) => {
        message += `${index + 1}. *${product.name}* (ID: \`${product.id}\`)\n`;
      });

      await bot.sendMessage(msg.chat.id, message, {
        parse_mode: "Markdown",
        reply_markup: keyboards.confirmation,
      });
    } catch (error) {
      console.error("❌ Erro no comando /delproduto:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /pedidos
   * Exibe todos os pedidos (apenas para admins)
   */
  pedidos: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const orderService = new OrderService();
      const orders = orderService.getAllOrders(20); // Últimos 20 pedidos
      const ordersList = orderService.formatOrdersForAdmin(orders);

      await bot.sendMessage(msg.chat.id, ordersList, {
        parse_mode: "Markdown",
        reply_markup: keyboards.adminOrders,
      });
    } catch (error) {
      console.error("❌ Erro no comando /pedidos:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /addadmin
   * Adiciona um novo administrador (apenas para super admins)
   */
  addadmin: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
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

*Exemplo:*
\`\`\`
ID: 123456789
Nome: João Silva
Username: @joaosilva
Role: admin
\`\`\`
      `;

      await bot.sendMessage(msg.chat.id, instructions, {
        parse_mode: "Markdown",
        reply_markup: keyboards.cancel,
      });
    } catch (error) {
      console.error("❌ Erro no comando /addadmin:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /deladmin
   * Remove um administrador (apenas para super admins)
   */
  deladmin: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
        return;
      }

      const admins = db.getAllAdmins();

      if (admins.length <= 1) {
        await bot.sendMessage(
          msg.chat.id,
          "❌ *Não é possível remover o último administrador.*",
          {
            parse_mode: "Markdown",
            reply_markup: keyboards.adminPanel,
          }
        );
        return;
      }

      let message = "🗑️ *Selecione o administrador para remover:*\n\n";
      admins.forEach((admin, index) => {
        if (admin.id !== msg.from!.id) {
          // Não permite remover a si mesmo
          message += `${index + 1}. *${admin.name}* (ID: ${admin.id})\n`;
        }
      });

      await bot.sendMessage(msg.chat.id, message, {
        parse_mode: "Markdown",
        reply_markup: keyboards.confirmation,
      });
    } catch (error) {
      console.error("❌ Erro no comando /deladmin:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /relatorio
   * Exibe relatório de vendas (apenas para admins)
   */
  relatorio: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        await bot.sendMessage(msg.chat.id, messages.adminOnly, {
          parse_mode: "Markdown",
          reply_markup: keyboards.mainMenu,
        });
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
📊 *Relatório de Vendas*

💰 *Receita Total:* ${(totalRevenue / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
📦 *Produtos Vendidos:* ${totalProducts}
👥 *Clientes Únicos:* ${uniqueCustomers}
📋 *Total de Pedidos:* ${allOrders.length}

📈 *Status dos Pedidos:*
• ⏳ Pendentes: ${orderService.getOrdersByStatus("pending").length}
• ✅ Pagos: ${paidOrders.length}
• 📦 Entregues: ${deliveredOrders.length}
• ❌ Cancelados: ${orderService.getOrdersByStatus("cancelled").length}
• ⏰ Expirados: ${orderService.getOrdersByStatus("expired").length}
      `;

      await bot.sendMessage(msg.chat.id, report, {
        parse_mode: "Markdown",
        reply_markup: keyboards.adminReports,
      });
    } catch (error) {
      console.error("❌ Erro no comando /relatorio:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /faq
   * Exibe perguntas frequentes
   */
  faq: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      await bot.sendMessage(msg.chat.id, messages.faq, {
        parse_mode: "Markdown",
        reply_markup: keyboards.help,
      });
    } catch (error) {
      console.error("❌ Erro no comando /faq:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para o comando /contato
   * Exibe informações de contato
   */
  contato: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      await bot.sendMessage(msg.chat.id, messages.contact, {
        parse_mode: "Markdown",
        reply_markup: keyboards.contact,
      });
    } catch (error) {
      console.error("❌ Erro no comando /contato:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },

  /**
   * Handler para processar adição de produtos via mensagem
   * Processa mensagens que contêm dados de produto para adicionar
   */
  processAddProduct: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        return false; // Não processa se não for admin
      }

      const text = msg.text || "";

      // Verifica se a mensagem contém dados de produto
      if (!text.includes("Nome:") || !text.includes("Preço:")) {
        return false; // Não é uma mensagem de produto
      }

      // Extrai os dados do produto
      const nameMatch = text.match(/Nome:\s*(.+)/);
      const descriptionMatch = text.match(/Descrição:\s*(.+)/);
      const priceMatch = text.match(/Preço:\s*([\d,]+\.?\d*)/);
      const typeMatch = text.match(
        /Tipo:\s*(ebook|curso|software|template|outro)/
      );
      const linkMatch = text.match(/Link:\s*(https?:\/\/.+)/);

      if (
        !nameMatch ||
        !descriptionMatch ||
        !priceMatch ||
        !typeMatch ||
        !linkMatch
      ) {
        await bot.sendMessage(msg.chat.id, messages.missingData, {
          parse_mode: "Markdown",
          reply_markup: keyboards.cancel,
        });
        return true;
      }

      const name = nameMatch[1].trim();
      const description = descriptionMatch[1].trim();
      const price = Math.round(
        parseFloat(priceMatch[1].replace(",", ".")) * 100
      ); // Converte para centavos
      const type = typeMatch[1] as any;
      const downloadLink = linkMatch[1].trim();

      const productService = new ProductService();
      const productId = await productService.addProduct(
        {
          name,
          description,
          price,
          downloadLink,
          type,
          status: "active",
        },
        msg.from!.id
      );

      await bot.sendMessage(msg.chat.id, messages.productAdded, {
        parse_mode: "Markdown",
        reply_markup: keyboards.adminProducts,
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao processar adição de produto:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
      return true;
    }
  },

  /**
   * Handler para processar adição de administradores via mensagem
   * Processa mensagens que contêm dados de admin para adicionar
   */
  processAddAdmin: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      const db = new TelegramTransactionDB();
      const isAdmin = db.isAdmin(msg.from!.id);

      if (!isAdmin) {
        return false; // Não processa se não for admin
      }

      const text = msg.text || "";

      // Verifica se a mensagem contém dados de admin
      if (!text.includes("ID:") || !text.includes("Nome:")) {
        return false; // Não é uma mensagem de admin
      }

      // Extrai os dados do admin
      const idMatch = text.match(/ID:\s*(\d+)/);
      const nameMatch = text.match(/Nome:\s*(.+)/);
      const usernameMatch = text.match(/Username:\s*@?(\w+)/);
      const roleMatch = text.match(/Role:\s*(admin|super_admin)/);

      if (!idMatch || !nameMatch) {
        await bot.sendMessage(msg.chat.id, messages.missingData, {
          parse_mode: "Markdown",
          reply_markup: keyboards.cancel,
        });
        return true;
      }

      const adminId = parseInt(idMatch[1]);
      const name = nameMatch[1].trim();
      const username = usernameMatch ? usernameMatch[1] : undefined;
      const role = roleMatch ? (roleMatch[1] as any) : "admin";

      await db.addAdmin(
        {
          name,
          username,
          role,
          status: "active",
        },
        adminId
      );

      await bot.sendMessage(msg.chat.id, messages.adminAdded, {
        parse_mode: "Markdown",
        reply_markup: keyboards.adminUsers,
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao processar adição de admin:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
      return true;
    }
  },

  /**
   * Handler padrão para mensagens não reconhecidas
   * Processa mensagens que não são comandos
   */
  default: async (bot: TelegramBot, msg: TelegramBot.Message) => {
    try {
      // Primeiro tenta processar como adição de produto
      const processedAsProduct = await messageHandlers.processAddProduct(
        bot,
        msg
      );
      if (processedAsProduct) return;

      // Depois tenta processar como adição de admin
      const processedAsAdmin = await messageHandlers.processAddAdmin(bot, msg);
      if (processedAsAdmin) return;

      // Se não foi processado, exibe mensagem de comando não reconhecido
      await bot.sendMessage(msg.chat.id, messages.invalidCommand, {
        parse_mode: "Markdown",
        reply_markup: keyboards.mainMenu,
      });
    } catch (error) {
      console.error("❌ Erro no handler padrão:", error);
      await bot.sendMessage(msg.chat.id, messages.systemError);
    }
  },
};
