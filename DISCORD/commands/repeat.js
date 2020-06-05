const F = require('fs')
let status = Boolean;
module.exports = {
    name: 'repeat',
    description: 'sets repeat boolean to true',
    async execute(discord,message,args) {
        let repeatF = await F.readFileSync('tmp/repeat', function(err){if (err != null){console.log(err)}})
        if(repeatF.toString().includes('false')) {
            F.writeFile('tmp/repeat', 'true', (err) => {if(err !== null){console.log(err)}})
            status = 'on'
        } else if(repeatF.toString().includes('true')) {
            F.writeFile('tmp/repeat', 'false', (err) => {if(err !== null){console.log(err)}})
            status = 'off'
        }
        await message.reply(`Repeating turned ${status}`)
}}