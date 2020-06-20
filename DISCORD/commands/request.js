const F = require('fs')
module.exports = {
    name: 'request',
    description: 'adds a request to karls todo-list (can be alleshusos.de or hahnrich related)',
    async execute(discord,message,args) {
      let request = '';
      let n = 0;
      if(args.length !== 0) {
        while(n < args.length) {
          if(n==0) {
            request = request.concat(args[n])
          } else {
            request = request.concat(' ', args[n])
          }
          n++
        }
        let data = message.author + ',' + message.author.username + ',' + `"${request}"` + ',' + new Date() + '\n'
        F.appendFile('../alleshusos.de/private/todo-list.csv', data.toString(), function (err) {
          if(!err) {
            message.reply('added your request to the todo-list!')
          } else {
            console.log(err)
            message.reply('there was an error adding your request.')
          }
        })
      } else {
        message.reply('Please specify your rquest!')
      }
}}
