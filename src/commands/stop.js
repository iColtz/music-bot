const { Command } = require('discord.js-akago');

class StopCommand extends Command {
    constructor() {
        super('stop', {
            description: 'Stops the currently playing song.',
            category: 'Music',
            aliases: ['s'],
            guildOnly: true,
            cooldown: 5,
        });
    }

    async execute(message) {
        const { voice } = message.guild.me;
        if (!voice) return message.channel.send('I\'m not currently playing any music.');

        try {
            voice.channel.leave();
        }
        catch (error) {
            console.log(error);
            return message.channel.send('There was an error while disconnecting from the voice channel.');
        }
    }
}

module.exports = StopCommand;