const discord = require('discord.js');
const F = require('fs');
const client = new discord.Client();
client.huso = new Map()
require('opusscript')
require('dotenv').config();
const dhl = require('postman-request');
const token = process.env.DISCORD_TOKEN;

async function check_repeat() {
    let repeatF = await F.readFileSync('tmp/repeat', function(err){if (err != null){console.log(err)}})
    return eval(repeatF.toString())
}

async function rep(state, file) {
    let dispatcher = state.play(file)
    dispatcher.on('finish', async () => {
        if(await check_repeat()) {
            rep(state, file)
        } else {
            F.writeFile('tmp/np', `none`, (err) => {if(err !== null) {console.log(err)}})
            state.disconnect()
        }
    })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        activity: {
            name: 'alleshusos.de',
            type: 'STREAMING',
            url: 'https://twitch.tv/vertiKarl'
        },
        status: 'idle'
    })
    let servers = '';
    let x = 0;
    client.guilds.cache.forEach(guild => {
        x++;
        if (x < client.guilds.cache.size-1) {
            servers += guild.name + ', '
        } else {
            servers += guild.name + '\n'
        }
    })
    console.log(`Online on: ${servers}`);
});

const commandFiles = F.readdirSync('./DISCORD/commands').filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command_from_file = require(`./DISCORD/commands/${file}`)
        client.huso.set(command_from_file.name, command_from_file)
    }

client.on('message', message => {
    if ( message.channel.type == 'dm' && message.author !== client.user) {
        if (message.attachments.first()) {
            if (message.attachments.first().name.split('.')[1] === 'mp3' || message.attachments.first().name.split('.')[1] === 'wav') {
                let found = false;
                client.guilds.cache.forEach(guild => {
                guild.channels.cache.forEach(channel => {
                    if (channel.constructor.name === 'VoiceChannel') {
                        if (channel.members.has(message.author.id)) {
                            found = true;
                            message.reply(`trying to download "${message.attachments.first().name}"`)
                            dhl.get(message.attachments.first().url)
                                .on('error', message.reply)
                                .pipe(F.createWriteStream(`tmp/${message.attachments.first().name}`)
                                    .on('finish', () => {
                                        message.reply('done downloading, joining...')
                                        channel.join()
                                            .then(state => {
                                                let dispatcher = state.play(`tmp/${message.attachments.first().name}`)
                                                F.writeFile('tmp/np', `${message.attachments.first().name.split('.')[0]}`, (err) => {if(err !== null) {console.log(err)}})
                                                dispatcher.on('finish', async () => {
                                                    if(!await check_repeat()) {
                                                        F.writeFile('tmp/np', `none`, (err) => {if(err !== null) {console.log(err)}})
                                                        state.disconnect()
                                                    } else {
                                                        rep(state, `tmp/${message.attachments.first().name}`)
                                                            .catch(message.reply)
                                                    }
                                                })
                                            })
                                            .catch(message.reply)
                                    })
                                )}
                    }
                    })
                })
                        if(!found) {
                                message.reply("I don't see you in any VoiceChannel that i got permissions for! :(")
                            }
            } else {
                message.reply('I only take .mp3 and .wav files!')
            }
        } else {
            message.reply(`Sorry i don't take dm's`)} //ignore dm's
        }
    else if (message.content.charAt(0) === process.env.DISCORD_PREFIX) {
            const command = message.content.substr(1).split(" ")[0].trim();
            const args = message.content.split(' ').slice(1);
            const useable = client.huso.get(command);
            if(!useable){
                message.reply(`no command found named: ${command}.`)
                return
            } else {
                useable.execute(discord,message,args);}
    }
});

client.login(token);