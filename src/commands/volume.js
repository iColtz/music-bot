const { Command } = require('discord.js-akago');

class VolumeCommand extends Command {
    constructor() {
        super('volume', {
            description: 'View or change the current volume of the music.',
            category: 'Music',
            aliases: ['v'],
            guildOnly: true,
            cooldown: 5,
        });
    }

    async execute(message, [volume]) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue for this guild.');
        if (volume && Number.isInteger(parseInt(volume))) {
            serverQueue.volume = parseInt(volume);
            channel.send(`Volume set to: ${volume}`);
            serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        }
        else {
            channel.send(`The current volume is: ${serverQueue.volume}`);
        }
    }
}

module.exports = VolumeCommand;