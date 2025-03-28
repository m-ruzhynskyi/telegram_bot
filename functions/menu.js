import {post_start_create} from "../assets/text.js";

export const menu = (ctx) => {
  ctx.reply(post_start_create, {
    reply_markup: {
      keyboard: [
        ["Створити пост"]
      ],
      resize_keyboard: true
    }
  })
}