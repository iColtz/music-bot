const { Client, Collection } = require('discord.js');
const { sync } = require('glob');
const { resolve } = require('path');
const YouTube = require('simple-youtube-api');
const Util = require('./util.js');

class MusicClient extends Client {
    constructor(config) {
        super();

        this.queue = new Map();

        this.commands = new Collection();

        this.youtube = new YouTube(config.youtubeAPI);

        this.util = new Util(this);

        this.loadCommands();

        this.once('ready', () => console.log('Yoo this is ready!'));

        this.on('message', async (message) => {
            if (!message.guild || message.author.bot) return;
            if (!message.content.startsWith(config.prefix)) return;
            const [commandName, ...args] = message.content.slice(config.prefix.length).trim().split(/ +/g);
            const command = this.commands.get(commandName) 
                || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            if (!command) return;
            try {
                command.execute(message, args);
            } 
            catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }
        });
    }

    loadCommands() {
        const commandFiles = sync('./src/commands/**/*.js');
        for (let commandFilePath of commandFiles) {
            commandFilePath = resolve(commandFilePath);
            const File = require(commandFilePath);
            const command = new File(this);
            command.client = this;
            this.commands.set(command.name, command);
        }
    }

    start(token) {
        this.login(token);
    }
}

module.exports = MusicClient;