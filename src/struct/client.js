const { AkagoClient } = require('discord.js-akago');

class Client extends AkagoClient {
    constructor(config) {
        super({
            token: config.token,
            ownerID: config.ownerID,
        });
    }

    start() {
        this.build().then(() => console.log('Ready!'));
    }
}

module.exports = Client;