const F = require('fs')
module.exports = {
    name: 'random',
    description: 'plays a random file',
    async check_random_repeat() {
        let randomRepeat = await F.readFileSync('tmp/random_repeat', function(err){if (err != null){console.log(err)}})
        return eval(randomRepeat.toString())
    },
    async rep(client, state, file, tmp) {
        let dispatcher = state.play(file)
        dispatcher.on('finish', async () => {
            if(await client.huso.get('random').check_repeat()) {
              setTimeout(() => {
                client.huso.get('random').rep(client, state, file, tmp)
              }, 500)
            } else if(await client.huso.get('random').check_random_repeat()) {
                setTimeout(() => {
                  client.huso.get('random').random_repeat(client, state, tmp)
                }, 500)
            } else {
                F.writeFile('tmp/np', `none`, (err) => {if(err !== null) {console.log(err)}})
                state.disconnect()
            }
        })
    },
    async check_repeat() {
        let repeatF = await F.readFileSync('tmp/repeat', function(err){if (err != null){console.log(err)}})
        return eval(repeatF.toString())
    },
    random_repeat(client, state, tmp) {
        let random_file = tmp[Math.floor(Math.random() * tmp.length)];
        let dispatcher = state.play(`tmp/${random_file}`);
        F.writeFile('tmp/np', `${random_file}`, (err) => {if(err !== null) {console.log(err)}})
        dispatcher.on('finish', async () => {
            if(client.huso.get('random').check_repeat()) {
                setTimeout(() => {
                  client.huso.get('random').rep(client, state, random_file, tmp)
                }, 500)
            } else if(await client.huso.get('random').check_random_repeat()) {
                setTimeout(() => {
                  client.huso.get('random').random_repeat(client, state, tmp)
                }, 500)
            } else {
                F.writeFile('tmp/np', `none`, (err) => {if(err !== null) {console.log(err)}})
                state.disconnect()
            }
        })
    },
    async execute(discord,message,args,client) {
      let cooldown = 2000
        let last_used;
        last_usedF = F.readFileSync('./last_used', () => {})
        last_used = parseInt(last_usedF)
        console.log('-----------------------------------',
          '\n| -', 'Last used ->', new Date(last_used),
         '\n| -', 'Current Time ->', new Date(),
         '\n| -', 'more than 0? -> ', 0 <= (new Date().getTime()-(last_used+cooldown)),
         '\n| -', 'Timedifference ->', new Date().getTime()-(last_used+cooldown),
          '\n| -', `Should i run the function? ->`, !Number.isNaN(new Date().getTime()-(last_used+cooldown)) && 0 <= new Date().getTime()-(last_used+cooldown),
        )
        if(!Number.isNaN(new Date().getTime()-(last_used+cooldown)) && 0 <= new Date().getTime()-(last_used+cooldown)) {
        F.writeFile('./last_used', (new Date().getTime().toString()), () => {})
        let found = false;
        client.guilds.cache.forEach(guild => {
            guild.channels.cache.forEach(channel => {
                if (channel.constructor.name === 'VoiceChannel') {
                    if (channel.members.has(message.author.id)) {
                        found = true;
                        (async () => {
                            let tmp = await F.readdirSync('./tmp', (err) => {
                                if (err !== null) {
                                    console.log(err)
                                }
                            })
                            tmp = tmp.filter( function(rl) {
                                return rl.includes('.mp3') || rl.includes('.wav')
                            })
                            let choice = tmp[Math.floor(Math.random() * tmp.length)];
                            channel.join()
                                .then(state => {
                                    let dispatcher = state.play(`tmp/${choice}`)
                                    F.writeFile('tmp/np', `${choice}`, (err) => {
                                        if (err !== null) {
                                            console.log(err)
                                        }
                                    })
                                    dispatcher.on('finish', async () => {
                                        if(client.huso.get('random').check_repeat()) {
                                            setTimeout(() => {
                                              client.huso.get('random').rep(client, state, `tmp/${choice}`, tmp)
                                            }, 500)
                                        } else if(await client.huso.get('random').check_random_repeat()) {
                                            setTimeout(() => {
                                              client.huso.get('random').random_repeat(client, state, tmp)
                                            }, 500)
                                        } else {
                                                F.writeFile('tmp/np', `none`, (err) => {
                                                if (err !== null) {
                                                    console.log(err)
                                                }
                                            })
                                            state.disconnect()
                                        }
                                    })
                                })
                                .catch((err) => {
                                  message.reply(err)
                                })
                        })();
                    }
                }
            })
        })
      }
    }
}
