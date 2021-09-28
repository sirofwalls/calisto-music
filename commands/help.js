const { MessageEmbed } = require("discord.js");
const messages = require('../util/messages.json');

module.exports = {
  name: "help",
  aliases: ["h"],
  description: messages.help.description,
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle(message.client.user.username)
      .setDescription(messages.help.embedDescription)
      .setColor("#F8AA2A");

    commands.forEach((cmd) => {
      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
        `${cmd.description}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
