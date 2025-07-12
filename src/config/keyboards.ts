import { InlineKeyboardMarkup } from "node-telegram-bot-api";

/**
 * Teclados inline para o sistema de vendas de produtos digitais
 * Organizados por funcionalidade e contexto de uso
 */
export const keyboards: { [key: string]: InlineKeyboardMarkup } = {
  // Teclado principal de boas-vindas
  mainMenu: {
    inline_keyboard: [
      [
        { text: "🛍️ Ver Produtos", callback_data: "view_products" },
        { text: "📋 Meus Pedidos", callback_data: "my_orders" },
      ],
      [
        { text: "❓ Ajuda", callback_data: "help" },
        { text: "📞 Contato", callback_data: "contact" },
      ],
      [{ text: "🔧 Admin", callback_data: "admin_panel" }],
    ],
  },

  // Teclado para lista de produtos
  productsList: {
    inline_keyboard: [
      [
        { text: "🛒 Comprar Produto", callback_data: "buy_product" },
        { text: "📋 Ver Detalhes", callback_data: "product_details" },
      ],
      [
        { text: "🔄 Atualizar", callback_data: "refresh_products" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para detalhes do produto
  productDetails: {
    inline_keyboard: [
      [
        { text: "💰 Comprar Agora", callback_data: "buy_now" },
        { text: "📋 Ver Mais", callback_data: "more_details" },
      ],
      [
        { text: "🛒 Adicionar ao Carrinho", callback_data: "add_to_cart" },
        { text: "🔙 Voltar", callback_data: "back_to_products" },
      ],
    ],
  },

  // Teclado para pagamento
  payment: {
    inline_keyboard: [
      [{ text: "💳 Pagar via PIX", callback_data: "payment" }],
      [{ text: "❌ Cancelar", callback_data: "cancel_payment" }],
    ],
  },

  // Teclado para confirmação de pagamento
  paymentConfirmation: {
    inline_keyboard: [
      [
        { text: "✅ Confirmar Pagamento", callback_data: "confirm_payment" },
        { text: "❌ Cancelar", callback_data: "cancel_payment" },
      ],
      [{ text: "🔄 Verificar Status", callback_data: "check_payment_status" }],
    ],
  },

  // Teclado para status do pagamento
  paymentStatus: {
    inline_keyboard: [
      [
        {
          text: "🔄 Verificar Novamente",
          callback_data: "check_payment_status",
        },
        { text: "❌ Cancelar Pedido", callback_data: "cancel_order" },
      ],
      [{ text: "📞 Suporte", callback_data: "contact_support" }],
    ],
  },

  // Teclado para pedidos do usuário
  userOrders: {
    inline_keyboard: [
      [
        { text: "📋 Ver Detalhes", callback_data: "order_details" },
        { text: "🔄 Atualizar", callback_data: "refresh_orders" },
      ],
      [{ text: "🔙 Voltar", callback_data: "main_menu" }],
    ],
  },

  // Teclado para painel administrativo
  adminPanel: {
    inline_keyboard: [
      [
        { text: "📦 Gerenciar Produtos", callback_data: "admin_products" },
        { text: "📋 Gerenciar Pedidos", callback_data: "admin_orders" },
      ],
      [
        { text: "👥 Gerenciar Admins", callback_data: "admin_users" },
        { text: "📊 Relatórios", callback_data: "admin_reports" },
      ],
      [
        { text: "⚙️ Configurações", callback_data: "admin_settings" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para gerenciamento de produtos (admin)
  adminProducts: {
    inline_keyboard: [
      [
        { text: "➕ Adicionar Produto", callback_data: "add_product" },
        { text: "➖ Remover Produto", callback_data: "remove_product" },
      ],
      [
        { text: "✏️ Editar Produto", callback_data: "edit_product" },
        { text: "📋 Listar Produtos", callback_data: "list_products" },
      ],
      [{ text: "🔙 Voltar", callback_data: "admin_panel" }],
    ],
  },

  // Teclado para gerenciamento de pedidos (admin)
  adminOrders: {
    inline_keyboard: [
      [
        { text: "📋 Todos os Pedidos", callback_data: "all_orders" },
        { text: "⏳ Pedidos Pendentes", callback_data: "pending_orders" },
      ],
      [
        { text: "✅ Pedidos Pagos", callback_data: "paid_orders" },
        { text: "📦 Pedidos Entregues", callback_data: "delivered_orders" },
      ],
      [
        { text: "🔄 Processar Pagamentos", callback_data: "process_payments" },
        { text: "🔙 Voltar", callback_data: "admin_panel" },
      ],
    ],
  },

  // Teclado para gerenciamento de usuários (admin)
  adminUsers: {
    inline_keyboard: [
      [
        { text: "➕ Adicionar Admin", callback_data: "add_admin" },
        { text: "➖ Remover Admin", callback_data: "remove_admin" },
      ],
      [
        { text: "👥 Listar Admins", callback_data: "list_admins" },
        { text: "🔐 Alterar Permissões", callback_data: "change_permissions" },
      ],
      [{ text: "🔙 Voltar", callback_data: "admin_panel" }],
    ],
  },

  // Teclado para relatórios (admin)
  adminReports: {
    inline_keyboard: [
      [
        { text: "📊 Relatório Geral", callback_data: "general_report" },
        { text: "💰 Relatório de Vendas", callback_data: "sales_report" },
      ],
      [
        { text: "📈 Estatísticas", callback_data: "statistics" },
        { text: "📅 Relatório por Período", callback_data: "period_report" },
      ],
      [{ text: "🔙 Voltar", callback_data: "admin_panel" }],
    ],
  },

  // Teclado para configurações (admin)
  adminSettings: {
    inline_keyboard: [
      [
        { text: "⚙️ Configurações Gerais", callback_data: "general_settings" },
        {
          text: "💳 Configurações de Pagamento",
          callback_data: "payment_settings",
        },
      ],
      [
        { text: "🔔 Notificações", callback_data: "notification_settings" },
        { text: "🔒 Segurança", callback_data: "security_settings" },
      ],
      [{ text: "🔙 Voltar", callback_data: "admin_panel" }],
    ],
  },

  // Teclado para ajuda
  help: {
    inline_keyboard: [
      [
        { text: "❓ FAQ", callback_data: "faq" },
        { text: "📞 Contato", callback_data: "contact" },
      ],
      [
        { text: "📱 Como Usar", callback_data: "how_to_use" },
        { text: "💳 Formas de Pagamento", callback_data: "payment_methods" },
      ],
      [{ text: "🔙 Voltar", callback_data: "main_menu" }],
    ],
  },

  // Teclado para contato
  contact: {
    inline_keyboard: [
      [
        { text: "📞 Suporte", callback_data: "support" },
        { text: "📧 Email", callback_data: "email_contact" },
      ],
      [
        { text: "💬 Chat", callback_data: "chat_support" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para confirmação de ações
  confirmation: {
    inline_keyboard: [
      [
        { text: "✅ Confirmar", callback_data: "confirm_action" },
        { text: "❌ Cancelar", callback_data: "cancel_action" },
      ],
    ],
  },

  // Teclado para navegação
  navigation: {
    inline_keyboard: [
      [
        { text: "⬅️ Anterior", callback_data: "previous" },
        { text: "➡️ Próximo", callback_data: "next" },
      ],
      [
        { text: "🔙 Voltar", callback_data: "back" },
        { text: "🏠 Início", callback_data: "home" },
      ],
    ],
  },

  // Teclado para tipos de produto
  productTypes: {
    inline_keyboard: [
      [
        { text: "📚 E-book", callback_data: "type_ebook" },
        { text: "🎓 Curso", callback_data: "type_curso" },
      ],
      [
        { text: "💻 Software", callback_data: "type_software" },
        { text: "📋 Template", callback_data: "type_template" },
      ],
      [{ text: "📦 Outro", callback_data: "type_outro" }],
    ],
  },

  // Teclado para status de pedidos
  orderStatus: {
    inline_keyboard: [
      [
        { text: "⏳ Pendente", callback_data: "status_pending" },
        { text: "✅ Pago", callback_data: "status_paid" },
      ],
      [
        { text: "📦 Entregue", callback_data: "status_delivered" },
        { text: "❌ Cancelado", callback_data: "status_cancelled" },
      ],
      [{ text: "⏰ Expirado", callback_data: "status_expired" }],
    ],
  },

  // Teclado para ações de pedido
  orderActions: {
    inline_keyboard: [
      [
        { text: "✅ Marcar como Pago", callback_data: "mark_as_paid" },
        { text: "📦 Marcar como Entregue", callback_data: "mark_as_delivered" },
      ],
      [
        { text: "❌ Cancelar Pedido", callback_data: "cancel_order_admin" },
        { text: "🔄 Reenviar Produto", callback_data: "resend_product" },
      ],
      [{ text: "🔙 Voltar", callback_data: "admin_orders" }],
    ],
  },

  // Teclado para feedback
  feedback: {
    inline_keyboard: [
      [
        { text: "⭐ 1", callback_data: "rating_1" },
        { text: "⭐⭐ 2", callback_data: "rating_2" },
        { text: "⭐⭐⭐ 3", callback_data: "rating_3" },
      ],
      [
        { text: "⭐⭐⭐⭐ 4", callback_data: "rating_4" },
        { text: "⭐⭐⭐⭐⭐ 5", callback_data: "rating_5" },
      ],
      [
        { text: "💬 Comentário", callback_data: "add_comment" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para newsletter
  newsletter: {
    inline_keyboard: [
      [
        { text: "✅ Inscrever", callback_data: "subscribe_newsletter" },
        { text: "❌ Cancelar", callback_data: "unsubscribe_newsletter" },
      ],
      [{ text: "🔙 Voltar", callback_data: "main_menu" }],
    ],
  },

  // Teclado para promoções
  promotions: {
    inline_keyboard: [
      [
        { text: "🎉 Aplicar Cupom", callback_data: "apply_coupon" },
        { text: "💰 Ver Descontos", callback_data: "view_discounts" },
      ],
      [{ text: "🔙 Voltar", callback_data: "main_menu" }],
    ],
  },

  // Teclado para carrinho de compras
  cart: {
    inline_keyboard: [
      [
        { text: "🛒 Ver Carrinho", callback_data: "view_cart" },
        { text: "🗑️ Limpar Carrinho", callback_data: "clear_cart" },
      ],
      [
        { text: "💳 Finalizar Compra", callback_data: "checkout" },
        { text: "🔙 Continuar Comprando", callback_data: "continue_shopping" },
      ],
    ],
  },

  // Teclado para busca
  search: {
    inline_keyboard: [
      [
        { text: "🔍 Buscar por Nome", callback_data: "search_by_name" },
        { text: "💰 Buscar por Preço", callback_data: "search_by_price" },
      ],
      [
        { text: "📂 Buscar por Tipo", callback_data: "search_by_type" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para filtros
  filters: {
    inline_keyboard: [
      [
        { text: "💰 Menor Preço", callback_data: "filter_price_low" },
        { text: "💰 Maior Preço", callback_data: "filter_price_high" },
      ],
      [
        { text: "📅 Mais Recentes", callback_data: "filter_date_new" },
        { text: "📅 Mais Antigos", callback_data: "filter_date_old" },
      ],
      [
        { text: "🔙 Remover Filtros", callback_data: "remove_filters" },
        { text: "🔙 Voltar", callback_data: "view_products" },
      ],
    ],
  },

  // Teclado para suporte
  support: {
    inline_keyboard: [
      [
        { text: "❓ Problema com Pagamento", callback_data: "support_payment" },
        { text: "📦 Problema com Produto", callback_data: "support_product" },
      ],
      [
        { text: "🔐 Problema de Acesso", callback_data: "support_access" },
        { text: "💬 Outro Problema", callback_data: "support_other" },
      ],
      [{ text: "🔙 Voltar", callback_data: "contact" }],
    ],
  },

  // Teclado para configurações de usuário
  userSettings: {
    inline_keyboard: [
      [
        { text: "👤 Meu Perfil", callback_data: "user_profile" },
        { text: "🔔 Notificações", callback_data: "user_notifications" },
      ],
      [
        { text: "🔒 Privacidade", callback_data: "user_privacy" },
        { text: "🔙 Voltar", callback_data: "main_menu" },
      ],
    ],
  },

  // Teclado para histórico
  history: {
    inline_keyboard: [
      [
        { text: "📋 Histórico de Compras", callback_data: "purchase_history" },
        {
          text: "📊 Histórico de Pagamentos",
          callback_data: "payment_history",
        },
      ],
      [{ text: "🔙 Voltar", callback_data: "main_menu" }],
    ],
  },

  // Teclado para cancelamento
  cancel: {
    inline_keyboard: [[{ text: "❌ Cancelar", callback_data: "cancel" }]],
  },

  // Teclado para voltar
  back: {
    inline_keyboard: [[{ text: "🔙 Voltar", callback_data: "back" }]],
  },

  // Teclado para início
  home: {
    inline_keyboard: [[{ text: "🏠 Início", callback_data: "main_menu" }]],
  },

  // Teclado para paginação
  pagination: {
    inline_keyboard: [
      [
        { text: "⬅️", callback_data: "page_prev" },
        { text: "1", callback_data: "page_1" },
        { text: "2", callback_data: "page_2" },
        { text: "3", callback_data: "page_3" },
        { text: "➡️", callback_data: "page_next" },
      ],
    ],
  },

  // Teclado para ações rápidas
  quickActions: {
    inline_keyboard: [
      [
        { text: "🛍️ Comprar", callback_data: "quick_buy" },
        { text: "📋 Detalhes", callback_data: "quick_details" },
      ],
      [{ text: "🔙 Voltar", callback_data: "quick_back" }],
    ],
  },

  // Teclado para testes (desenvolvimento)
  test: {
    inline_keyboard: [
      [
        { text: "🧪 Teste 1", callback_data: "test_1" },
        { text: "🧪 Teste 2", callback_data: "test_2" },
      ],
      [
        { text: "🧪 Teste 3", callback_data: "test_3" },
        { text: "🧪 Teste 4", callback_data: "test_4" },
      ],
    ],
  },

  users: {
    inline_keyboard: [
      [
        { text: "Add User", callback_data: "add_user" },
        { text: "Delete User", callback_data: "delete_user" },
        { text: "List Users", callback_data: "list_users" },
      ],
    ],
  },
};

/**
 * Configurações de formatação Markdown
 */
export const markdownConfig = {
  parse_mode: "Markdown" as const,
};

/**
 * Configurações de formatação HTML
 */
export const htmlConfig = {
  parse_mode: "HTML" as const,
};

/**
 * Configurações de formatação sem parse
 */
export const plainConfig = {
  parse_mode: undefined,
};

/**
 * Configurações para desabilitar preview de links
 */
export const noPreviewConfig = {
  disable_web_page_preview: true,
};

/**
 * Configurações para mensagens silenciosas
 */
export const silentConfig = {
  disable_notification: true,
};

/**
 * Configurações para mensagens com proteção de conteúdo
 */
export const protectConfig = {
  protect_content: true,
};

/**
 * Configurações para mensagens com reply
 */
export const replyConfig = (messageId: number) => ({
  reply_to_message_id: messageId,
});

/**
 * Configurações para mensagens com teclado removível
 */
export const removeKeyboardConfig = {
  reply_markup: {
    remove_keyboard: true,
  },
};

/**
 * Configurações para mensagens com teclado de força
 */
export const forceReplyConfig = {
  reply_markup: {
    force_reply: true,
  },
};
