const { Command } = require('discord.js-akago');
const ytdl = require('ytdl-core');

class PlayCommand extends Command {
    constructor() {
        super('play', {
            description: 'Plays a from your youtube.',
            category: 'Music',
            aliases: ['p'],
        });
    }

    async execute(message, args) {
        const { voice, guild } = message.member;
        let serverQueue = this.client.queue.get(guild.id);
        if (!voice.channel) return message.channel.send('You need to be in a voice channel to play music.');
        const searchString = args.join(' ');
        if (!searchString) return message.channel.send('You need to specific a song to play.');

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
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
                serverQueue.connection = connection;
            }
            catch (error) {
                console.log(error);
                return message.channel.send('There was an error while trying to play a song.');
            }
    
            message.channel.send(`Started Playing: **${song.title}**`);

            dispatcher.on('finish', () => {
                if (serverQueue.loop) {
                    const lastSong = serverQueue.songs.shift();
                    serverQueue.songs.push(lastSong);
                }
                else {
                    serverQueue.songs.shift();
                }
                play(serverQueue.songs[0]);
            });

            dispatcher.on('error', (error) => console.warn(error));
            connection.on('disconnect', () => this.client.queue.delete(guild.id));
        };

        try {
            // eslint-disable-next-line no-var
            var songInfo = await this.client.youtube.getVideo(searchString);
        }
        catch (error) {
            if (error && !error.message.startsWith('No video ID found in URL:')) console.warn(error);
            try {
                songInfo = await this.client.youtube.searchVideos(searchString, 1);
                if (!songInfo.length) return message.channel.send('No search results found.');
            }
            catch (err) {
                console.log(err);
                return message.channel.send('There seems to have been an error while fetching the video.');
            }
        }

        const song = {
            title: Array.isArray(songInfo) ? songInfo[0].title : songInfo.title,
            url: `https://www.youtube.com/watch?v=${Array.isArray(songInfo) ? songInfo[0].id : songInfo.id}`,
        };

        if (!serverQueue) {
            const queueConstruct = {
                guild: guild,
                voiceChannel: voice.channel,
                songs: [song],
                connection: null,
                volume: 100,
                playing: true,
                loop: null,
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