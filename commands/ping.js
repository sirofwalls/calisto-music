const BaseCommand = require('../util/structures/BaseCommand');
const messages = require('../util/messages.json');

module.exports = class PingCommand extends BaseCommand {
  constructor() {
    super(
        'ping',
        'public',
        5,
        [],
        messages.help.description);
  }

  async run(message, args) {
    message.channel.send(`Pong! :ping_pong:`).then((replyMessage) => {
      replyMessage.delete({timeout: 2000})
    });
    message.delete({timeout: 2000});
  }
}