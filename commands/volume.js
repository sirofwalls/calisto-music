const { canModifyQueue } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  name: "volume",
  aliases: ["v"],
  description: messages.volume.description,
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(messages.volume.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member))
      return message.reply(messages.volume.errorNotChannel).catch(console.error);

    if (!args[0]) return message.reply(messages.volume.currentVolume + `**${ queue.volume }**`).catch(console.error);
    if (isNaN(args[0])) return message.reply(messages.volume.errorNotNumber).catch(console.error);
    if (Number(args[0]) > 100 || Number(args[0]) < 0)
      return message.reply(messages.volume.errorNotValid).catch(console.error);

    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    return queue.textChannel.send(messages.volume.result + `**${ args[0] }**`).catch(console.error);
  }
};
