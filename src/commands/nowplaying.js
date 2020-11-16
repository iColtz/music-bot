const Command = require('../struct/command.js');

class NowPlayingCommand extends Command {
    constructor() {
        super('nowplaying', {
            description: 'View the currently playing song',
            category: 'Music',
            aliases: ['np'],
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue in this guild.');
        const song = serverQueue.songs[0];
        channel.send(`🎶 Now Playing: **${song.title}**`);
    }
}

module.exports = NowPlayingCommand;