const F = require('fs')
module.exports = {
    name: 'random',
    description: 'plays a random file',
    async check_random_repeat() {
        let randomRepeat = await F.readFileSync('tmp/random_repeat', function(err){if (err != null){console.log(err)}})
        return eval(randomRepeat.toString())
    },
    random_repeat(client, state, tmp) {
        let random_file = tmp[Math.floor(Math.random() * tmp.length)];
        let dispatcher = state.play(`tmp/${random_file}`);
        F.writeFile('tmp/np', `${random_file}`, (err) => {if(err !== null) {console.log(err)}})
        dispatcher.on('finish', async () => {
            if(await client.huso.get('random').check_random_repeat()) {
                client.huso.get('random').random_repeat(client, state, tmp)
            } else {
                F.writeFile('tmp/np', `none`, (err) => {if(err !== null) {console.log(err)}})
                state.disconnect()
            }
        })
    },
    execute(discord,message,args,client) {
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
                                        if(await client.huso.get('random').check_random_repeat()) {
                                            client.huso.get('random').random_repeat(client, state, tmp)
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
                                .catch(message.reply)
                        })();
                    }
                }
            })
        })
    }
}
