const { MessageEmbed } = require("discord.js");
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class QueueCommand extends BaseCommand {
  constructor() {
    super(
    'queue',
    '--',
    5,
    ['q'],
    messages.queue.description);
  }

  async run(message, args) {
    const musicRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = musicRoleFetch.get('musicRole');

    if (guildRoleCheck) {
      const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === musicRoleFetch.get('musicRole').toLowerCase());
      if (musicRole) {
        const roleCheck = message.member.roles.cache.has(musicRole.id);
      
        if (roleCheck) {
          const permissions = message.channel.permissionsFor(message.client.user);
          if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
            return message.reply(messages.queue.missingPermissionMessage);

          const queue = message.client.queue.get(message.guild.id);
          if (!queue) return message.channel.send(messages.queue.errorNotQueue);

          var currentPage = 0;
          const embeds = generateQueueEmbed(message, queue.songs);

          const queueEmbed = await message.channel.send(
            `**${messages.queue.currentPage} ${currentPage + 1}/${embeds.length}**`,
            embeds[currentPage]
          );

          try {
            await queueEmbed.react("⬅️");
            await queueEmbed.react("⏹");
            await queueEmbed.react("➡️");
          } catch (error) {
            console.error(error);
            message.channel.send(error.message).catch(console.error);
          }

          const filter = (reaction, user) =>
            ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
          const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

          collector.on("collect", async (reaction, user) => {
            try {
              if (reaction.emoji.name === "➡️") {
                if (currentPage < embeds.length - 1) {
                  currentPage++;
                  queueEmbed.edit(
                    `**${messages.queue.currentPage} ${currentPage + 1}/${embeds.length}**`,
                    embeds[currentPage]
                  );
                }
              } else if (reaction.emoji.name === "⬅️") {
                if (currentPage !== 0) {
                  --currentPage;
                  queueEmbed.edit(
                    `**${messages.queue.currentPage} ${currentPage + 1}/${embeds.length}**`,
                    embeds[currentPage]
                  );
                }
              } else {
                collector.stop();
                reaction.message.reactions.removeAll();
              }
              await reaction.users.remove(message.author.id);
            } catch (error) {
              console.error(error);
              return message.channel.send(error.message).catch(console.error);
            }
          });
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

function generateQueueEmbed(message, queue) {
  var embeds = [];
  var k = 10;

  for (var i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    var j = i;
    k += 10
    const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");

    const embed = new MessageEmbed()
      .setTitle(messages.queue.embedTitle)
      .setThumbnail(message.client.user.avatarURL())
      .setColor("#F8AA2A")
      .setDescription(
        messages.queue.embedCurrentSong + `[${ queue[0].title}](${ queue[0].url})` + `\n\n${info}\n`
      )
      .setTimestamp();
    embeds.push(embed);
  }

  return embeds;
}