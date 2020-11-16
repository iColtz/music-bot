const Command = require('../struct/command.js');

class ResumeCommand extends Command {
    constructor() {
        super('resume', {
            description: 'Resumes the current playing song.',
            category: 'Music',
            aliases: ['rs'],
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue in this guild.');
        if (!this.client.util.canModifyQueue(message)) return;
        if (serverQueue.playing) return channel.send('The music is already playing.');
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        channel.send('▶️ Now resumed the music.');
    }
}

module.exports = ResumeCommand;