const BaseEvent = require('../../util/structures/BaseEvent');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = class GuildCreateEvent extends BaseEvent {
  constructor() {
    super('guildCreate');
  }
  
  async run(client, guild) {
    try {
        const guildconfig = await GuildConfig.create({
          guildId: guild.id,
          guildName: guild.name,
        })
        console.log(client.user.tag + ' has joined the server ' + client.guilds.cache.get(guild.id).name);
    } catch (err) {
      console.log(err);
    }
  }
}