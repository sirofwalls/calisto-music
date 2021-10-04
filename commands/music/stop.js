const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');

module.exports = class StopCommand extends BaseCommand {
  constructor() {
    super(
    'stop',
    '--',
    5,
    [],
    messages.stop.description);
  }

  async run(message, args) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(messages.stop.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    queue.songs = [];
    queue.connection.dispatcher.end();
    queue.textChannel.send(`${message.author}` + messages.stop.result).catch(console.error);
  }
}