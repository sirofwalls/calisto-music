const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');

module.exports = class SkipCommand extends BaseCommand {
  constructor() {
    super(
    'skip',
    '--',
    5,
    ['s'],
    messages.skip.description);
  }

  async run(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.skip.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    queue.playing = true;
    queue.connection.dispatcher.end();
    queue.textChannel.send(`${ message.author } ` + messages.skip.result).catch(console.error);
  }
}