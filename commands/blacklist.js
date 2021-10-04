const blacklistModel = require('../schemas/blacklist');
const { MessageEmbed } = require('discord.js');
const { MONGODB_URI } = require("../util/botUtil");
const messages = require('../util/messages.json');
const BaseCommand = require('../util/structures/BaseCommand');

module.exports = class BlakclistCommand extends BaseCommand {
  constructor() {
    super(
    'blacklist',
    '--',
    5,
    [],
    messages.blacklist.description);
  }

  async run(message, args) {
    if(!MONGODB_URI) return message.channel.send('No Databse was provided. Blacklist system disabled!')
        
    const type = args[0];
    const member = message.mentions.users.first()
    const users = await blacklistModel.find();

    if (!type) {
        return message.channel.send(messagesblacklist.noType);
    }

    if (args[0] == 'list') {
        if (users.length == 0) {
            return message.channel.send(messages.blacklist.noBlacklisted);
        }

        let datas = []
        users.forEach((data, index) => {
            datas.push(`${index++ + 1} | ${data.username} (${data.userId})`)
        })

        const listEmbed = new MessageEmbed()
            .setAuthor(`Blacklist`, message.client.user.displayAvatarURL())
            .setDescription(datas.join('\n '))
            .setColor('#e5ebda')
            .setTimestamp()

        return message.channel.send(listEmbed)


    }

    if (!member) {
        return message.channel.send(messages.blacklist.provideMember);
    }

    if (member.id === message.client.user.id) {
        return message.channel.send(messages.blacklist.botMember);
    }


    switch (type) {
        case "add": {
            const existing = users.filter((u) => u.userId === member.id)[0];
            if (existing) {
                return message.channel.send(messages.blacklist.alreadyBlacklisted);
            }

            const blUser = new blacklistModel({ userId: member.id, username: member.username });

            await blUser.save();

            return message.channel.send(messages.blacklist.doneBlacklisted);
            break;
        }
        case "remove": {
            if (users === null) {
                return message.channel.send(messages.blacklist.notBlacklisted);
            }
            const exists = users.find((u) => u.userId === member.id);
            if (!exists) {
                return message.channel.send(messages.blacklist.notBlacklisted);
            }

            await blacklistModel.findOneAndDelete({ userId: member.id });
            return message.channel.send(messages.blacklist.userWhitelisted)
            break;
        }
        default: {
            return message.channel.send(messages.blacklist.noType)
        }
    }
  }
}