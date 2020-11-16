const Command = require('../struct/command.js');
const ytdl = require('ytdl-core-discord');

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

        const handleVideo = async (songInfo, playlist = false) => {
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
                if (!playlist) message.channel.send(`✅ Added **${song.title}** to the queue.`);
            }
        };

        const play = async (song) => {
            serverQueue = this.client.queue.get(guild.id);

            if (!song) {
                serverQueue.voiceChannel.leave();
                this.client.queue.delete(guild.id);
                return;
            }

            try {
                var connection = await voice.channel.join(); // eslint-disable-line no-var
                const stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
                var dispatcher = connection.play(stream, { type: 'opus' }); // eslint-disable-line no-var
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

        if (searchString.match(/^https?:\/\/(www\.youtube\.com|youtube\.com)\/playlist(.*)$/)) {
            try {
                const playlist = await this.client.youtube.getPlaylist(searchString);
                const videos = await playlist.getVideos();
                message.channel.send(`✅ Added playlist **${playlist.title}** to the queue.`);
                for (const video of Object.values(videos)) {
                    const vid = await this.client.youtube.getVideoByID(video.id);
                    await handleVideo(vid, true);
                }
            }
            catch (error) {
                console.log(error);
                return message.channel.send('There was an issue when fetching this playlist.');
            }
        }
        else {
            try {
                // eslint-disable-next-line no-var
                var songInfo = await this.client.youtube.getVideo(searchString);
                await handleVideo(songInfo);
            }
            catch (error) {
                if (error && !error.message.startsWith('No video ID found in URL:')) console.warn(error);
                try {
                    songInfo = await this.client.youtube.searchVideos(searchString, 1);
                    if (!songInfo.length) return message.channel.send('No search results found.');
                    await handleVideo(songInfo);
                }
                catch (err) {
                    console.log(err);
                    return message.channel.send('There seems to have been an error while fetching the video.');
                }
            }
        }
    }   
}

module.exports = PlayCommand;