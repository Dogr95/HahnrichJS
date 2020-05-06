const TwitchModule = require('twitch').default;
const ChatModule = require('twitch-chat-client').default;
require('dotenv').config();
const F = require('fs');
const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;

(async () => {
    const tokenData = JSON.parse(await F.readFileSync('./tokens.json', function(err){if (err != null){console.log(err)}}));
    const TwitchClient = TwitchModule.withCredentials(CLIENT_ID, tokenData.accessToken, undefined, {
        clientSecret: CLIENT_SECRET,
        refreshToken: tokenData.refreshToken,
        expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
            const newTokenData = {
                accessToken,
                refreshToken,
                expiryDate: expiryDate === null ? null : expiryDate.getTime()
            };
            await F.writeFileSync('./tokens.json', JSON.stringify(newTokenData, null, 4), function(err){if (err != null){console.log(err)}});
        }
    });
    let channels = []
    let channels_file = F.readFileSync('./channels.txt', function(err){if (err != null){console.log(err)}});
    channels_file = channels_file.toString().split('\n')
    for(const channel in channels_file) {
        if( channels_file[channel].length == 0 ) { /* ignore empty lines */ }
        else {
            channels.push(channels_file[channel])
    }};
    let chatClient = await ChatModule.forTwitchClient(TwitchClient, { channels: channels });
    chatClient.huso = new Map()
    const commandFiles = F.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command_from_file = require(`./commands/${file}`)
        chatClient.huso.set(command_from_file.name, command_from_file)
    }
    await chatClient.connect();
    chatClient.onAuthenticationFailure((message) => console.log(message))
    chatClient.onBan((channel, user) => console.log(`${user} got perm banned on ${channel}`))
    chatClient.onBitsBadgeUpgrade((channel, user, upgradeinfo, msg) => console.log(`${user} upgraded to ${upgradeinfo}`))
    chatClient.onCommunityPayForward((channel, user, forwardinfo, msg) => console.log(`${user} forwards a ${forwardinfo} to the community!`))
    chatClient.onCommunitySub((channel, user, subinfo, msg) => console.log(`${user} gifts a ${subinfo} to the community!`))
    chatClient.onEmoteOnly((channel, enabled) => console.log(`Emote-only chat is now ${enabled}`))
    chatClient.onFollowersOnly((channel, enabled, duration) => console.log(`Follower-only chat ${enabled} for users that follow for atleast ${duration}`))
    chatClient.onGiftPaidUpgrade((channel, user, subinfo, msg) => console.log(`${user} upgraded to ${subinfo} with the message: ${msg}`))
    chatClient.onHost((channel, target, viewers) => console.log(`${channel} is now hosting ${target} for ${viewers}`))
    chatClient.onHosted((channel, bychannel, auto, viewers) => console.log(`${bychannel} is now hosting you for ${viewers} | isauto: ${auto}`))
    chatClient.onJoin((channel, user) => console.log(`${user} joined on channel ${channel}`))
    chatClient.onPart((channel, user) => console.log(`${user} left channel ${channel}`))
    chatClient.onMessageFailed((channel, reason) => console.log(`ERROR sending message ${reason}`))
    chatClient.onMessageRatelimit((channel, message) => console.log(`ERROR sending message ${message}`))
    chatClient.onMessageRemove((channel, messageid, msg) => console.log(`Message ${msg} removed.`))
    chatClient.onNoPermission((channel, message) => console.log(`ERROR no permission to send ${message}`))
    chatClient.onPrimeCommunityGift((channel, user, subinfo, msg) => console.log(`${user} gave primeloot to ${channel} with message ${msg}`))
    chatClient.onPrimePaidUpgrade((channel, user, subinfo, msg) => console.log(`${user} upgraded their twitchprime to ${subinfo} with the message ${msg}`))
    chatClient.onRaid((channel, user, raidinfo, msg) => console.log(`${user} ${raidinfo}`))
    chatClient.onResub((channel, user, subinfo, msg) => console.log(`${user} resubbed with ${subinfo} and message ${msg}`))
    chatClient.onSlow((channel, enabled, delay) => console.log(`Slow mode is now ${enabled}. Users can type every ${dealy}`))
    chatClient.onStandardPayForward((channel, user, forwardinfo, msg) => console.log(`${user} continues their sub ${forwardinfo}!`))
    chatClient.onSub((channel, user, subinfo, msg) => console.log(`${user} subbed ${subinfo}!`))
    chatClient.onSub((channel, user, subinfo, msg) => console.log(`${user} resubbed ${subinfo}!`))
    chatClient.onSubsOnly((channel, enabled) => console.log(`Sub-only mode is now ${enabled}.`))
    chatClient.onTimeout((channel, user, duration) => console.log(`${user} got timed out for ${duration} seconds.`))
    chatClient.onWhisper((user, message, msg) => {
        let channel = channels[0]
        if (message.charAt(0) === process.env.prefix) {
            const command = message.substr(1).split(" ")[0].trim();
            const args = message.split(' ').slice(1);
            const useable = chatClient.huso.get(command);
            user = msg.userInfo
            console.log(user)
            user.isSubscriber = false
            if(!useable){
                chatClient.action(channel, `No command found named: ${command}. @${user.displayName}`)
                return
            } else {
                TwitchClient.helix.users.getUserByName(user.displayName)
                .then(tmp => user = tmp)
                .then(user => useable.execute(chatClient,channel,user,message,args,TwitchClient));
            }
        }

    });


    chatClient.onPrivmsg((channel, user, message, msg) => {
        if (message.charAt(0) === process.env.prefix) {
            user = msg.userInfo
            const command = message.substr(1).split(" ")[0].trim();
            const args = message.split(' ').slice(1);
            const useable = chatClient.huso.get(command);
            if(!useable){
                chatClient.action(channel, `No command found named: ${command}. @${user.displayName}`)
                return
            } else {
                useable.execute(chatClient,channel,user,message,args,TwitchClient)/*)*/;
        }
    }});


})();
