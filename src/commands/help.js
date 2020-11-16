const Command = require('../struct/command.js');
const { MessageEmbed } = require('discord.js');

class HelpCommand extends Command {
    constructor() {
        super('help', {
            description: 'Display a list of all the commands.',
            category: 'Utilities',
            aliases: ['h'],
            guildOnly: true,
        }, {
            usage: '[command]',
        });
    }

    async execute(message, [commandName]) {
        const { commands } = this.client;
        const embed = new MessageEmbed().setColor('BLUE');
        const command = commands.get(commandName);

        if (command) {
            embed.setTitle(`\`${command.opts.usage ? command.name + ' ' + command.opts.usage : command.name}\``);
            embed.addField('Description', command.description);
            if (command.aliases.length) embed.addField('Aliases', command.aliases.map(a => `\`${a}\``).join(' '));
        }
        else {
            const categories = this.removeDuplicates(commands.map(c => c.category));
            embed.setDescription('For additional info on a command, use `?help <command>`');
            for (const category of categories) {
                const filteredCommands = commands.filter(c => c.category == category);
                embed.addField(category || 'Misc', filteredCommands.map(c => `\`${c.name}\``).join(' '));
            }
        }

        message.channel.send(embed);
    }

    removeDuplicates(array) {
        return [...new Set(array)];
    }
}

module.exports = HelpCommand;