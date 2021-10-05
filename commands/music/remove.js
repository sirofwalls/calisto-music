const { canModifyQueue } = require("../../util/botUtil");
const messages = require('../../util/messages.json');
const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class RemoveCommand extends BaseCommand {
  constructor() {
    super(
    'remove',
    '--',
    5,
    ['rm'],
    messages.remove.description);
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

            if (!queue) return message.channel.send(messages.remove.errorNotQueue).catch(console.error);
            if (!canModifyQueue(message.member)) return messages.common.errorNotChannel;
            if (!args.length) return message.reply(messages.remove.usageReply + `${prefix}remove <Queue Number>`);

            const argument = args.join("");
            const songs = argument.split(",").map((arg) => parseInt(arg));
            let removed = [];

            if (pattern.test(argument)) {
              queue.songs = queue.songs.filter((item, index) => {
                if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
                else return true;
              });

              queue.textChannel.send(
                `${message.author} ❌ removed **${removed.map((song) => song.title).join("\n")}** from the queue.`
              );
            } else if (!isNaN(args[0]) && args[0] >= 1 && args[0] <= queue.songs.length) {
              console.log("we got elsed!");
              return queue.textChannel.send(
                `${message.author} ❌ removed **${queue.songs.splice(args[0] - 1, 1)[0].title}** from the queue.`
              );
            } else {
              console.log("we got the last one");
              return message.reply(messages.remove.usageReply + `${prefix}remove <Queue Number>`);
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