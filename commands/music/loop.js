const BaseCommand = require('../../util/structures/BaseCommand');
const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');

module.exports = class LoopCommand extends BaseCommand {
  constructor() {
    super(
    'loop',
    '--',
    5,
    ['l'],
    messages.loop.description);
  }

  async run(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.loop.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;

    // toggle from false to true and reverse
    queue.loop = !queue.loop;
    return queue.textChannel
      .send(messages.loop.result + `${ queue.loop ? messages.common.on : messages.common.off }`)
      .catch(console.error);
  }
}