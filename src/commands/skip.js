const Command = require('../struct/command.js');

class SkipCommand extends Command {
    constructor() {
        super('skip', {
            description: 'Skip the current playing song',
            category: 'Music',
            aliases: ['sk'],
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no guild in this guild.');
        serverQueue.connection.dispatcher.end();
        channel.send('⏭️ Skipped the current playing song.');
    }
}

module.exports = SkipCommand;