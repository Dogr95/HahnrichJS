module.exports = {
    name: 'clip',
    description: 'creates a clip of given channel',
    execute(chatClient,channel,user,message,args,TwitchClient) {
        user = user.name
        channel = channel.substr(1)
        if ( typeof args[0] == 'undefined') {args[0] = channel}
            TwitchClient.helix.users.getUserByName(args[0])
                .then(object => TwitchClient.helix.clips.createClip({channelId: object.id}), error => chatClient.action(channel, `@${user}, channel ${args[0]} not found.`))
                    .then(clip => chatClient.action(channel, 'created clip: https://clips.twitch.tv/'+clip), error => chatClient.action(channel, `@${user}, couldn't create clip for channel ${args[0]}. Check if channel is online.`));
    }
}