const Command = require('../../struct/command.js');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            description: 'Pong!',
            category: 'Utilities',
        });
    }

    async execute(message) {
        const msg = await message.channel.send('Pinging...');
        const messagePing = msg.createdTimestamp - message.createdTimestamp;
        msg.edit(`Pong! ${messagePing}ms \nHeart beat: ${this.client.ws.ping}ms`);
    }
}

module.exports = PingCommand;