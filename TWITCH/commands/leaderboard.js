const F = require('fs');
module.exports = {
    name: 'leaderboard',
    description: 'sends a link to the leaderboard.',
    async execute(chatClient, channel, user, message, args, TwitchClient, check_watchtime, active_users) {
      let rank = '?';
      check_watchtime(TwitchClient, channel, active_users, user).then(tmp => {
        chatClient.say(channel, `@${user.displayName}, here's a link to the leaderboard: https://alleshusos.de/leaderboard`)
    })
            }
}
