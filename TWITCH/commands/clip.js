module.exports = {
    name: 'clip',
    description: 'creates a clip of given channel',
    rank: 'sub',
    execute(chatClient, channel, user, message, args, TwitchClient) {
        if (typeof args[0] == 'undefined') {
            args[0] = channel.replace('#', '') // if user didn't specify channel, create a clip of the current channel
        }

        if (user.isSubscriber) {
            TwitchClient.helix.users.getUserByName(args[0])
                .then(object => TwitchClient.helix.clips.createClip({channelId: object.id}), error => {
                    chatClient.action(channel, `@${user.displayName}, ${args[0]} not found or couldn't create clip for channel ${args[0]}. Check if channel is online.`)
                    throw new Error(`Channel not found or offline ${channel}`)
                })
                .then(clip => chatClient.action(channel, `@${user.displayName} created clip: https://clips.twitch.tv/` + clip), error => console.log(error));
        } else {
            chatClient.action(channel, `@${user.displayName} you are not allowed to use this command.`)
        }
    }
}
