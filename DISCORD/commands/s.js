const F = require('fs');
const dhl = require('postman-request');
const TwitchLogin = require('../../TWITCH/main')
const Discord = require('discord.js')
module.exports = {
    name: 's',
    description: 'secret',
    execute(discord,message,args,client) {
        let found = false;
        message.member.roles.cache.forEach((key, value) => {
            if(key.name === 'innocent') {
                found = true;
                let clip_id = args[0]
                if(args[0] !== undefined) {
                    if(clip_id.includes('https://clips.twitch.tv/')) {
                        clip_id = clip_id.replace('https://clips.twitch.tv/', '')
                    }
                    TwitchLogin.refresh()
                    .then(TC => {
                    TC.helix.clips.getClipById(clip_id)
                        .then(res => {
                            let link = res.thumbnailUrl.split('-preview')[0] + '.mp4'
                            dhl.get(link).pipe(F.createWriteStream(`../alleshusos.de/private/clips/${clip_id}.mp4`)).on('finish', () => {
                                let attachment = new Discord.MessageAttachment(`../alleshusos.de/private/clips/${clip_id}.mp4`)
                                F.writeFile(`../alleshusos.de/private/clips/${clip_id}.json`, JSON.stringify(res, null, 4), () => {})
                                message.reply(`finised downloading ${clip_id} from channel ${res.broadcasterDisplayName}`, attachment)
                                    .catch((err) => {
                                    message.reply(`failed uploading to discord.(${err}) here is a link to alleshusos.de: https://alleshusos.de/private/clips/${clip_id}.mp4`).catch((err) => {
                                      console.log(`error, couldn't send message (${err})`)
                                      })
                                    })
                            })
                            })
                    })
                } else {
                    message.reply('missing argument')
                }
            }
        })
        if(!found) {
            message.reply("you don't have permission to use this command.")
        }
    }
}
