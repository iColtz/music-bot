const { Listener } = require('discord.js-akago');

module.exports = class CooldownListener extends Listener {
    constructor() {        
        super('ready', {
            once: true,
        });
    }

    execute() {
        console.log('Yoo this is ready.');
    }
};