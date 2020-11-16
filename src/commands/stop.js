const { Command } = require('discord.js-akago');

class StopCommand extends Command {
    constructor() {
        super('stop', {
            description: 'Stops the currently playing song.',
            category: 'Music',
            aliases: ['s'],
            guildOnly: true,
        });
    }

    async execute(message) {
        const { voice, guild } = message.guild.me;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return message.channel.send('🛑 There is no queue in this guild.');

        try {
            this.client.queue.delete(guild.id);
            voice.channel.leave();
        }
        catch (error) {
            console.log(error);
            return message.channel.send('There was an error while disconnecting from the voice channel.');
        }
    }
}

module.exports = StopCommand;