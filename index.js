import {Telegraf} from "telegraf";
import dotenv from "dotenv";
import {text} from "./assets/text.js";
import {menu} from "./functions/menu.js";
import createPost from "./functions/createPost.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
  const chatID = ctx.chat.id

  ctx.reply(text)

  menu(bot, chatID)
});


bot.on("message", (ctx) => {

  const chatID = ctx.chat.id

  if (ctx.message.text === 'Створити пост') {
    createPost(bot, chatID)
  }
})


bot.launch()
