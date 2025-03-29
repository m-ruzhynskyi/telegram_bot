import {Scenes, Markup, session} from "telegraf";
import {create_post_text} from "../assets/text.js";
import handleTelegramError from "./handlerTelegramError.js";
import postMessageBuilder from "./postMessageBuilder.js";
import {bot} from "../index.js";
import {menu} from "./menu.js";
import checkIsEnd from "./checkIsEnd.js";

const [title, price, article, mark, description, link, hashtags] = Object.values(create_post_text);

export const createPost = new Scenes.WizardScene(
  "postScene",

  // Title
  async (ctx) => {
    try {
      await ctx.reply(title, {
        reply_markup: {
          keyboard: [
            ["❌ Скасувати"]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      if (await checkIsEnd(ctx)) return

      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Price
  async (ctx) => {
    try {

      if (await checkIsEnd(ctx)) return

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

      if (await checkIsEnd(ctx)) return

      if (isNaN(priceValue)) {
        await ctx.reply("❌ Ціна повинна бути числом! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.price = priceValue;
      await ctx.reply(article);
      return ctx.wizard.next();
    } catch
      (err) {
      handleTelegramError(err, ctx);
    }
  },

// Article
  async (ctx) => {
    try {
      const articleValue = parseInt(ctx.message.text);

      if (await checkIsEnd(ctx)) return

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

      if (await checkIsEnd(ctx)) return

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
      if (await checkIsEnd(ctx)) return

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

      if (await checkIsEnd(ctx)) return

      ctx.session.postData.hashtags = ctx.message.text.split(' ').map(tag => '#' + tag).join(' ');
      const post = ctx.session.postData;
      await ctx.reply("✅ Твій пост створено !");
      await ctx.replyWithHTML(postMessageBuilder(post),
        {
          disable_web_page_preview: true
        }
      );

      await ctx.reply('Відправити пост в канал ? ', Markup.inlineKeyboard([
        [
          Markup.button.callback('✅', '1'),
          Markup.button.callback('❌', '0')
        ]
      ]))

      return ctx.wizard.next();

    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  async (ctx) => {
    try {

      if (await checkIsEnd(ctx)) return

      if (!ctx.callbackQuery) {
        await ctx.reply("❌ Виберіть з запропонованих варіантів! Спробуйте ще раз:");
        return;
      }

      if (ctx.callbackQuery.data === '1') {
        const post = ctx.session.postData;
        try {
          await bot.telegram.sendMessage(process.env.CHAT_ID, postMessageBuilder(post), {
            parse_mode: 'HTML',
          })
          await ctx.reply('✅ Пост відправлено!').catch()
        } catch (err) {
          await ctx.reply('Упс... Не вдалося відправити пост. Спробуй ще раз або зроби це самостійно 😊.').catch()
        }
      }

      await menu(ctx, false)

      delete ctx.session.postData;
      return ctx.scene.leave();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  }
)