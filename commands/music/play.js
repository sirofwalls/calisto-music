const { play } = require("../../include/play");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default
const https = require("https");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME, SPOTIFY_CLIENT_ID, SPOTIFY_SECRET_ID, PREFIX } = require("../../util/botUtil");
const spotifyURI = require('spotify-uri');
const Spotify = require('node-spotify-api');
const messages = require('../../util/messages.json');
const GuildConfig = require('../../schemas/guildconfig');
const BaseCommand = require('../../util/structures/BaseCommand');

const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const spotify = new Spotify({
  id: SPOTIFY_CLIENT_ID,
  secret: SPOTIFY_SECRET_ID
});


module.exports = class PlayCommand extends BaseCommand {
  constructor() {
    super(
    'play',
    '--',
    5,
    ['p'],
    messages.play.description);
  }

  async run(message, args) {
    const musicRoleFetch = await GuildConfig.findOne({guildId: message.guild.id});
    const guildRoleCheck = musicRoleFetch.get('musicRole');

    if (guildRoleCheck) {
      const musicRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === musicRoleFetch.get('musicRole').toLowerCase());
      if (musicRole) {
        const roleCheck = message.member.roles.cache.has(musicRole.id);
      
        if (roleCheck) {
          const { channel } = message.member.voice;
          const serverQueue = message.client.queue.get(message.guild.id);
          if (!channel) return message.reply(messages.play.errorNotChannel).catch(console.error);
          if (serverQueue && channel !== message.guild.me.voice.channel)
            return message
              .reply(messages.play.errorNotInSameChannel + `${ message.client.user }`)
              .catch(console.error);

          if (!args.length)
            return message
              .reply(messages.play.usageReply + `${ PREFIX }play <YouTube URL -or- Video Name>`)
              .catch(console.error);

          const permissions = channel.permissionsFor(message.client.user);
          if (!permissions.has("CONNECT")) return message.reply(messages.play.missingPermissionConnect);
          if (!permissions.has("SPEAK")) return message.reply(messages.play.missingPermissionSpeak);

          const search = args.join(" ");
          const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
          const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
          const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
          const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
          const spotifyPattern = /^.*(https:\/\/open\.spotify\.com\/track)([^#\&\?]*).*/gi;
          const spotifyValid = spotifyPattern.test(args[0]);
          const spotifyPlaylistPattern = /^.*(https:\/\/open\.spotify\.com\/playlist)([^#\&\?]*).*/gi;
          const spotifyPlaylistValid = spotifyPlaylistPattern.test(args[0])
          const url = args[0];
          const urlValid = videoPattern.test(args[0]);

          // Start the playlist if playlist url was provided
          if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
            return message.client.commands.get("playlist").run(message, args);
          } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
            return message.client.commands.get("playlist").run(message, args);
          } else if (spotifyPlaylistValid) {
            return message.client.commands.get("playlist").run(message, args);
          }

          if (mobileScRegex.test(url)) {
            try {
              https.get(url, function (res) {
                if (res.statusCode == "302") {
                  return message.client.commands.get("play").execute(message, [res.headers.location]);
                } else {
                  return message.reply("No content could be found at that url.").catch(console.error);
                }
              });
            } catch (error) {
              console.error(error);
              return message.reply(error.message).catch(console.error);
            }
            return message.reply("Following url redirection...").catch(console.error);
          }

          const queueConstruct = {
            textChannel: message.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: DEFAULT_VOLUME || 100,
            playing: true
          };

          var songInfo = null;
          var song = null;

          if (spotifyValid) {
            var spotifyTitle, spotifyArtist;
            const spotifyTrackID = spotifyURI.parse(url).id
            const spotifyInfo = await spotify.request(`https://api.spotify.com/v1/tracks/${spotifyTrackID}`).catch(err => {
              return message.channel.send(`Oops... \n` + err)
            })
            spotifyTitle = spotifyInfo.name
            spotifyArtist = spotifyInfo.artists[0].name

            try {
              const final = await youtube.searchVideos(`${spotifyTitle} - ${spotifyArtist}`, 1, { part: 'snippet' });
              songInfo = await ytdl.getInfo(final[0].url)
              song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds
              }
            } catch (err) {
              console.log(err)
              return message.channel.send(`Oops.. There was an error! \n ` + err)
            }

          } else if (urlValid) {
            try {
              songInfo = await ytdl.getInfo(url);
              song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds
              };
            } catch (error) {
              console.error(error);
              return message.reply(error.message).catch(console.error);
            }
          } else if (scRegex.test(url)) {
            try {
              const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
              song = {
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: Math.ceil(trackInfo.duration / 1000)
              };
            } catch (error) {
              console.error(error);
              return message.reply(error.message).catch(console.error);
            }
          } else {
            try {
              const results = await youtube.searchVideos(search, 1, { part: "snippet" });
              songInfo = await ytdl.getInfo(results[0].url);
              song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds
              };
            } catch (error) {
              console.error(error);
              if (error && error.statusCode === 410) {
                return message.reply('That song is currently age restricted, and I am only 3 years old. Please try another song. Sorry!')
              } else {
                return message.reply(error.message).catch(console.error);
              }
            }
          }

          if (serverQueue) {
            serverQueue.songs.push(song);
            return serverQueue.textChannel
              .send(`${song.title}` + messages.play.queueAdded + `${message.author}`)
              .catch(console.error);
          }

          queueConstruct.songs.push(song);
          message.client.queue.set(message.guild.id, queueConstruct);

          try {
            queueConstruct.connection = await channel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], message);
          } catch (error) {
            console.error(error);
            message.client.queue.delete(message.guild.id);
            await channel.leave();
            return message.channel.send(messages.play.cantJoinChannel + `${ error }`).catch(console.error);
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