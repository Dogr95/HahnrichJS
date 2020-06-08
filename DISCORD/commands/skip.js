const F = require('fs');
module.exports = {
    name: 'skip',
    description: 'skips current song (does the same as !random)',
    execute(discord,message,args,client) {
        client.huso.get('random').execute(discord,message,args,client)
    }
}