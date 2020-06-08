const F = require('fs');
module.exports = {
    name: 'leave',
    description: 'makes the bot sad',
    execute(discord,message,args,client) {
        client.voice.connections.first().disconnect()
        message.reply(':(')
    }
}