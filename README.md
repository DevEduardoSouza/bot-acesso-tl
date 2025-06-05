# Bot de Acesso com Integração Mercado Pago

> ⚠️ **Status do Projeto**: Em Desenvolvimento

Um bot do Telegram desenvolvido em TypeScript que gerencia vendas e pagamentos através do Mercado Pago, oferecendo uma solução automatizada para controle de acesso e transações.

## 🚀 Funcionalidades

- Integração com Telegram Bot API
- Processamento de pagamentos via Mercado Pago
- Suporte a pagamentos PIX
- Sistema de banco de dados SQLite para armazenamento de transações
- Interface de usuário interativa com teclados personalizados
- Sistema de mensagens configuráveis

## 🛠️ Tecnologias Utilizadas

- TypeScript
- Node.js
- Telegram Bot API
- Mercado Pago API
- SQLite (better-sqlite3)
- dotenv para gerenciamento de variáveis de ambiente
- UUID para geração de identificadores únicos

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Conta no Telegram
- Conta no Mercado Pago (para processamento de pagamentos)

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone [URL_DO_REPOSITÓRIO]
cd bot_acesso_ts
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
TELEGRAM_TOKEN=seu_token_do_telegram
MERCADO_PAGO_ACCESS_TOKEN=seu_token_do_mercado_pago
```

## 🚀 Como Usar

1. Inicie o bot em modo desenvolvimento:

```bash
npm run dev
```

2. O bot estará disponível no Telegram assim que iniciar.

## ⚙️ Configuração

### Variáveis de Ambiente

- `TELEGRAM_TOKEN`: Token de autenticação do seu bot do Telegram
- `MERCADO_PAGO_ACCESS_TOKEN`: Token de acesso da API do Mercado Pago

### Banco de Dados

O projeto utiliza SQLite como banco de dados local. O arquivo `transactions.db` é criado automaticamente na primeira execução.

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Observações Importantes

- Mantenha suas chaves de API e tokens seguros
- Faça backup regular do banco de dados
- Monitore as transações para garantir a segurança
- Mantenha as dependências atualizadas

## 📧 Suporte

Para suporte, abra uma issue no repositório.
