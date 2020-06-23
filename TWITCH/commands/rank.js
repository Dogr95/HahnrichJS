const F = require('fs');
module.exports = {
    name: 'rank',
    description: 'shows your rank and the top 5 in the leaderboard.',
    async execute(chatClient, channel, user, message, args, TwitchClient, check_watchtime, active_users) {
      let rank = '?';
      wt = await check_watchtime(TwitchClient, channel, active_users, user)
      leaderboard = JSON.parse(await F.readFileSync('./db.json', () => {}))
      sortable_array = []
      for (key in await Object.keys(await leaderboard)) {
        if(user._userData.get('user-id').toString() === await Object.keys(leaderboard)[key]) {

        }
        sortable_array.push([await Object.keys(await leaderboard)[key], await leaderboard[Object.keys(await leaderboard)[key]]])
      }
      sortable_array.sort(function (keyA, keyB) {
        return keyB[1].watchtime - keyA[1].watchtime
      })
      for (key in sortable_array) {
        if(sortable_array[key][0] === user._userData.get('user-id').toString()) {
          rank = parseInt(key)+1
        }
      }

      sortable_array = sortable_array.slice(0, 5)
      let top5 = ""
      for(place in await sortable_array) {
        if(place !== "4") {
        top5 = top5.concat(`${await sortable_array[place][1].name}(${(await sortable_array[place][1].watchtime/3600000).toFixed(0)}h), `)
      } else {
        top5 = top5.concat(`${await sortable_array[place][1].name}(${(await sortable_array[place][1].watchtime/3600000).toFixed(0)}h)`)
      }
      }
      chatClient.say(channel, `@${user.displayName}, you are #${rank}. These are the top 5: ${await top5}`)
            }
}
