import {post_start_create} from "../assets/text.js";

export const menu = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, post_start_create, {
    reply_markup: {
      keyboard: [
        ["Створити пост"]
      ]
    }
  })
}