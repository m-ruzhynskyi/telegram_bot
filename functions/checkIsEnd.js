import {menu} from "./menu.js";
import handleTelegramError from "./handlerTelegramError.js";

export default async function checkIsEnd(ctx) {
  try {

    const userInput = ctx.message?.text || ctx.callbackQuery?.data;

    if ((userInput === '❌ Скасувати')) {
      await ctx.reply("❌ Створення посту скасовано.");
      await menu(ctx);
      await ctx.scene.leave();
      return true
    }
  } catch (err) {
    handleTelegramError(err, ctx);
  }
  return false
}