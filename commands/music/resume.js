const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');

module.exports = class ResumeCommand extends BaseCommand {
  constructor() {
    super(
    'resume',
    '--',
    5,
    ['r'],
    messages.resume.description);
  }

  async run(message, args) {
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
}