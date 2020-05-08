const discord = require('./discord');
const F = require('fs');
const client = new discord.Client();
client.huso = new Map()
require('opusscript')
require('dotenv').config();
const token = process.env.DISCORD_TOKEN

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const commandFiles = F.readdirSync('./DISCORD/commands').filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command_from_file = require(`./DISCORD/commands/${file}`)
        client.huso.set(command_from_file.name, command_from_file)
    }

client.on('message', message => {
    if (message.content.charAt(0) === process.env.DISCORD_PREFIX) {
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