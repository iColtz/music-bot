const { AkagoClient, CommandHandler, ListenerHandler } = require('discord.js-akago');
const YouTube = require('simple-youtube-api');

class Client extends AkagoClient {
    constructor(config) {
        super({
            token: config.token,
            ownerID: config.ownerID,
        });

        this.commandHandler = new CommandHandler(this, { 
            commandDirectory: './src/commands',
            defaultCooldown: 3,
        });

        this.listenerHandler = new ListenerHandler(this, { listenerDirectory: './src/listeners' });

        this.queue = new Map();

        this.youtube = new YouTube(config.youtubeAPI);
    }

    start() {
        this.build();
    }
}

module.exports = Client;