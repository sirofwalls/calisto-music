const BaseEvent = require('../util/structures/BaseEvent');
const { PREFIX } = require('../util/botUtil');

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client) {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
  }
}