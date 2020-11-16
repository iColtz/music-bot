const Command = require('../struct/command.js');
const ytdl = require('ytdl-core');

class PlayCommand extends Command {
    constructor() {
        super('play', {
            description: 'Plays a from your youtube.',
            category: 'Music',
            usage: '<song name>',
            aliases: ['p'],
        });
    }

    async execute(message, args) {
        const { voice, guild } = message.member;
        let serverQueue = this.client.queue.get(guild.id);
        if (serverQueue && !this.client.util.canModifyQueue(message)) return;
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
    
            const msg = await message.channel.send(`🎶 Started Playing: **${song.title}**`);
            serverQueue.message = msg;

            dispatcher.on('finish', async () => {
                const deleteMsg = () => {
                    try {
                        serverQueue.message.delete();
                    }
                    catch (error) {
                        console.log(error);
                    }
                };

                if (serverQueue.loop) {
                    const lastSong = serverQueue.songs.shift();
                    serverQueue.songs.push(lastSong);
                    deleteMsg();
                }
                else {
                    serverQueue.songs.shift();
                    deleteMsg();
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
                message: null,
            };

            this.client.queue.set(guild.id, queueConstruct);
            play(queueConstruct.songs[0]);
        }
        else {
            serverQueue.songs.push(song);
            message.channel.send(`✅ Added **${song.title}** to the queue.`);
        }
    }   
}

module.exports = PlayCommand;