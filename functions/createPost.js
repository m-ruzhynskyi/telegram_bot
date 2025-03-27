import {create_post_text} from "../assets/text.js";

export default function createPost(bot, chatID) {
  const {description, mark, link, title, price, article} = create_post_text
  const post = {
    title: "",
    price: 0,
    article: 0,
    quality: {
      mark: 0,
      description: ""
    },
    link: "",
    tags: []
  }

  bot.telegram.sendMessage(chatID, title)

  bot.on("text", (ctx) => {
  })


  return ""
}