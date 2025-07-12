# 🤖 Bot de Vendas de Produtos Digitais - Telegram

Sistema completo de vendas de produtos digitais via Telegram com integração ao Mercado Pago para pagamentos via PIX. Liberação automática de produtos após confirmação de pagamento.

## 🚀 Funcionalidades

### ✅ Funcionalidades Essenciais do MVP

#### 1. 📦 Catálogo de Produtos Simples

- **Comando `/produtos`** - Exibe lista de produtos com nome, descrição e preço
- Cada produto tem botão "Comprar"
- Suporte a diferentes tipos: E-books, Cursos, Softwares, Templates
- Preços em centavos para precisão

#### 2. 💳 Geração de Pix Dinâmico

- Integração com API privada do Mercado Pago
- Geração automática de QR Code PIX
- Código PIX copia/cola
- Link de pagamento direto

#### 3. ✅ Validação Automática de Pagamento

- Verificação automática via API do Mercado Pago
- Liberação instantânea do produto após confirmação
- Tempo de expiração: 10 minutos
- Notificação automática ao usuário

#### 4. 🔧 Comandos de Administração

- **`/addproduto`** - Adicionar novos produtos
- **`/delproduto`** - Remover produtos
- **`/pedidos`** - Listar pedidos (pagos e não pagos)
- **`/addadmin`** - Adicionar administradores
- **`/deladmin`** - Remover administradores
- **`/relatorio`** - Relatórios de vendas

#### 5. 📊 Sistema de Logs

- Registro completo de transações
- Histórico de pedidos por usuário
- Relatórios administrativos
- Logs de sistema

### 🎯 Funcionalidades Adicionais

- **Interface intuitiva** com botões inline
- **Sistema de administradores** com diferentes níveis de permissão
- **Validações robustas** de dados
- **Tratamento de erros** completo
- **Encerramento gracioso** do sistema
- **Produtos de exemplo** para demonstração
- **Suporte a múltiplos produtos** simultâneos

## 🛠️ Tecnologias Utilizadas

- **TypeScript** - Linguagem principal
- **Node.js** - Runtime JavaScript
- **node-telegram-bot-api** - API do Telegram
- **better-sqlite3** - Banco de dados SQLite
- **mercadopago** - SDK do Mercado Pago
- **dotenv** - Gerenciamento de variáveis de ambiente
- **uuid** - Geração de IDs únicos

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no Mercado Pago com API habilitada
- Bot do Telegram criado via @BotFather

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd BOT_ACESSO_TS
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Telegram Bot Token (obtido via @BotFather)
TELEGRAM_TOKEN=seu_token_aqui

# Mercado Pago Access Token
MERCADO_PAGO_ACCESS_TOKEN=seu_token_mercado_pago

