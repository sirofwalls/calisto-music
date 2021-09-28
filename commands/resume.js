const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: messages.resume.description,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.resume.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    if (!queue.playing) {
      queue.playing = !queue.playing;
      queue.connection.dispatcher.resume();
      return queue.textChannel
        .send(`${message.author}` + messages.resume.resultNotPlaying)
        .catch(console.error);
    }

    return message.reply(messages.resume.errorPlaying).catch(console.error);
  }
};
