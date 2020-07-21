module.exports = {
    name: 'code',
    description: 'sends you the code for the mk8 tourney',
    execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users,load_db,xp_and_level) {
        chatClient.action(channel, 'Tournament Code: 2196-2582-9931')
        }
}
