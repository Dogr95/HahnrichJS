const F = require('fs')
let status = Boolean;
module.exports = {
    name: 'np',
    description: 'shows currently playing file',
    async execute(discord,message,args) {
        let np = await F.readFileSync('tmp/np', function(err){if (err != null){console.log(err)}})
        if (np.toString() !== 'none') {
            message.reply(`Currently Playing: ${np.toString()}`)
        } else {
            message.reply(`Not playing anything currently`)
        }
}}