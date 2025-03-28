export default function handleTelegramError(err, ctx) {
  if (err.response && err.response.error_code === 403) {
    console.log(`User ${ctx.from?.id} blocked bot.`);
  } else {
    console.error(err);
    ctx.reply("❌ Будь-ласка спробуйте пізніше.").catch(() => {});
  }
}