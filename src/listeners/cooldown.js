const { Listener } = require('discord.js-akago');

module.exports = class CooldownListener extends Listener {
    constructor() {        
        super('cooldown', {
            emitter: 'commandHandler',
            once: false,
        });
    }

    execute(message, command, timeLeft) {
        const remaining = (timeLeft / 1000).toFixed(1);
        const { name } = command;
        message.channel.send(`Wait ${remaining} more second(s) before reusing the ${name} command.`);
    }
};