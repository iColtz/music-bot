const { AkagoClient, CommandHandler } = require('discord.js-akago');

class Client extends AkagoClient {
    constructor(config) {
        super({
            token: config.token,
            ownerID: config.ownerID,
        });

        this.commandHandler = new CommandHandler(this, { commandDirectory: './src/commands' });
    }

    start() {
        this.build().then(() => console.log('Ready!'));
    }
}

module.exports = Client;