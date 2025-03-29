import {Telegraf, session, Scenes} from "telegraf";
import dotenv from "dotenv";
import {greetings, what_I_need} from "./assets/text.js";
import {menu} from "./functions/menu.js";
import {createPost} from "./functions/createPost.js";
import handleTelegramError from "./functions/handlerTelegramError.js";

dotenv.config();

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

const stage = new Scenes.Stage([createPost]);
bot.use(stage.middleware());

bot.start(async (ctx) => {
  try {
    await ctx.reply(greetings);
    await ctx.reply(what_I_need);
    await menu(ctx);
  } catch (err) {
    handleTelegramError(err, ctx);
  }
});

bot.hears("Створити пост", async (ctx) => {
  try {
    await ctx.scene.enter("postScene")
  } catch (err) {
    handleTelegramError(err, ctx);
  }
});

bot.catch((err, ctx) => {
  console.error(`Error in ${ctx.updateType}`, err);
  handleTelegramError(err, ctx);
});

bot.launch().catch((err) => console.error("Error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
