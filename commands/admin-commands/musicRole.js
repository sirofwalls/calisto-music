const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class MusicRoleCommand extends BaseCommand {
  constructor() {
    super(
        'musicrole',
        'admin',
        10,
        [],
        'Sets the music role in the database to allow access to control the music. ');
  }
  
  async run(message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) return;
    const guildId = message.guild.id;
    const musicRole = message.mentions.roles.first();
    if (musicRole) {
        const memberLogData = await GuildConfig.findOneAndUpdate({guildId}, {musicRole: musicRole.name}, {upsert: true});
        if (memberLogData) {
            message.channel.send(`The new Music  Role is \`${musicRole.name}\``).then((replyMessage) => {
              replyMessage.delete({timeout: 2000});
              message.delete({timeout: 200});
            });
        } else (err) => {
            message.reply('There was an issue updating the Music Role');
        }
    } else {
        message.reply('That role does not exist, or is not a valid role').then((replyMessage) => {
          replyMessage.delete({timeout: 2000});
          message.delete({timeout: 200});
        });
    }
  }
}