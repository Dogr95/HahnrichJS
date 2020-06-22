module.exports = {
    name: 'watchtime',
    description: 'shows time spent on all channels that Hahnrich runs on.',
    async execute(chatClient, channel, user, message, args, TwitchClient, check_watchtime, active_users) {
      wt = await check_watchtime(TwitchClient, channel, active_users, user)
      chatClient.say(channel, `@${user.displayName} has spent ${await (wt/3600000).toFixed(2)} hours watching all channels that i run on PogChamp`)
            }
}
