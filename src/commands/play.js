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
        const { voice, guild } = message.member;
        let serverQueue = this.client.queue.get(guild.id);
        if (!voice.channel) return message.channel.send('You need to be in a voice channel to play music.');
        if (!url) return message.channel.send('You need to specific a youtube link to play.');

        const play = async (song) => {
            serverQueue = this.client.queue.get(guild.id);

            if (!song) {
                serverQueue.voiceChannel.leave();
                this.client.queue.delete(guild.id);
                return;
            }

            try {
                var connection = await voice.channel.join(); // eslint-disable-line no-var
                const stream = ytdl(song.url, { filter: 'audioonly' });
                var dispatcher = connection.play(stream); // eslint-disable-line no-var
                dispatcher.setVolumeLogarithmic(5 / 5);
                serverQueue.connection = connection;
            }
            catch (error) {
                console.log(error);
                return message.channel.send('There was an error while trying to play a song.');
            }
    
            message.channel.send(`Started Playing: **${song.title}**`);

            dispatcher.on('finish', () => {
                serverQueue.songs.shift();
                play(serverQueue.songs[0]);
            });

            dispatcher.on('error', (error) => console.warn(error));
            connection.on('disconnect', () => this.client.queue.delete(guild.id));
        };

        const songInfo = await ytdl.getBasicInfo(url);
        if (!songInfo) return message.channel.send('No results found for this url.');

        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

        if (!serverQueue) {
            const queueConstruct = {
                guild: guild,
                voiceChannel: voice.channel,
                songs: [song],
                connection: null,
            };

            this.client.queue.set(guild.id, queueConstruct);
            play(queueConstruct.songs[0]);
        }
        else {
            serverQueue.songs.push(song);
            message.channel.send(`Added **${song.title}** to the queue.`);
        }
    }   
}

module.exports = PlayCommand;