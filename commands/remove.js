const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

module.exports = {
  name: "remove",
  aliases: ["rm"],
  description: messages.remove.description,
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.channel.send(messages.remove.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;
    if (!args.length) return message.reply(messages.remove.usageReply, { prefix: message.client.prefix });

    const arguments = args.join("");
    const songs = arguments.split(",").map((arg) => parseInt(arg));
    let removed = [];

    if (pattern.test(arguments)) {
      queue.songs = queue.songs.filter((item, index) => {
        if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
        else return true;
      });

      queue.textChannel.send(
        `${message.author} ❌ removed **${removed.map((song) => song.title).join("\n")}** from the queue.`
      );
    } else if (!isNaN(args[0]) && args[0] >= 1 && args[0] <= queue.songs.length) {
      console.log("we got elsed!");
      return queue.textChannel.send(
        `${message.author} ❌ removed **${queue.songs.splice(args[0] - 1, 1)[0].title}** from the queue.`
      );
    } else {
      console.log("we got the last one");
      return message.reply(messages.remove.usageReply, { prefix: message.client.prefix });
    }
  }
};
