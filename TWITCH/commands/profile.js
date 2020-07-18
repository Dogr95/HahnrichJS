module.exports = {
    name: 'profile',
    description: 'times you out for 100 seconds',
    execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users,load_db,xp_and_level) {
        chatClient.timeout(channel, user.displayName, 100, 'no u').then(res => console.log(res))
        }
}
