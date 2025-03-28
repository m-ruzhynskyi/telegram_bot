import {Scenes, Markup} from "telegraf";
import {create_post_text} from "../assets/text.js";

const [title, price, article, mark, description, link] = Object.values(create_post_text);

export const createPost = new Scenes.WizardScene(
    'postScene',

    //  Title
    (ctx) => {
      ctx.reply(title);
      return ctx.wizard.next();

    },
    // Price
    (ctx) => {
      ctx.session.postData = ctx.session.postData || {};
      ctx.session.postData.title = ctx.message.text;
      ctx.reply(price);
      return ctx.wizard.next();
    },

    // Price Validation and Mark Prompt
    (ctx) => {
      const priceValue = parseInt(ctx.message.text);

      if (isNaN(priceValue)) {
        ctx.reply("❌ Ціна повинна бути числом! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.price = priceValue;
      ctx.reply(article);
      return ctx.wizard.next();
    },

    // Article
    (ctx) => {
      const articleValue = parseInt(ctx.message.text);

      if (isNaN(articleValue)) {
        ctx.reply("❌ Артикул повинен бути числом! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.article = ctx.message.text;
      ctx.reply(
        mark,
        Markup.inlineKeyboard([
          [Markup.button.callback("🆒", "🆒"), Markup.button.callback("⚠️", "⚠️")],
          [Markup.button.callback("🆗", "🆗"), Markup.button.callback("🆕", "🆕")],
        ])
      );
      return ctx.wizard.next();
    },

    // Description
    (ctx) => {
      if (!ctx.callbackQuery) {
        ctx.reply("❌ Виберіть з запропонованих варіантів! Спробуйте ще раз:");
        return;
      }

      ctx.session.postData.mark = ctx.callbackQuery.data;
      ctx.reply(description);
      return ctx.wizard.next();
    }
    ,

    // Link
    (ctx) => {
      ctx.session.postData.description = ctx.message.text;
      ctx.reply(link);
      return ctx.wizard.next();
    },

    // Handle Mark Selection and Finish
    (async (ctx) => {
      ctx.session.postData.link = ctx.message.text;
      const post = ctx.session.postData;

      await ctx.reply('✅ Твій пост створено !')
      await ctx.replyWithHTML(
        `<b>${post.title}</b>\n\n` +
        `💰 Ціна: ${post.price} грн\n` +
        `📌 Артикул: ${post.article}\n` +
        `${post.mark} Уцінка: ${post.description}\n\n` +
        `➡️ <a href="${post.link}"><u>Опис товару на сайті</u></a> ⬅️`,
        {
          disable_web_page_preview: true
        }
      );


      delete ctx.session.postData;
      return ctx.scene.leave();
    })
  )
;