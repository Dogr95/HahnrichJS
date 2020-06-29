module.exports = {
    name: 'level',
    description: 'shows level and xp of user.',
    async execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users,load_db,xp_and_level) {
      db = await xp_and_level()
      tuser = await TwitchClient.helix.users.getUserByName(user.displayName)
      chatClient.say(channel, `@${user.displayName} you are level ${await db[await tuser.id.toString()].level} and have accumulated ${await db[await tuser.id.toString()].totalXp}XP`)
    }
}
