const F = require('fs');
const meta = require('music-metadata');
const Discord = require('discord.js');
let status = Boolean;
module.exports = {
    name: 'np',
    description: 'shows currently playing file',
    async execute(discord,message,args,client) {
        let np = await F.readFileSync('tmp/np', function(err){if (err != null){console.log(err)}})
        let details = '';
        try {
          detailsF = JSON.parse(await F.readFileSync(`tmp/${np.toString().split('.')[0]}.json`))
          console.log(detailsF)
          details = [await detailsF.tag, await detailsF.avatarURL, (new Date(Date(await detailsF.time_of_request))).toDateString()]
          console.log('tag ->', detailsF.tag,
                      'avatar', detailsF.avatarURL,
                      'string ->', (new Date(Date(detailsF.time_of_request))).toDateString()
                    )
        } catch {
          details = 'No details available'
        }
        if (np.toString() !== 'none') {
            if(!details.includes('No details available')) {
              client.voice.connections.each((connection) => {
                if(connection.channel.guild.id === message.guild.id) {
                  current_streamTime = {
                    total: parseInt((connection.dispatcher.streamTime/1000).toFixed(0)),
                    after: parseInt((connection.dispatcher.streamTime/1000).toFixed(0)),
                    minutes: 0,
                    seconds: 0
                  }
                  current_streamTime.minutes = Math.floor(current_streamTime.after / 60)
                  current_streamTime.after = Math.floor(current_streamTime.after - (current_streamTime.minutes * 60) )
                  current_streamTime.seconds = current_streamTime.after
                }
              })
              if (typeof current_streamTime === 'undefined') {
                current_streamTime = "couldn't get current steamtime :("
              }
              if (current_streamTime.seconds < 10) {
                sendStreamTimeSeconds = `0${current_streamTime.seconds}`
              } else {
                sendStreamTimeSeconds = current_streamTime.seconds
              }
              console.log('streamtime is -> ', current_streamTime)
              meta.parseFile(`tmp/${np.toString()}`).then((data) => {
                  length = {
                    total: parseInt(data.format.duration),
                    after: parseInt(data.format.duration),
                    minutes: 0,
                    seconds: 0
                  }
                  length.minutes = Math.floor(length.after / 60)
                  length.after = Math.floor(length.after - (length.minutes * 60) )
                  length.seconds = length.after
              if (length.seconds < 10) {
                sendLengthSeconds = `0${length.seconds}`
              } else {
                sendLengthSeconds = length.seconds
              }

              let embed = new Discord.MessageEmbed()
                      .setColor('#d10202')
                      .setTitle('Now Playing:')
                      .setURL('https://zap-hosting.com/de/shop/donation/b46e5e7b07106dad59febaf3b66fd5e5/')
                      .setAuthor('HahnrichJS', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cb/cb9a41873f2065b8010afa7584803d283dd7e6ad_full.jpg', 'https://alleshusos.de')
                      .setFooter('If you want to support this bot, click on the header!')
                      .setDescription(`${np.toString().split('.')[0]}`)
                      .setThumbnail(details[1])
                      .addField(`Originally requested by ${details[0]} on ${details[2]}`, `${current_streamTime.minutes}:${sendStreamTimeSeconds}/${length.minutes}:${sendLengthSeconds}`)
                      message.reply(embed)
            })
            } else {
              client.voice.connections.each((connection) => {
                if(connection.channel.guild.id === message.guild.id) {
                  current_streamTime = {
                    total: parseInt((connection.dispatcher.streamTime/1000).toFixed(0)),
                    after: parseInt((connection.dispatcher.streamTime/1000).toFixed(0)),
                    minutes: 0,
                    seconds: 0
                  }
                  current_streamTime.minutes = Math.floor(current_streamTime.after / 60)
                  current_streamTime.after = Math.floor(current_streamTime.after - (current_streamTime.minutes * 60) )
                  current_streamTime.seconds = current_streamTime.after
                }
              })
              if (typeof current_streamTime === 'undefined') {
                current_streamTime = "couldn't get current steamtime :("
              }
              if (current_streamTime.seconds < 10) {
                sendStreamTimeSeconds = `0${current_streamTime.seconds}`
              } else {
                sendStreamTimeSeconds = current_streamTime.seconds
              }
              console.log('streamtime is -> ', current_streamTime)
              meta.parseFile(`tmp/${np.toString()}`).then((data) => {
                  length = {
                    total: parseInt(data.format.duration),
                    after: parseInt(data.format.duration),
                    minutes: 0,
                    seconds: 0
                  }
                  length.minutes = Math.floor(length.after / 60)
                  length.after = Math.floor(length.after - (length.minutes * 60) )
                  length.seconds = length.after
              if (length.seconds < 10) {
                sendLengthSeconds = `0${length.seconds}`
              } else {
                sendLengthSeconds = length.seconds
              }

              let embed = new Discord.MessageEmbed()
                      .setColor('#d10202')
                      .setTitle('Now Playing:')
                      .setURL('https://zap-hosting.com/de/shop/donation/b46e5e7b07106dad59febaf3b66fd5e5/')
                      .setAuthor('HahnrichJS', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cb/cb9a41873f2065b8010afa7584803d283dd7e6ad_full.jpg', 'https://alleshusos.de')
                      .setFooter('If you want to support this bot, click on the header!')
                      .setDescription(`${np.toString().split('.')[0]}`)
                      .addField(`No details available`, `${current_streamTime.minutes}:${sendStreamTimeSeconds}/${length.minutes}:${sendLengthSeconds}`)
                      message.reply(embed)
            })
            }
        } else {
            message.reply(`Not playing anything currently`)
        }
}}
