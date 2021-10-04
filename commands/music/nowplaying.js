const BaseCommand = require('../../util/structures/BaseCommand');
const createBar = require("string-progressbar");
const { MessageEmbed } = require("discord.js");
const messages = require('../../util/messages.json');

module.exports = class NowPlayingCommand extends BaseCommand {
  constructor() {
    super(
    'nowplaying',
    '--',
    5,
    ['np'],
    messages.nowplaying.description);
  }

  async run(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(messages.nowplaying.errorNotQueue).catch(console.error);

    const song = queue.songs[0];
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    const left = song.duration - seek;

    var nowPlaying = new MessageEmbed()
      .setTitle(messages.nowplaying.embedTitle)
      .setDescription(`${song.title}\n${song.url}`)
      .setColor("#F8AA2A")
      .setAuthor(message.client.user.username);

    if (song.duration > 0) {
      nowPlaying.addField(
        "\u200b",
        new Date(seek * 1000).toISOString().substr(11, 8) +
          "[" +
          createBar(song.duration == 0 ? seek : song.duration, seek, 20)[0] +
          "]" +
          (song.duration == 0 ? " ◉ LIVE" : new Date(song.duration * 1000).toISOString().substr(11, 8)),
        false
      );
      nowPlaying.setFooter(
        messages.nowplaying.timeRemaining + ` ${ new Date(left * 1000).toISOString().substr(11, 8) }`
      );
    }

    return message.channel.send(nowPlaying);
  }
}