# ID do Administrador Principal (seu ID do Telegram)
DEFAULT_ADMIN_ID=123456789
```

### 4. Configure o Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Obtenha o Access Token
4. Configure o webhook (opcional)

### 5. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📱 Como Usar

### Para Clientes

1. **Iniciar o bot**: `/start`
2. **Ver produtos**: `/produtos`
3. **Comprar produto**: Clique em "Comprar" e siga as instruções
4. **Ver pedidos**: `/meus_pedidos`
5. **Ajuda**: `/ajuda`

### Para Administradores

1. **Painel administrativo**: `/admin`
2. **Adicionar produto**: `/addproduto`
3. **Remover produto**: `/delproduto`
4. **Ver pedidos**: `/pedidos`
5. **Adicionar admin**: `/addadmin`
6. **Relatórios**: `/relatorio`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `products` - Produtos

- `id` - ID único do produto
- `name` - Nome do produto
- `description` - Descrição detalhada
- `price` - Preço em centavos
- `download_link` - Link de download
- `type` - Tipo (ebook, curso, software, template, outro)
- `status` - Status (active, inactive)
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- `created_by` - ID do admin que criou

#### `orders` - Pedidos

- `id` - ID único do pedido
- `user_id` - ID do usuário
- `user_name` - Nome do usuário
- `product_id` - ID do produto
- `product_name` - Nome do produto
- `quantity` - Quantidade
- `total_price` - Preço total em centavos
- `status` - Status (pending, paid, expired, cancelled, delivered)
- `mercado_pago_id` - ID da transação no Mercado Pago
- `qr_code` - QR Code PIX
- `payment_url` - URL de pagamento
- `created_at` - Data de criação
- `expires_at` - Data de expiração
- `paid_at` - Data de pagamento
- `delivered_at` - Data de entrega

#### `admins` - Administradores

- `id` - ID do administrador
- `name` - Nome do administrador
- `username` - Username do Telegram
- `role` - Função (admin, super_admin)
- `status` - Status (active, inactive)
- `created_at` - Data de criação

## 🔧 Configuração Avançada

### Adicionando Produtos

Via comando `/addproduto` ou enviando mensagem no formato:

```
Nome: Nome do Produto
Descrição: Descrição detalhada do produto
Preço: 29.90 (em reais)
Tipo: ebook/curso/software/template/outro
Link: https://exemplo.com/download
```

### Adicionando Administradores

Via comando `/addadmin` ou enviando mensagem no formato:

```
ID: 123456789 (ID do usuário no Telegram)
Nome: Nome do Administrador
Username: @username (opcional)
Role: admin/super_admin
```

### Configuração de Webhook (Opcional)

Para produção, recomenda-se usar webhooks ao invés de polling:

```typescript
// Em src/service/bot/Telegram.ts
this.bot = new TelegramBot(token, {
  webHook: {
    port: 8443,
    host: "localhost",
  },
});
```

## 📊 Relatórios Disponíveis

- **Relatório Geral**: Visão geral das vendas
- **Relatório de Vendas**: Detalhado por período
- **Estatísticas**: Métricas de performance
- **Pedidos por Status**: Filtros por status

## 🔒 Segurança

- Validação de permissões de administrador
- Sanitização de dados de entrada
- Tratamento seguro de tokens
- Logs de auditoria
- Encerramento gracioso

## 🚨 Tratamento de Erros

- Validação de dados de entrada
- Tratamento de erros da API do Mercado Pago
- Fallbacks para falhas de rede
- Logs detalhados de erros
- Notificações de erro para usuários

## 📈 Monitoramento

- Logs de sistema em tempo real
- Estatísticas de uso
- Monitoramento de saúde do bot
- Alertas de erro

## 🔄 Manutenção

### Comandos Úteis

```bash
# Verificar status do bot
curl http://localhost:3000/health

# Backup do banco de dados
cp bot_acesso.db backup_$(date +%Y%m%d_%H%M%S).db

# Limpar logs antigos
find . -name "*.log" -mtime +7 -delete
```

### Atualizações

1. Faça backup do banco de dados
2. Pare o bot: `Ctrl+C`
3. Atualize o código: `git pull`
4. Instale dependências: `npm install`
5. Reinicie: `npm start`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Documentação**: Este README
- **Issues**: GitHub Issues
- **Telegram**: @seu_username

## 🎯 Roadmap

- [ ] Sistema de cupons de desconto
- [ ] Integração com múltiplos gateways de pagamento
- [ ] Sistema de afiliados
- [ ] Dashboard web administrativo
- [ ] API REST para integrações
- [ ] Sistema de notificações push
- [ ] Relatórios avançados com gráficos
- [ ] Sistema de avaliações de produtos
- [ ] Integração com WhatsApp Business
- [ ] Sistema de assinaturas recorrentes

## 📝 Changelog

### v1.0.0 (2024-01-XX)

- ✅ Sistema básico de vendas
- ✅ Integração com Mercado Pago
- ✅ Liberação automática de produtos
- ✅ Sistema de administração
- ✅ Relatórios básicos
- ✅ Interface intuitiva

---

**Desenvolvido com ❤️ para facilitar vendas de produtos digitais via Telegram**
