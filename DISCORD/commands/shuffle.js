const F = require('fs');
module.exports = {
    name: 'shuffle',
    description: 'sets !random to automaticly refresh on finish',
    async execute(discord,message,args,client) {
        let random_repeatF = await F.readFileSync('tmp/random_repeat', function(err){if (err != null){console.log(err)}})
        if(random_repeatF.toString().includes('false')) {
            F.writeFile('tmp/random_repeat', 'true', (err) => {if(err !== null){console.log(err)}})
            status = 'on'
        } else if(random_repeatF.toString().includes('true')) {
            F.writeFile('tmp/random_repeat', 'false', (err) => {if(err !== null){console.log(err)}})
            status = 'off'
        }
        await message.reply(`Shuffle turned ${status}`)
    }
}