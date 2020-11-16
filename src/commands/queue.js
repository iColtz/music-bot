const { Command } = require('discord.js-akago');

class QueueCommand extends Command {
    constructor() {
        super('queue', {
            description: 'Gives a list of the current playing queue',
            category: 'Music',
            aliases: ['q'],
            guildOnly: true,
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue in this guild.');
        let i = 0;
        return message.channel.send([
            '__**Music Queue**__',
            serverQueue.songs.map(song => `**${++i}.** ${song.title}`).join('\n'),
        ].join('\n'));
    }
}

module.exports = QueueCommand;