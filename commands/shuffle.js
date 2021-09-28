const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "shuffle",
  description: messages.shuffle.description,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(messages.shuffle.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.queue.set(message.guild.id, queue);
    queue.textChannel.send(`${message.author}` + messages.shuffle.result).catch(console.error);
  }
};
