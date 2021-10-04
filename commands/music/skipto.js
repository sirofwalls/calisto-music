const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');

module.exports = class SkipToCommand extends BaseCommand {
  constructor() {
    super(
    'skipto',
    '--',
    5,
    ['st'],
    messages.skipto.description);
  }

  async run(message, args) {
    if (!args.length || isNaN(args[0]))
      return message
        .reply(messages.skipto.usageReply + `${ message.client.prefix }${module.exports.name } <Queue Number>`)
        .catch(console.error);

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(messages.skipto.errorNotQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;
    if (args[0] > queue.songs.length)
      return message
        .reply(messages.skipto.errorNotValid + `${queue.songs.length}`)
        .catch(console.error);

    queue.playing = true;

    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }

    queue.connection.dispatcher.end();
    queue.textChannel
      .send(`${message.author}` + messages.skipto.result)
      .catch(console.error);
  }
}