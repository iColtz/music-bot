const { Command } = require('discord.js-akago');
const ytdl = require('ytdl-core');

class PlayCommand extends Command {
    constructor() {
        super('play', {
            description: 'Plays a from your youtube.',
            category: 'Music',
            aliases: ['p'],
            guildOnly: true,
            cooldown: 5,
        });
    }

    async execute(message, [url]) {
        const { voice } = message.member;
        if (!voice.channel) return message.channel.send('You need to be in a voice channel to play music.');
        if (!url) return message.channel.send('You need to specific a youtube link to play.'); 

        try {
            const connection = await voice.channel.join();
            const stream = ytdl(url, { filter: 'audioonly' });
            var dispatcher = connection.play(stream, { volume: 0.5 }); // eslint-disable-line no-var
        }
        catch (error) {
            console.log(error);
            return message.channel.send('There was an error while trying to play a song.');
        }

        dispatcher.on('finish', () => voice.channel.leave());
    }   
}

module.exports = PlayCommand;