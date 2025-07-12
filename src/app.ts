import dotenv from "dotenv";
dotenv.config();

import { Telegram } from "./service/bot/Telegram";
import { TelegramTransactionDB } from "./db/dbTelegramSales";
import { ProductService } from "./service/ProductService";

/**
 * Função principal que inicializa o sistema de vendas de produtos digitais
 * Configura o banco de dados, adiciona produtos de exemplo e inicia o bot
 */
async function main() {
  console.log("🚀 Iniciando sistema de vendas de produtos digitais...");

  try {
    // Verifica se as variáveis de ambiente estão configuradas
    const telegramToken = process.env.TELEGRAM_TOKEN;
    const mercadoPagoToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!telegramToken) {
      throw new Error("❌ TELEGRAM_TOKEN não encontrado no arquivo .env");
    }

    if (!mercadoPagoToken) {
      throw new Error(
        "❌ MERCADO_PAGO_ACCESS_TOKEN não encontrado no arquivo .env"
      );
    }

    console.log("✅ Variáveis de ambiente configuradas");

    // Inicializa o banco de dados
    const db = new TelegramTransactionDB();
    console.log("✅ Banco de dados inicializado");

    // Adiciona administrador padrão se não existir
    await setupDefaultAdmin(db);

    // Adiciona produtos de exemplo se não existirem
    await setupSampleProducts(db);

    // Inicializa o bot do Telegram
    const telegram = new Telegram(telegramToken);
    console.log("✅ Bot do Telegram inicializado");

    // Inicia o bot
    await telegram.start();

    // Configura handlers de encerramento gracioso
    setupGracefulShutdown(telegram);

    console.log("🎉 Sistema iniciado com sucesso!");
    console.log("📱 Use /start no Telegram para começar");
    console.log("🔧 Use /admin para acessar o painel administrativo");
  } catch (error) {
    console.error("❌ Erro ao inicializar o sistema:", error);
    process.exit(1);
  }
}

/**
 * Configura o administrador padrão do sistema
 * @param db - Instância do banco de dados
 */
async function setupDefaultAdmin(db: TelegramTransactionDB): Promise<void> {
  try {
    const admins = db.getAllAdmins();

    if (admins.length === 0) {
      // Adiciona administrador padrão
      // Em produção, você deve configurar o ID do administrador principal
      const defaultAdminId = parseInt(
        process.env.DEFAULT_ADMIN_ID || "123456789"
      );

      await db.addAdmin(
        {
          name: "Administrador Principal",
          username: "admin",
          role: "super_admin",
          status: "active",
        },
        defaultAdminId
      );

      console.log("👤 Administrador padrão criado");
      console.log(
        "⚠️  IMPORTANTE: Configure o DEFAULT_ADMIN_ID no .env com seu ID do Telegram"
      );
    } else {
      console.log("👤 Administradores já configurados");
    }
  } catch (error) {
    console.error("❌ Erro ao configurar administrador padrão:", error);
  }
}

/**
 * Configura produtos de exemplo para demonstração
 * @param db - Instância do banco de dados
 */
async function setupSampleProducts(db: TelegramTransactionDB): Promise<void> {
  try {
    const productService = new ProductService();
    const products = productService.getActiveProducts();

    if (products.length === 0) {
      console.log("📦 Adicionando produtos de exemplo...");

      // Produto 1: E-book
      await productService.addProduct(
        {
          name: "E-book Marketing Digital",
          description:
            "Guia completo de marketing digital para iniciantes. Aprenda estratégias de SEO, redes sociais, email marketing e muito mais. Inclui 50+ páginas de conteúdo prático e exemplos reais.",
          price: 2990, // R$ 29,90
          downloadLink: "https://drive.google.com/file/d/1ABC123DEF456/view",
          type: "ebook",
          status: "active",
        },
        123456789
      ); // ID do admin padrão

      // Produto 2: Curso
      await productService.addProduct(
        {
          name: "Curso de JavaScript Completo",
          description:
            "Curso completo de JavaScript do básico ao avançado. Inclui ES6+, Node.js, React e projetos práticos. Mais de 20 horas de conteúdo em vídeo.",
          price: 9970, // R$ 99,70
          downloadLink: "https://drive.google.com/file/d/2XYZ789ABC123/view",
          type: "curso",
          status: "active",
        },
        123456789
      );

      // Produto 3: Software
      await productService.addProduct(
        {
          name: "Software de Gestão Financeira",
          description:
            "Software completo para gestão financeira pessoal e empresarial. Controle de receitas, despesas, relatórios e planejamento financeiro.",
          price: 14990, // R$ 149,90
          downloadLink: "https://drive.google.com/file/d/3DEF456GHI789/view",
          type: "software",
          status: "active",
        },
        123456789
      );

      // Produto 4: Template
      await productService.addProduct(
        {
          name: "Template WordPress Premium",
          description:
            "Template WordPress responsivo e otimizado para SEO. Inclui 10 layouts diferentes, plugins premium e suporte por 1 ano.",
          price: 4990, // R$ 49,90
          downloadLink: "https://drive.google.com/file/d/4GHI789JKL012/view",
          type: "template",
          status: "active",
        },
        123456789
      );

      console.log("✅ Produtos de exemplo adicionados");
      console.log("📋 Produtos disponíveis:");
      products.forEach((product, index) => {
        console.log(
          `   ${index + 1}. ${product.name} - ${productService.formatPrice(
            product.price
          )}`
        );
      });
    } else {
      console.log("📦 Produtos já configurados");
    }
  } catch (error) {
    console.error("❌ Erro ao configurar produtos de exemplo:", error);
  }
}

/**
 * Configura o encerramento gracioso do sistema
 * @param telegram - Instância do bot do Telegram
 */
function setupGracefulShutdown(telegram: Telegram): void {
  // Handler para SIGINT (Ctrl+C)
  process.on("SIGINT", async () => {
    console.log("\n🛑 Recebido sinal SIGINT, encerrando graciosamente...");
    await gracefulShutdown(telegram);
  });

  // Handler para SIGTERM
  process.on("SIGTERM", async () => {
    console.log("\n🛑 Recebido sinal SIGTERM, encerrando graciosamente...");
    await gracefulShutdown(telegram);
  });

  // Handler para erros não tratados
  process.on("uncaughtException", async (error) => {
    console.error("❌ Erro não tratado:", error);
    await gracefulShutdown(telegram);
  });

  // Handler para promises rejeitadas
  process.on("unhandledRejection", async (reason, promise) => {
    console.error("❌ Promise rejeitada não tratada:", reason);
    await gracefulShutdown(telegram);
  });
}

/**
 * Executa o encerramento gracioso do sistema
 * @param telegram - Instância do bot do Telegram
 */
async function gracefulShutdown(telegram: Telegram): Promise<void> {
  try {
    console.log("🔄 Encerrando sistema...");

    // Para o bot
    await telegram.stop();
    console.log("✅ Bot encerrado");

    // Expira pedidos antigos
    const db = new TelegramTransactionDB();
    const expiredCount = await db.expireOldOrders();
    console.log(`⏰ ${expiredCount} pedidos expirados processados`);

    console.log("✅ Sistema encerrado com sucesso");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante encerramento:", error);
    process.exit(1);
  }
}

// Inicia o sistema
main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
