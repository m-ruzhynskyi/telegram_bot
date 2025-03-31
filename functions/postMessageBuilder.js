export default function postMessageBuilder({title, price, article, mark, description, link, hashtags}) {
  return `<b>${title}</b>\n\n` +
          `💰 Ціна: ${price} грн\n` +
          `📌 Артикул: ${article}\n` +
          `${mark} Уцінка: ${description}\n\n` +
          `➡️ <a href="${link}">Опис товару на сайті</a> ⬅️\n\n` +
          `Для запитань:\n` +
          `📞 <a href="tel:+380442470786">+380442470786</a>\n` +
          `✉️ <a href="https://jysk.ua/customer-service-category/13152?question=ka07T000000c2JBQAY#service-category-ka07T000000c2JBQAY"><u>Написати лист</u></a>\n\n` +
          `${hashtags}\n#JYSK #Outlet #Знижка `
}