// Module Imports
const { Client, Intents } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const path = require("path");
const { TOKEN, PREFIX, MONGODB_URI } = require("./util/botUtil");
const { registerCommands, registerEvents } = require('./util/registry');
const mongoDB = require('mongoose');

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0,
  ws: {intents: Intents.ALL}
});
if (MONGODB_URI) {
  const db = mongoDB.connect(MONGODB_URI, {
    useUnifiedTopology:true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }).then(() => console.log(`Connected to database`)).catch(err => console.log(`Oops, there was an error! ${err}`))
} else {
  console.log(`No MongoDB URI was provided. Blacklist system won't work.`)
}

client.prefix = PREFIX;
client.queue = new Map();

/**
 * Client Events
 */
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

client.on('debug', console.debug);

(async () => {
  client.commands = new Map();
  client.events = new Map();
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(TOKEN);
})();


