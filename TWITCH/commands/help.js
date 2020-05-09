const F = require('fs');
module.exports = {
    name: 'help',
    description: 'sends the link to this help form',
    execute(chatClient,channel,user,message,args) {
        user = user.displayName
        F.writeFile('./help', '', function() {})
        chatClient.huso.forEach((key, command) => {
            F.appendFile('./help', `${process.env.prefix}${command}\n${key.description}\n`, function() {})
            F.appendFile('./help', `------------\n`, function() {})
        })
        chatClient.action(channel, 'Here is a list of commands: https://alleshusos.de/HahnrichJS/help')
    }
}