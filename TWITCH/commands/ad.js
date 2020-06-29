module.exports = {
    name: 'ad',
    description: 'sets an adbreak for a given amount of time',
    ex: 'ad 30 (length of ad in seconds)',
    execute(chatClient, channel, user, message, args, TwitchClient) {
        if (typeof args[0] == 'undefined') {
            args[0] = 30 // if user didn't specify the length of the adbreak, specify a default of 30 seconds
        }
        chatClient.runCommercial(channel.replace('#', ''), args[0]).then().catch(chatClient.action(channel, `Couldn't start adbreak for channel ${channel.replace('#', '')} @${user.displayName}`))
    }
}
