const Command = require('../struct/command.js');
const ytdlDiscord = require('ytdl-core-discord');
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

        const handleVideo = async (url, playlist = false) => {
            try {
                // eslint-disable-next-line no-var
                var songInfo = await ytdl.getBasicInfo(url);
            }
            catch (error) {
                console.log(error);
                return message.channel.send('There was an issue when fetching the song\'s metadata.');
            }

            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds,
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
                const stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
                var dispatcher = connection.play(stream, { type: 'opus' }); // eslint-disable-line no-var
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
                serverQueue.connection = connection;
            }
            catch (error) {
                console.log(error);
                return message.channel.send('There was an error while trying to play a song.');
            }

            try {
                // eslint-disable-next-line no-var
                var msg = await message.channel.send(`🎶 Started Playing: **${song.title}**`);
                await msg.react('⏸️');
                await msg.react('▶️');
                await msg.react('⏹️');
                await msg.react('⏩');
                await msg.react('🔁');
            }
            catch (error) {
                console.log(error);
            }
            const filter = (reaction, user) => user.id === message.author.id;
            const collector = msg.createReactionCollector(filter, { time: song.duration * 1000 });

            collector.on('collect', (reaction, user) => {
                const member = message.guild.member(user);
                if (!this.client.util.canModifyQueue(message, member)) return;

                switch (reaction.emoji.name) {
                    case '⏸️':
                        if (!serverQueue.playing) return;
                        serverQueue.playing = false;
                        return serverQueue.connection.dispatcher.pause();
                    case '▶️':
                        if (serverQueue.playing) return;
                        serverQueue.playing = true;
                        return serverQueue.connection.dispatcher.resume();
                    case '⏹️':
                        this.client.queue.delete(guild.id);
                        return voice.channel.leave();
                    case '⏩':
                        return serverQueue.connection.dispatcher.end();
                    case '🔁':
                        return serverQueue.loop = !serverQueue.loop;
                    default:
                        return null;
                }
            });

            collector.on('end', () => {
                msg.reactions.removeAll().catch(err => console.log(err));
            });

            serverQueue.message = msg;
            dispatcher.on('finish', () => {
                if (serverQueue.loop) {
                    const lastSong = serverQueue.songs.shift();
                    serverQueue.songs.push(lastSong);
                    serverQueue.message.delete().catch(error => console.log(error));
                }
                else {
                    serverQueue.songs.shift();
                    serverQueue.message.delete().catch(error => console.log(error));
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
                    await handleVideo(video.id, true);
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
                await handleVideo(songInfo.id);
            }
            catch (error) {
                if (error && !error.message.startsWith('No video ID found in URL:')) console.warn(error);
                try {
                    songInfo = await this.client.youtube.searchVideos(searchString, 1);
                    if (!songInfo.length) return message.channel.send('No search results found.');
                    await handleVideo(songInfo[0].id);
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