const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "pause",
  description: messages.pause.description,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.pause.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      return queue.textChannel
        .send(`${message.author}` + messages.pause.result)
        .catch(console.error);
    }
  }
};
