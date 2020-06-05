const F = require('fs')
module.exports = {
    name: 'random',
    description: 'plays a random file',
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
                                    F.writeFile('tmp/np', `${choice.split('.')[0]}`, (err) => {
                                        if (err !== null) {
                                            console.log(err)
                                        }
                                    })
                                    dispatcher.on('finish', async () => {
                                        F.writeFile('tmp/np', `none`, (err) => {
                                            if (err !== null) {
                                                console.log(err)
                                            }
                                        })
                                        state.disconnect()
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