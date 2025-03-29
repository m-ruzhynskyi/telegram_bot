import {post_continue_create, post_start_create} from "../assets/text.js";

export const menu = (ctx, is_ready = true) => {
  ctx.reply(is_ready ? post_start_create: post_continue_create, {
    reply_markup: {
      keyboard: [
        ["Створити пост"]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  })
}