import { Scenes, Markup, session } from "telegraf";
import { create_post_text } from "../assets/text.js";
import handleTelegramError from "./handlerTelegramError.js";
import postMessageBuilder from "./postMessageBuilder.js";
import { bot } from "../index.js";
import { menu } from "./menu.js";
import checkIsEnd from "./checkIsEnd.js";

const [title, price, article, mark, description, link, hashtags] = Object.values(create_post_text);

export const createPost = new Scenes.WizardScene(
  "postScene",

  // Photo Upload
  async (ctx) => {
    try {
      await ctx.reply(
        "📸 Надішліть до 5 фото. Напишіть \"✅ Готово\", коли закінчите.",
        Markup.keyboard([["✅ Готово"], ["❌ Скасувати"]]).resize().oneTime()
      );
      ctx.session.postData = ctx.session.postData || {};
      ctx.session.postData.photos = [];
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Photo Processing
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;

      if (ctx.message?.photo) {
        const fileId = ctx.message.photo.pop().file_id;
        if (ctx.session.postData.photos.length < 5) {
          ctx.session.postData.photos.push(fileId);
          await ctx.reply(`Фото ${ctx.session.postData.photos.length}/5 прийнято.`);
        } else {
          await ctx.reply("Ви вже надіслали 5 фото. Напишіть \"✅ Готово\" або \"готово\", щоб продовжити.");
        }
      } else if (ctx.message?.text?.trim().toLowerCase() === "готово" || ctx.message?.text?.trim() === "✅ Готово") {
        if (!ctx.session.postData || ctx.session.postData.photos.length === 0) {
          await ctx.reply("❌ Потрібно додати хоча б одне фото. Спробуйте ще раз:");
          return;
        }
        await ctx.reply(title);
        return ctx.wizard.next();
      } else {
        await ctx.reply("Надішліть фото або напишіть \"✅ Готово\", якщо завершили.");
      }
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Title
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      ctx.session.postData.title = ctx.message.text;
      await ctx.reply(price);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Price Validation
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      const priceValue = ctx.message.text;
      if (isNaN(parseInt(priceValue))) {
        await ctx.reply("❌ Ціна повинна бути числом! Спробуйте ще раз:");
        return;
      }

      if (+priceValue >= 10000) {
        ctx.session.postData.price = `${priceValue.slice(0, 2)} ${priceValue.slice(2)}`;
      } else if (+priceValue >= 1000) {
        ctx.session.postData.price = `${priceValue[0]} ${priceValue.slice(1)}`;
      } else {
        ctx.session.postData.price = priceValue;
      }

      await ctx.reply(article);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Article
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      const articleValue = parseInt(ctx.message.text);
      if (isNaN(articleValue)) {
        await ctx.reply("❌ Артикул повинен бути числом! Спробуйте ще раз:");
        return;
      }
      ctx.session.postData.article = ctx.message.text;
      await ctx.reply(mark, Markup.inlineKeyboard([
        [Markup.button.callback("🆒", "🆒"), Markup.button.callback("⚠️", "⚠️")],
        [Markup.button.callback("🆗", "🆗"), Markup.button.callback("🆕", "🆕")],
      ]));
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Mark
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
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
      if (await checkIsEnd(ctx)) return;
      ctx.session.postData.description = ctx.message.text;
      await ctx.reply(link);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Link
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      ctx.session.postData.link = ctx.message.text;
      await ctx.reply(hashtags);
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Hashtags and Preview
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      ctx.session.postData.hashtags = ctx.message.text;
      await ctx.reply("✅ Твій пост створено!");
      const post = ctx.session.postData;

      // Send preview as a media group
      if (post.photos.length > 0) {
        const mediaGroup = post.photos.map((photo, index) => ({
          type: "photo",
          media: photo,
          ...(index === 0 && {
            caption: postMessageBuilder(post),
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        }));

        await ctx.replyWithMediaGroup(mediaGroup);
      }

      await ctx.reply("Відправити пост в канал?", Markup.inlineKeyboard([
        [Markup.button.callback('✅', '1'), Markup.button.callback('❌', '0')]
      ]));
      return ctx.wizard.next();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  },

  // Sending to Channel
  async (ctx) => {
    try {
      if (await checkIsEnd(ctx)) return;
      if (!ctx.callbackQuery) {
        await ctx.reply("❌ Виберіть з запропонованих варіантів! Спробуйте ще раз:");
        return;
      }

      if (ctx.callbackQuery.data === '1') {
        const post = ctx.session.postData;
        try {
          if (post.photos.length > 0) {
            const mediaGroup = post.photos.map((photo, index) => ({
              type: "photo",
              media: photo,
              ...(index === 0 && {
                caption: postMessageBuilder(post),
                parse_mode: "HTML",
                disable_web_page_preview: true
              })
            }));

            await bot.telegram.sendMediaGroup(process.env.CHAT_ID, mediaGroup);
          }
          await ctx.reply("✅ Пост відправлено!");
        } catch (err) {
          await ctx.reply("Упс... Не вдалося відправити пост. Спробуй ще раз або зроби це самостійно 😊.");
        }
      }

      await menu(ctx, false);
      delete ctx.session.postData;
      return ctx.scene.leave();
    } catch (err) {
      handleTelegramError(err, ctx);
    }
  }
);
