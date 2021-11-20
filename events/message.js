const { Collection } = require("discord.js");
const BaseEvent = require('../util/structures/BaseEvent');
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blacklistModel = require('../schemas/blacklist')
const messages = require('../util/messages.json');
const { PREFIX, MONGODB_URI } = require('../util/botUtil');
const cooldowns = new Collection();


module.exports = class MessageEvent extends BaseEvent {
constructor() {
    super('message');
}

    async run(client, message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        
        const [, matchedPrefix] = message.content.match(prefixRegex);
        
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command =
            client.commands.get(commandName) ||
            client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName)).catch(err => console.log(err));
        
        if (!command) return;        
        
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 1) * 1000;
        
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        
            if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                messages.common.cooldownMessage
            );
            }
        }
        
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        
        try {
            await command.run(message, args);
        } catch (error) {
            console.error(error);
            message.reply(messages.common.errorCommend).catch(console.error);
        }
    }
}