import {Telegraf, session, Scenes} from "telegraf";
import dotenv from "dotenv";
import {greetings, what_I_need} from "./assets/text.js";
import {menu} from "./functions/menu.js";
import {createPost} from "./functions/createPost.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

const stage = new Scenes.Stage([createPost]);
bot.use(stage.middleware());

bot.start(async (ctx) => {
  [greetings, what_I_need].map(async (el) => await ctx.reply(el));
  await menu(ctx)
});

bot.hears("Створити пост", (ctx) => ctx.scene.enter("postScene"));

bot.catch((err, ctx) => {
  console.error(`Error in ${ctx.updateType}`, err);
  ctx.reply("❌ Будь-ласка спробуйте пізніше.");
});

bot.launch()
  .catch((err) => console.error("Error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));