const { Command } = require('discord.js-akago');

class LoopCommand extends Command {
    constructor() {
        super('loop', {
            description: 'Loop the current queue or song.',
            category: 'Music',
            aliases: ['l'],
            guildOnly: true,
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue in this guild.');
        serverQueue.loop = !serverQueue.loop;
        channel.send(serverQueue.loop ? '🔁 Enabled queue loop.' : '🔁 Disabled queue loop.');
    }
}

module.exports = LoopCommand;