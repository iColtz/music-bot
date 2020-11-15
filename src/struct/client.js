const { AkagoClient, CommandHandler, ListenerHandler } = require('discord.js-akago');

class Client extends AkagoClient {
    constructor(config) {
        super({
            token: config.token,
            ownerID: config.ownerID,
        });

        this.commandHandler = new CommandHandler(this, { commandDirectory: './src/commands' });

        this.listenerHandler = new ListenerHandler(this, { listenerDirectory: './src/listeners' });

        this.queue = new Map();
    }

    start() {
        this.build().then(() => console.log('Ready!'));
    }
}

module.exports = Client;