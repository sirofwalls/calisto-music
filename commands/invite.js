const BaseCommand = require('../util/structures/BaseCommand');
const messages = require('../util/messages.json');

module.exports = class InviteCommand extends BaseCommand {
  constructor() {
    super(
    'invite',
    'owner',
    60,
    [],
    messages.invite.description);
  }

  async run(message, args) {
    return message.member
      .send(
        `https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=338717761&scope=bot
    `
      )
      .catch(console.error);
  }
}