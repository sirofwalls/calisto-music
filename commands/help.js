const BaseCommand = require('../util/structures/BaseCommand');
const { MessageEmbed } = require("discord.js");
const messages = require('../util/messages.json');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super(
    'help',
    'help',
    5,
    ['h'],
    messages.help.description);
  }

  async run(message, args) {
    var commands = message.client.commands;
    var arrayCheck = [];

    var helpEmbed = new MessageEmbed()
      .setTitle(message.client.user.username)
      .setDescription(messages.help.embedDescription)
      .setColor("#F8AA2A");

    commands.forEach(cmd => {
      if(arrayCheck.includes(cmd.name)) return;
      if(cmd.category === 'admin' || cmd.category === 'owner') return;
      arrayCheck.push(cmd.name);

      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name} ${cmd.aliases.length > 0 ? `(Aliases: ${cmd.aliases})` : ""}**`,
        `${cmd.description}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
}