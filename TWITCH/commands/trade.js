module.exports = {
    name: 'trade',
    description: 'times you out for 100 seconds',
    execute(chatClient, channel, user, message, args, TwitchClient, check_watchtime, active_users) {
        chatClient.timeout(channel, user, 100, 'no u')
        }
}
