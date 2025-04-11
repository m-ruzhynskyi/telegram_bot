import {postContinueCreate, postStartCreate} from "../assets/text.js";

export const menu = (ctx, is_ready = true) => {
  ctx.reply(is_ready ? postStartCreate: postContinueCreate, {
    reply_markup: {
      keyboard: [
        ["Створити пост"]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  })
}