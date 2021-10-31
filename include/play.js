const ytdl = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader").default;
const { canModifyQueue, STAY_TIME } = require("../util/botUtil");
const messages = require('../util/messages.json');

module.exports = {
  async play(song, message) {
    const { SOUNDCLOUD_CLIENT_ID } = require("../util/botUtil");

    var config;

    try {
      config = require("../config.json");
    } catch (error) {
      config = null;
    }

    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
        queue.textChannel.send(messages.play.leaveChannel);
      }, STAY_TIME * 1000);
      queue.textChannel.send(messages.play.queueEnded).catch(console.error);
      return message.client.queue.delete(message.guild.id);
    }

    var stream = null;
    var streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
      return message.channel.send(
        messages.play.queueError + `${ error.message ? error.message : error }`
      );
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          var lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    try {
      var playingMessage = await queue.textChannel.send(
        messages.play.startedPlaying + `${ song.title } + ${ song.url }`
        );
      // // Disabling the emoji functionality... resume after pause is not working properly, and role permission needs to be added. 
      // await playingMessage.react("⏭");
      // await playingMessage.react("▶");
      // await playingMessage.react("⏸");
      // await playingMessage.react("🔇");
      // await playingMessage.react("🔉");
      // await playingMessage.react("🔊");
      // await playingMessage.react("🔁");
      // await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          queue.connection.dispatcher.end();
          queue.textChannel.send(`${ user }` + messages.play.skipSong).catch(console.error);
          collector.stop();
          break;

        case "⏸":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause();
            queue.textChannel.send(`${ user }` + messages.play.pauseSong).catch(console.error);
          } else {
            queue.textChannel.send(`${ user }` + messages.play.alreadyPaused).catch(console.error);
          }
          break;

        case "▶": //Does not really work... it says it is playing, but no music plays. the command works though if paused. 
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          if (!queue.playing){
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.textChannel.send(`${ user }` + messages.play.resumeSong).catch(console.error);
          } else {
            queue.textChannel.send(`${ user }` + messages.play.stillPlaying).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            queue.textChannel.send(`${ user }` + messages.play.unmutedSong).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            queue.textChannel.send(`${ user }` + messages.play.mutedSong).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 0) return;
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel
            .send(`${ user }` + messages.play.decreasedVolume + `${queue.volume}%`)
            .catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 100) return;
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel
            .send(`${ user }` + messages.play.increasedVolume + `${queue.volume}%`)
            .catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          queue.loop = !queue.loop;
          queue.textChannel
            .send(
              `${ user }` + messages.play.loopSong + `${queue.loop ? messages.common.on : messages.common.off}`
            )
            .catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return messages.common.errorNotChannel;
          queue.songs = [];
          queue.textChannel.send(`${ user }` + messages.play.stopSong,).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
    });
  }
};
