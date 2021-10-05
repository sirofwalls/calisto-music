const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class VolumeCommand extends BaseCommand {
  constructor() {
    super(
    'volume',
    '--',
    5,
    ['v'],
    messages.volume.description);
  }

  async run(message, args) {
    const modRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = modRoleFetch.get('moderatorRole');

    if (guildRoleCheck) {
      const modRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === modRoleFetch.get('moderatorRole').toLowerCase());
      if (modRole) {
        const roleCheck = message.member.roles.cache.has(modRole.id);
      
        if (roleCheck) {
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
        } else {
          message.reply('You do not have the correct role to execute this command.');
        }
      } else {
        message.reply('It looks like the moderator role needed no longer exists');
      }
    } else {
      message.reply('A Moderator role has not been defined yet. Talk to the server Admin.');
    }
  }
}