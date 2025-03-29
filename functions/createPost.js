import {Scenes, Markup, session} from "telegraf";
import { create_post_text } from "../assets/text.js";
import handleTelegramError from "./handlerTelegramError.js";
import postMessageBuilder from "./postMessageBuilder.js";

const [title, price, article, mark, description, link, hashtags] = Object.values(create_post_text);

export const createPost = new Scenes.WizardScene(
  "postScene",

  // Title
  async (ctx) => {
    try {
      await ctx.reply(title);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Price
  async (ctx) => {
    try {
      ctx.session.postData = ctx.session.postData || {};
      ctx.session.postData.title = ctx.message.text;
      await ctx.reply(price);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Price Validation and Mark Prompt
  async (ctx) => {
    try {
      const priceValue = parseInt(ctx.message.text);

      if (isNaN(priceValue)) {
        await ctx.reply("❌ Ціна повинна бути числом! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.price = priceValue;
      await ctx.reply(article);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Article
  async (ctx) => {
    try {
      const articleValue = parseInt(ctx.message.text);

      if (isNaN(articleValue)) {
        await ctx.reply("❌ Артикул повинен бути числом! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.article = ctx.message.text;
      await ctx.reply(
        mark,
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🆒", "🆒"),
            Markup.button.callback("⚠️", "⚠️"),
          ],
          [
            Markup.button.callback("🆗", "🆗"),
            Markup.button.callback("🆕", "🆕"),
          ],
        ])
      );
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Description
  async (ctx) => {
    try {
      if (!ctx.callbackQuery) {
        await ctx.reply("❌ Виберіть з запропонованих варіантів! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.mark = ctx.callbackQuery.data;
      await ctx.reply(description);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Description
  async (ctx) => {
    try {
      ctx.session.postData.description = ctx.message.text;
      await ctx.reply(link);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  async (ctx) => {
    try {
      ctx.session.postData.link = ctx.message.text
      await ctx.reply(hashtags)
      return ctx.wizard.next();
    } catch (error) {
      handleTelegramError(error, ctx);
    }
  },

  // Handle Mark Selection and Finish
  async (ctx) => {
    try {
      ctx.session.postData.hashtags = ctx.message.text.split(' ').map(tag => '#' + tag).join(' ');
      const post = ctx.session.postData;
      await ctx.reply("✅ Твій пост створено !");
      await ctx.replyWithHTML(postMessageBuilder(post),
        {
          disable_web_page_preview: true
        }
      );

      delete ctx.session.postData;
      return ctx.scene.leave();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  }
)

