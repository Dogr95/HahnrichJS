const F = require('fs');
const Discord = require('discord.js');
module.exports = {
    name: 'help',
    description: 'sends this embed',
    execute(discord,message,args,client) {
        let help_prompt = new Discord.MessageEmbed()
                .setColor('#d10202')
                .setTitle('List of Commands:')
                .setURL('https://zap-hosting.com/de/shop/donation/b46e5e7b07106dad59febaf3b66fd5e5/')
                .setAuthor('HahnrichJS', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cb/cb9a41873f2065b8010afa7584803d283dd7e6ad_full.jpg', 'https://alleshusos.de')
                .setFooter('If you want to support this bot, click on the "List of Commands" header!')
        client.huso.forEach((key, command) => {
            help_prompt.addField(`${key.name}`, `${key.description}`, true)
        })
        message.reply(help_prompt)
    }
}