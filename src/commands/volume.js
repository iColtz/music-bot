const { Command } = require('discord.js-akago');

class VolumeCommand extends Command {
    constructor() {
        super('volume', {
            description: 'View or change the current volume of the music.',
            category: 'Music',
            aliases: ['v'],
            guildOnly: true,
        });
    }

    async execute(message, [volume]) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        volume = parseInt(volume);
        if (!serverQueue) return channel.send('There is currently no queue for this guild.');
        if (volume > 100 || volume < 0) {
            return channel.send('The volume needs to be between 0 and 100.');
        }
        else if ((volume || volume === 0) && Number.isInteger(volume)) {
            serverQueue.volume = volume;
            channel.send(`Volume set to: ${volume}`);
            serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
        }
        else {
            channel.send(`The current volume is: ${serverQueue.volume}`);
        }
    }
}

module.exports = VolumeCommand;