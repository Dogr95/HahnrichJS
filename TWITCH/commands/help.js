const F = require('fs');
module.exports = {
    name: 'help',
    description: 'sends the link to this help form',
    execute(chatClient,channel,user,message,args) {
        user = user.displayName
        F.writeFile('../alleshusos.de/public/commands.csv', '', function() {})
        chatClient.huso.forEach((key, command) => {
            F.appendFile('../alleshusos.de/public/commands.csv', `"${process.env.prefix}${command}","${key.description}"\n`, function() {})
        })
        chatClient.action(channel, 'Here is a list of commands: https://alleshusos.de/commands')
    }
}
