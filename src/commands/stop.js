const Command = require('../struct/command.js');

class StopCommand extends Command {
    constructor() {
        super('stop', {
            description: 'Stops the currently playing song.',
            category: 'Music',
            aliases: ['s'],
        });
    }

    async execute(message) {
        const { voice, guild } = message.guild.me;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return message.channel.send('There is no queue in this guild.');
        if (!this.client.util.canModifyQueue(message)) return;

        try {
            this.client.queue.delete(guild.id);
            voice.channel.leave();
            message.channel.send('🛑 Stopped the music.');
        }
        catch (error) {
            console.log(error);
            return message.channel.send('There was an error while disconnecting from the voice channel.');
        }
    }
}

module.exports = StopCommand;