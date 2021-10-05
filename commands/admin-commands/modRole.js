const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class ModRoleCommand extends BaseCommand {
  constructor() {
    super(
        'modrole',
        'admin',
        10,
        ['mr'],
        'Sets the moderator role in the database to control other commands that need it. ');
  }
  
  async run(message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) return;
    const guildId = message.guild.id;
    const moderRole = message.mentions.roles.first();
    if (moderRole) {
        const memberLogData = await GuildConfig.findOneAndUpdate({guildId}, {moderatorRole: moderRole.name}, {upsert: true});
        if (memberLogData) {
            message.channel.send(`The new Moderator Role is \`${moderRole.name}\``).then((replyMessage) => {
              replyMessage.delete({timeout: 2000});
              message.delete({timeout: 200});
            });
        } else (err) => {
            message.reply('There was an issue updating the Moderator Role');
        }
    } else {
        message.reply('That role does not exist, or is not a valid role').then((replyMessage) => {
          replyMessage.delete({timeout: 2000});
          message.delete({timeout: 200});
        });
    }
  }
}