const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: messages.skip.description,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.skip.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    queue.playing = true;
    queue.connection.dispatcher.end();
    queue.textChannel.send(`${ message.author } ` + messages.skip.result).catch(console.error);
  }
};
