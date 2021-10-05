const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

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
    const musicRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = musicRoleFetch.get('musicRole');

    if (guildRoleCheck) {
      const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === musicRoleFetch.get('musicRole').toLowerCase());
      if (musicRole) {
        const roleCheck = message.member.roles.cache.has(musicRole.id);
      
        if (roleCheck) {
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