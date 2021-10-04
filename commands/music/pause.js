const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');

module.exports = class Pauseommand extends BaseCommand {
  constructor() {
    super(
    'pause',
    '--',
    5,
    [],
    messages.pause.description);
  }

  async run(message, args) {
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
}
