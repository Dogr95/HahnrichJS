const TwitchModule = require('twitch').default;
const ChatModule = require('twitch-chat-client').default;
require('dotenv').config();
const F = require('fs');
const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;
let db = new Object();
let active_users = new Map();
let active_users_memory = new Map();
let cooldown = 30000;
let last_update = new Date()-30000;
let lvlMap = new Map()
  lvlMap.set(1,250)
  lvlMap.set(10,650)
  lvlMap.set(20,1250)
  lvlMap.set(30,2500)
  lvlMap.set(40,3500)
  lvlMap.set(50,5000)
  lvlMap.set(60,8000)
  lvlMap.set(70,10000)
  lvlMap.set(80,15000)
  lvlMap.set(90,20000)
  lvlMap.set(100,25000)
  lvlMap.set(150,50000)
  lvlMap.set(200,100000)
  lvlMap.set(500,200000)
  lvlMap.set(1000,1000000)

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

async function inBlacklist(name) {
  data = await F.readFileSync('./blacklist', () => {})
  return data.toString().split(', ').includes(name)
}

async function load_db() {
  return JSON.parse(await F.readFileSync('./db.json', function(err){if (err != null){console.log(err)}}))
}

function update_db(db) {
  last_update = new Date().getTime()
  F.writeFile('./db.json', JSON.stringify(db, null, 4), () => {})
}

async function update_watchtime(TC, channel, active_users, passed_user) {
  xp_and_level();
  console.log('Stream is Live? ->', await TC.helix.streams.getStreamByUserName(channel.replace('#', '')) !== null)
  // checks if channel is live and if outside cooldown for function
  if(await TC.helix.streams.getStreamByUserName(channel.replace('#', '')) !== null && 0 <= (new Date().getTime()-(last_update+cooldown))) {
    console.log(`${new Date()}: updating watchtime for ${active_users.get(channel.replace('#', '')).length} users`)
    db = await load_db()
    db_keys = Object.keys(await db)
    for(user in active_users.get(channel.replace('#', ''))) {
      // gets twitch user object from name
      obj = await TC.helix.users.getUserByName(active_users.get(channel.replace('#', ''))[user] || passed_user)
      // \/ log of how this script sees each user \/
      console.log('-----------------------------------',
        '\n| ', obj.name,
        '\n| -', 'Is in Blacklist? ->', await inBlacklist(await obj.name),
        '\n| - outside cooldown? -> ', 0 <= (new Date().getTime()-(last_update+cooldown)),
        `\n| - ${new Date().getTime()-(last_update+cooldown)} is higher than 0? ->`,0 <= (new Date().getTime()-(last_update+cooldown)),
        '\n| -', `Should ${obj.name} be added to db? ->`, !await inBlacklist(obj.name) && 0 <= (new Date()-(last_update+cooldown)),
      )
      // /\                                       /\
      // checks if user is in db
      if (db_keys.includes(obj.id.toString())) {
        // updates watchtime accordingly
        db[obj.id.toString()].watchtime = db[obj.id.toString()].watchtime + (new Date().getTime() - active_users_memory.get(obj.name))
        // resets time of watchtime begin
        active_users_memory.set(obj.name, new Date().getTime())
        update_db(db)
      // adds user if he is not in db
      } else if (!await inBlacklist(obj.name)) {
        console.log(`${obj.name} is not in db. adding...`)
        db[obj.id] = {
            "name": `${obj.name}`,
            "balance": 0,
            "watchtime": 0
          }
        update_db(db)
      }
    }
    // resets begin of watchtime if channel if offline
  } else if (await TC.helix.streams.getStreamByUserName(channel.replace('#', '')) === null) {
    active_users_memory.forEach((key, value) => {
      active_users_memory.set(value, new Date().getTime())
    });

  }
}

async function xp_and_level(ChatClient, channels) {
  db = await load_db()
  for(entry in await db) {
    db[entry].totalXp = Math.floor(db[entry].watchtime/5000)
    if(!db[entry].xp) {
      db[entry].xp = db[entry].totalXp
    }
    if(!db[entry].level) {
      db[entry].level = 1
    }
    db[entry] = levelUp(db[entry], ChatClient, channels)
  }
  update_db(db)
  return db
}

function levelUp(userdata, ChatClient, channels){

  let result = undefined
  let tempLvl = userdata.level
  while(!result){
      result = lvlMap.get(tempLvl)
      if(!result)tempLvl--;
  }

  if(userdata.xp >= result){
      userdata.level++;
      userdata.xp -= result;
      if(userdata.xp >= result)userdata = levelUp(userdata);
      for(channel in channels) {
        ChatClient.say(('#' + channels[channel]), `@${userdata.name} just leveled up to level ${userdata.level} PogChamp`)
      }
  }

  return(userdata)
}

async function check_watchtime(TC, channel, active_users, user) {
  await update_watchtime(TC, channel, active_users)
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
    xp_and_level(chatClient, channels)
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
      active_users_memory.set(user, new Date().getTime())
      active_users.set(channel.replace('#', ''), tmp)
      update_watchtime(TwitchClient, channel, active_users, user)
    })
    chatClient.onPart((channel, user) => {
      tmp = active_users.get(channel.replace('#', ''))
      index = tmp.indexOf(user)
      update_watchtime(TwitchClient, channel, active_users, user)
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
                useable.execute(chatClient,channel,user,message,args,TwitchClient,check_watchtime,active_users,load_db,xp_and_level)/*)*/;
        }
    }} /*else if( message in chatClient.react ) {
            //
        }
    }*/);


})();
