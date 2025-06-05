import { InlineKeyboardMarkup } from "node-telegram-bot-api";

export const keyboards: { [key: string]: InlineKeyboardMarkup } = {
  payment: {
    inline_keyboard: [[{ text: "💰 Pagar via PIX", callback_data: "payment" }]],
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

export const markdownConfig = {
  parse_mode: "Markdown" as const,
};
