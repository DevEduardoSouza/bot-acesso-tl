/**
 * Mensagens padrão do sistema de vendas de produtos digitais
 * Todas as mensagens são formatadas para Markdown do Telegram
 */
export const messages = {
  // Mensagem de boas-vindas principal
  telegramWelcome: `
  👋 *Seja bem-vindo(a) à nossa loja digital!*
  
  🛍️ Aqui você encontra produtos digitais de qualidade:
  • 📚 E-books
  • 🎓 Cursos
  • 💻 Softwares
  • 📋 Templates
  • E muito mais!
  
  💳 *Formas de Pagamento:*
  • PIX (pagamento instantâneo)
  • Liberação automática após confirmação
  
  ⚡ *Como funciona:*
  1. Escolha um produto
  2. Clique em "Comprar"
  3. Pague via PIX
  4. Receba o link automaticamente
  
  Use /produtos para ver nosso catálogo! 🛒
  `,

  // Mensagens de produtos
  productsList: "🛍️ *Catálogo de Produtos:*\n\n",
  noProducts: "📦 *Nenhum produto disponível no momento.*",
  productDetails: "📦 *Detalhes do Produto:*\n\n",

  // Mensagens de pagamento
  generatingPayment:
    "🔄 *Gerando pagamento PIX...*\n\n⏳ Aguarde um momento...",
  paymentGenerated: "💳 *Pagamento PIX Gerado!*\n\n",
  paymentInstructions: `
  📱 *Como pagar:*
  
  1️⃣ *Escaneie o QR Code* com seu app bancário
  2️⃣ *Ou copie o código PIX* e cole no seu app
  3️⃣ *Confirme o pagamento*
  4️⃣ *Aguarde a liberação automática*
  
  ⏰ *Tempo limite:* 10 minutos
  `,

  // Mensagens de status
  paymentPending:
    "⏳ *Pagamento pendente...*\n\nAguardando confirmação do banco.",
  paymentConfirmed:
    "✅ *Pagamento confirmado!*\n\nProduto liberado automaticamente.",
  paymentExpired:
    "⏰ *Pagamento expirado!*\n\nO tempo limite de 10 minutos foi excedido.",
  paymentCancelled: "❌ *Pagamento cancelado!*\n\nVocê pode tentar novamente.",

  // Mensagens de entrega
  productDelivered: `
  🎉 *Produto Entregue!*
  
  ✅ Seu pagamento foi confirmado e o produto foi liberado.
  
  🔗 *Link de Download:*
  {downloadLink}
  
  ⚠️ *Importante:*
  • Guarde este link com segurança
  • O acesso é vitalício
  • Em caso de problemas, entre em contato
  
  Obrigado pela compra! 🙏
  `,

  // Mensagens de erro
  productNotFound: "❌ *Produto não encontrado.*",
  productUnavailable: "❌ *Produto não está disponível para compra.*",
  pendingOrderExists:
    "❌ *Você já possui um pedido pendente para este produto.*",
  paymentError:
    "❌ *Erro ao gerar pagamento.*\n\nTente novamente em alguns instantes.",
  orderNotFound: "❌ *Pedido não encontrado.*",

  // Mensagens administrativas
  adminWelcome: `
  🔧 *Painel Administrativo*
  
  Comandos disponíveis:
  
  📦 *Gerenciar Produtos:*
  /addproduto - Adicionar novo produto
  /delproduto - Remover produto
  /produtos - Listar produtos
  
  📋 *Gerenciar Pedidos:*
  /pedidos - Ver todos os pedidos
  /pedidos_pendentes - Ver pedidos pendentes
  /pedidos_pagos - Ver pedidos pagos
  
  👥 *Gerenciar Admins:*
  /addadmin - Adicionar administrador
  /deladmin - Remover administrador
  /admins - Listar administradores
  
  📊 *Relatórios:*
  /relatorio - Relatório geral
  /vendas - Relatório de vendas
  `,

  adminOnly:
    "❌ *Acesso negado.*\n\nApenas administradores podem usar este comando.",
  adminAdded: "✅ *Administrador adicionado com sucesso!*",
  adminRemoved: "✅ *Administrador removido com sucesso!*",
  adminNotFound: "❌ *Administrador não encontrado.*",

  // Mensagens de produtos (admin)
  productAdded: "✅ *Produto adicionado com sucesso!*",
  productRemoved: "✅ *Produto removido com sucesso!*",
  productUpdated: "✅ *Produto atualizado com sucesso!*",

  // Mensagens de pedidos
  ordersList: "📋 *Relatório de Pedidos:*\n\n",
  noOrders: "📋 *Nenhum pedido encontrado.*",
  userOrders: "📋 *Seus Pedidos:*\n\n",
  noUserOrders: "📋 *Você ainda não fez nenhum pedido.*",

  // Mensagens de ajuda
  help: `
  🤖 *Comandos Disponíveis:*
  
  🛍️ *Para Clientes:*
  /start - Iniciar o bot
  /produtos - Ver catálogo de produtos
  /meus_pedidos - Ver seus pedidos
  /ajuda - Esta mensagem
  
  🔧 *Para Administradores:*
  /admin - Painel administrativo
  /addproduto - Adicionar produto
  /delproduto - Remover produto
  /pedidos - Ver pedidos
  /addadmin - Adicionar admin
  /deladmin - Remover admin
  
  💬 *Suporte:*
  Em caso de dúvidas, entre em contato conosco.
  `,

  // Mensagens de validação
  invalidCommand:
    "❓ *Comando não reconhecido.*\n\nUse /ajuda para ver os comandos disponíveis.",
  invalidInput:
    "❌ *Entrada inválida.*\n\nVerifique os dados e tente novamente.",
  missingData: "❌ *Dados incompletos.*\n\nTodos os campos são obrigatórios.",

  // Mensagens de sistema
  systemError:
    "❌ *Erro interno do sistema.*\n\nTente novamente em alguns instantes.",
  maintenance:
    "🔧 *Sistema em manutenção.*\n\nTente novamente em alguns minutos.",

  // Mensagens de relatório
  salesReport: `
  📊 *Relatório de Vendas*
  
  📅 *Período:* Últimos 30 dias
  💰 *Total vendido:* {totalAmount}
  📦 *Produtos vendidos:* {totalProducts}
  👥 *Clientes únicos:* {uniqueCustomers}
  📈 *Taxa de conversão:* {conversionRate}%
  
  🏆 *Produtos mais vendidos:*
  {topProducts}
  `,

  // Mensagens de configuração
  configUpdated: "✅ *Configuração atualizada com sucesso!*",
  configError: "❌ *Erro ao atualizar configuração.*",

  // Mensagens de notificação
  orderCreated:
    "🆕 *Novo pedido criado!*\n\nProduto: {productName}\nCliente: {userName}\nValor: {amount}",
  paymentReceived:
    "💰 *Pagamento recebido!*\n\nProduto: {productName}\nCliente: {userName}\nValor: {amount}",
  orderDelivered:
    "📦 *Produto entregue!*\n\nProduto: {productName}\nCliente: {userName}",

  // Mensagens de tempo
  orderExpiresIn: "⏰ *Seu pedido expira em:* {timeLeft}",
  orderExpired:
    "⏰ *Pedido expirado!*\n\nO tempo limite de 10 minutos foi excedido.",

  // Mensagens de sucesso
  success: "✅ *Operação realizada com sucesso!*",
  cancelled: "❌ *Operação cancelada.*",

  // Mensagens de informação
  info: "ℹ️ *Informação:*\n\n{message}",
  warning: "⚠️ *Atenção:*\n\n{message}",

  // Mensagens de contato
  contact: `
  📞 *Contato e Suporte*
  
  💬 *Para dúvidas ou problemas:*
  • Envie uma mensagem direta
  • Aguarde nossa resposta
  
  🕒 *Horário de atendimento:*
  Segunda a Sexta: 9h às 18h
  
  📧 *Email:* suporte@seudominio.com
  `,

  // Mensagens de agradecimento
  thankYou:
    "🙏 *Obrigado pela compra!*\n\nEsperamos que você aproveite o produto!",
  welcomeBack: "👋 *Bem-vindo(a) de volta!*\n\nComo posso ajudá-lo(a) hoje?",

  // Mensagens de promoção
  promotion: `
  🎉 *Promoção Especial!*
  
  💰 *Desconto:* {discount}%
  ⏰ *Válido até:* {expiryDate}
  
  Use o código: *{promoCode}*
  
  Aproveite esta oferta! 🚀
  `,

  // Mensagens de newsletter
  newsletter: `
  📰 *Newsletter*
  
  📧 *Receba novidades:*
  • Novos produtos
  • Promoções exclusivas
  • Dicas e tutoriais
  
  Para se inscrever, envie: /newsletter
  `,

  // Mensagens de feedback
  feedback: `
  💬 *Feedback*
  
  Sua opinião é muito importante para nós!
  
  📝 *Como avaliar:*
  • Produto: /avaliar_produto
  • Atendimento: /avaliar_atendimento
  • Sugestões: /sugestao
  
  Obrigado por nos ajudar a melhorar! 🙏
  `,

  // Mensagens de FAQ
  faq: `
  ❓ *Perguntas Frequentes*
  
  🤔 *Como funciona o pagamento?*
  R: Utilizamos PIX para pagamentos instantâneos e seguros.
  
  ⏰ *Quanto tempo demora a liberação?*
  R: A liberação é automática e instantânea após confirmação do pagamento.
  
  🔗 *O link expira?*
  R: Não, o acesso é vitalício.
  
  💰 *Posso solicitar reembolso?*
  R: Entre em contato conosco para avaliar sua solicitação.
  
  📱 *Funciona no celular?*
  R: Sim, todos os produtos são compatíveis com dispositivos móveis.
  `,
};
