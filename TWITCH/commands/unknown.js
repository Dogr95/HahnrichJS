const F = require('fs');
module.exports = {
    name: 'u',
    description: 'secret',
    async execute(chatClient,channel,user,message,args,TwitchClient) {
        if (user.userName.toLowerCase()=='vertikarl') {
            const huso = await TwitchClient.helix.streams.getStreamsPaginated({game:'0'})
            const all_streams = await huso.getAll()
            F.writeFile('no_category2', JSON.stringify(all_streams, null, 4), function(){})
        } else {
            chatClient.action(channel, `@${user.displayName} you are not allowed to use this command.`)
        }
    }
}