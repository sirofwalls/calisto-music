const { MessageEmbed } = require("discord.js");
const YouTubeAPI = require("simple-youtube-api");
const { YOUTUBE_API_KEY } = require("../../util/botUtil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const messages = require('../../util/messages.json');
const BaseCommand = require('../../util/structures/BaseCommand');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class SearchCommand extends BaseCommand {
  constructor() {
    super(
    'search',
    '--',
    5,
    [],
    messages.search.description);
  }

  async run(message, args) {
    const musicRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = musicRoleFetch.get('musicRole');

    if (guildRoleCheck) {
      const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === musicRoleFetch.get('musicRole').toLowerCase());
      if (musicRole) {
        const roleCheck = message.member.roles.cache.has(musicRole.id);
      
        if (roleCheck) {
          if (!args.length)
            return message
              .reply(messages.search.usageReply + `${message.client.prefix}${module.exports.name} <Video Name>` )
              .catch(console.error);
          if (message.channel.activeCollector) return message.reply(messages.search.errorAlreadyCollector);
          if (!message.member.voice.channel)
            return message.reply(messages.search.errorNotChannel).catch(console.error);

          const search = args.join(" ");

          var resultsEmbed = new MessageEmbed()
            .setTitle(messages.search.resultEmbedTtile)
            .setDescription(messages.search.resultEmbedDesc + `${search}`)
            .setColor("#F8AA2A");

          try {
            const results = await youtube.searchVideos(search, 10);
            results.map((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title}`));

            var resultsMessage = await message.channel.send(resultsEmbed);

            function filter(msg) {
              const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
              return pattern.test(msg.content);
            }

            message.channel.activeCollector = true;
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            const reply = response.first().content;

            if (reply.includes(",")) {
              var songs = reply.split(",").map((str) => str.trim());

              for (var song of songs) {
                await message.client.commands
                  .get("play")
                  .run(message, [resultsEmbed.fields[parseInt(song) - 1].name]);
              }
            } else {
              const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;
              message.client.commands.get("play").run(message, [choice]);
            }

            message.channel.activeCollector = false;
            resultsMessage.delete().catch(console.error);
            response.first().delete().catch(console.error);
          } catch (error) {
            console.error(error);
            message.channel.activeCollector = false;
            message.reply(error.message).catch(console.error);
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