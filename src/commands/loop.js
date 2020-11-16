const Command = require('../struct/command.js');

class LoopCommand extends Command {
    constructor() {
        super('loop', {
            description: 'Loop the current queue or song.',
            category: 'Music',
            aliases: ['l'],
        });
    }

    async execute(message) {
        const { guild, channel } = message;
        const serverQueue = this.client.queue.get(guild.id);
        if (!serverQueue) return channel.send('There is currently no queue in this guild.');
        if (!this.client.util.canModifyQueue(message)) return;
        serverQueue.loop = !serverQueue.loop;
        channel.send(serverQueue.loop ? '🔁 Enabled queue loop.' : '🔁 Disabled queue loop.');
    }
}

module.exports = LoopCommand;