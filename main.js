const TwitchModule = require('twitch').default;
const ChatModule = require('twitch-chat-client').default;
require('dotenv').config();
const F = require('fs');
const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;
let db = new Object();
let active_users = new Map();
let active_users_memory = new Map();
let cooldown = 0;

try {
  F.readFile('./db.json', (err, data) => {db = JSON.parse(data)})
} catch {
  let template = { 0: {
    'name': 'example',
    'balance': 0,
    'watchtime': 0
  }}
  F.writeFile('./db.json', JSON.stringify(template, null, 4), () => {})
  F.readFile('./db.json', (err, data) => {db = JSON.parse(data)})
  // console.log(F.readFileSync('./db.json', function(err){if (err !== null) {console.log(err)}}))
  // db = JSON.parse(F.readFileSync('./db.json', function(err){if (err !== null) {console.log(err)}}))
}

function inBlacklist(name) {
  F.readFile('./blacklist', (err, data) => {
    if (data.toString().split(', ').includes(name)) {
      return true
    } else {
      return false
    }
  })
}

async function load_db() {
  return JSON.parse(await F.readFileSync('./db.json', function(err){if (err != null){console.log(err)}}))
}

function update_db(db) {
  cooldown = 30000
  F.writeFile('./db.json', JSON.stringify(db, null, 4), () => {})
}

async function update_watchtime(TC, channel, active_users) {
  console.log(`${new Date()}: updating watchtime for ${active_users.get(channel.replace('#', '')).length} users`)
  db = await load_db()
  db_keys = Object.keys(db)
  for(user in active_users.get(channel.replace('#', ''))) {
    obj = await TC.helix.users.getUserByName(active_users.get(channel.replace('#', ''))[user])
    if (db_keys.includes(obj.id.toString())) {
      db[obj.id.toString()].watchtime = db[obj.id.toString()].watchtime + (new Date() - active_users_memory.get(obj.name))
      active_users_memory.set(obj.displayName, new Date())
      update_db(db)
    } else if (await inBlacklist(obj.name) === false && 0 < (cooldown-new Date())) {
      console.log(`${obj.name} is not in db. adding...`)
      db[obj.id] = {
          "name": `${obj.name}`,
          "balance": 0,
          "watchtime": 0
        }
      update_db(db)
    }
  }
}

async function check_watchtime(TC, channel, active_users, user) {
  update_watchtime(TC, channel, active_users)
  db = await load_db()
  tuser = await TC.helix.users.getUserByName(user.displayName)
  return await db[await tuser.id.toString()].watchtime
}

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
    let chatClient = await ChatModule.forTwitchClient(TwitchClient, { channels: channels, requestMembershipEvents: true });
    chatClient.huso = new Map()
    const commandFiles = F.readdirSync('./TWITCH/commands').filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command_from_file = require(`./TWITCH/commands/${file}`)
        chatClient.huso.set(command_from_file.name, command_from_file)
    }
    // chatClient.react = new Map()
    // const reactFile = F.readdirSync('./json/react.json', function(err){if (err != null){console.log(err)}});
    // for(const file of reactFile) {
    // }
    // chatClient.response = new Map()
    // const responseFile = F.readdirSync('./json/response.json', function(err){if (err != null){console.log(err)}});
    // for(const file of responseFile) {
    // }
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
    for(c in channels) {
      active_users.set(channels[c], [])
    }
    chatClient.onJoin((channel, user) => {
      tmp = active_users.get(channel.replace('#', ''))
      tmp.push(user)
      active_users_memory.set(user, new Date())
      active_users.set(channel.replace('#', ''), tmp)
      update_watchtime(TwitchClient, channel, active_users)
    })
    chatClient.onPart((channel, user) => {
      tmp = active_users.get(channel.replace('#', ''))
      index = tmp.indexOf(user)
      update_watchtime(TwitchClient, channel, active_users)
      active_users_memory.delete(user)
      tmp.splice(index, 1)
      active_users.set(channel.replace('#', ''), tmp)
    })
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
            } else if( useable.name == 'help' ) {
                useable.execute(chatClient,channel,user,message,args,chatClient.huso)
            }
            else {
                useable.execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users)/*)*/;
        }
    }} /*else if( message in chatClient.react ) {
            //
        }
    }*/);


})();
