module.exports = {
    name: 'ping',
    description: 'reacts with pong',
    execute(chatClient,channel,user,message) {
        chatClient.say(channel, 'Pong!')
        }
}