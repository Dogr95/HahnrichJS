module.exports = {
    name: 'settings',
    description: 'sends you the code for the mk8 tourney',
    execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users,load_db,xp_and_level) {
        if(channel === '#snaq__') {
          chatClient.action(channel, 'https://pastebin.com/raw/ELWMpuTV')
        } else {
          chatClient.action(channel, 'this channel does not provide any settings.')
        }
        }
}
