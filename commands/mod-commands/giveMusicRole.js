const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class MusicRoleControlCommand extends BaseCommand {
    constructor() {
        super(
            'musiccontrol',
            'admin',
            30,
            ['mc'],
            'Controls access to the music role. Either giving, or taking away from users. (Music Mods only)'
        );
    }
  
    async run(message, args) {
  
      if (message.guild.me.hasPermission("MANAGE_ROLES")){
        const dbFetch = await GuildConfig.findOne({guildId: message.guild.id});
        const guildRoleCheck = dbFetch.get('moderatorRole');
  
        if (guildRoleCheck) {
          const moderRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === dbFetch.get('moderatorRole').toLowerCase());
          if (moderRole) {
              const guildmusicCheck = dbFetch.get('musicRole');
              if (guildmusicCheck) {
                  const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === dbFetch.get('musicRole').toLowerCase());
                  if (musicRole) {
                      const roleCheck = message.member.roles.cache.has(moderRole.id);
                      if (roleCheck) {
                          const {mentions} = message;
                          const target = mentions.users.first();
                          if (target) {
                              const equalModRole = message.guild.members.cache.get(target.id)._roles.includes(moderRole.id);
                              const isAdmin = message.guild.members.cache.get(target.id).hasPermission('ADMINISTRATOR')
                              if (!equalModRole && !isAdmin || message.member.hasPermission('ADMINISTRATOR')) {
                                  const musicRoleCheck = message.guild.members.cache.get(target.id)._roles.includes(musicRole.id);
                                  if (!musicRoleCheck) {
                                      message.guild.members.cache.get(target.id).roles.add(musicRole.id);
                                      message.channel.send (`I gave ${target} the role to play music`);
                                  } else {
                                    message.guild.members.cache.get(target.id).roles.remove(musicRole.id);
                                    message.channel.send (`I removed the role from ${target} to play music`);
                                  }
                              } else {
                                  message.reply('You cannot give the music role to a member with the same moderator role as you or an Admin.');
                              }
                          } else {
                              message.reply('You need to mention a user to give the music role to');
                          }
                      } else {
                          message.reply('You do not have the correct role to execute this command.');
                      }
                  } else {
                      message.reply('It looks like the music role needed no longer exists. Please talk to the server admin');
                  }
              } else {
                  message.reply('A music role has not been defined yet. Talk to the server Admin.');
              }
          } else {
              message.reply('It looks like the moderator role needed no longer exists');
          }
        } else {
              message.reply('A Moderator role has not been defined yet. Talk to the server Admin.');
        }
      } else {
          message.reply('I do not have the correct permissions to do that. Talk with the Server Admin')
      }
    }
  }