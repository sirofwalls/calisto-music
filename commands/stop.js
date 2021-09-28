const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "stop",
  description: messages.stop.description,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(messages.stop.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    queue.songs = [];
    queue.connection.dispatcher.end();
    queue.textChannel.send(`${message.author}` + messages.stop.result).catch(console.error);
  }
};
