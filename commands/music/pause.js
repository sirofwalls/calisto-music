const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

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
    const musicRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = musicRoleFetch.get('musicRole');

    if (guildRoleCheck) {
      const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === musicRoleFetch.get('musicRole').toLowerCase());
      if (musicRole) {
        const roleCheck = message.member.roles.cache.has(musicRole.id);
      
        if (roleCheck) {
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
