module.exports = {
    name: 'ping',
    description: 'reacts with pong',
    execute(discord,message,args) {
        message.reply('Pong!')
        }
}