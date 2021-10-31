const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    guildName: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    moderatorRole: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    musicRole: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    blackListRole: {
        type: mongoose.SchemaTypes.String,
        required: false,
    }
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);