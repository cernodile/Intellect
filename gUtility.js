var Discord = require('discord.js')
var bot = new Discord.Client()
var config = require('./config.json')
var cmds = require('./commands.js')
var prefix = config.prefix

bot.login(config.token)
bot.on('ready', () => {
  console.log('Ready!')
})
bot.on('message', m => {
  if (m.author.bot) return
  if (m.content.startsWith(prefix)) {
    var cmd = m.content.substr(prefix.length).split(' ')[0]
    var suffix = m.content.substr(m.content.split(' ')[0].length + 1)
    if (cmds[cmd]) {
      try {
        cmds[cmd].fn(bot, m, suffix)
      } catch (e) {
        m.channel.send('send error to owner pls kthx\n\n```' + e.stack + '```')
      }
    }
  }
})
