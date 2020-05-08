module.exports = {
    name: 'dice',
    description: 'rolls a dice with a given amount of sides',
    execute(chatClient,channel,user,message,args) {
        user = user.displayName
        // check if number of decimals are given, if not set default value of 3
        if ( Number.parseInt(args[1]) && args[1] > 0 ) { Number.parseInt(args[1]) }
        else { args[1] = 3 } // default value
        if ( Number.parseFloat(args[0]) ) { // check if given args are int/float
            const diceRoll = Math.random() * args[0] + 1;
            if ( args[1] > 100 ) { args[1] = 100 } // fix potential crash when toFixed is higher than 100
            chatClient.action(channel, `@${user} rolled a ${diceRoll.toFixed(args[1])}`)
        } else {
            chatClient.action(channel, `@${user} that is not a number!`)
        }
    }
}