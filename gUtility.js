var Discord = require('discord.js')
var bot = new Discord.Client()
var items = require('./items.json')
var mass = require('./recipes.json')
var config = require('./config.json')
var moment = require('moment-timezone')
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

function getEndSeeds (amt) {
  var extraBlock = 0
  var left = amt
  while (left > 0) {
    extraBlock += left / 12
    left = left / 12
  }
  return Math.round((amt + extraBlock) / 4)
}

function getAvgBlocks (M, x = 1) {
  return Math.floor((5 * (M * 4) + 20) / 16 * x)
}

function getAvgSeeds (R, x) {
  return Math.round(x * 4 / (R + 12))
}

function getAncestralBonusBlocks (amt) {
  var extraBlock = 0
  var left = amt * 1.1
  while (left > 0) {
    extraBlock += (1.1 * left) / 12
    left = (left * 1.1) / 12
  }
  return Math.round((amt + extraBlock) / 4)
}
var cmds = {
  'help': {
    fn: function (bot, msg, suffix) {
      msg.channel.send('**Commands**\n' + Object.keys(cmds).join(', '))
    }
  },
  'reload': {
    fn: function (bot, msg, suffix) {
      if (msg.author.id !== config.master) return
      msg.channel.send('**brb reloading.**').then(d => {
        process.exit()
      })
    }
  },
  'ping': {
    fn: function (bot, msg, suffix) {
      msg.channel.send('**Calculating...**').then(m => {
        m.edit('My latency is about ' + (m.createdTimestamp - msg.createdTimestamp) + 'ms.')
      })
    }
  },
  'info': {
    fn: function (bot, msg, suffix) {
      var credits = []
      credits.push('**Cernodile** for creating this bot.')
      credits.push('**awesome187** for providing all descriptions from IDs 0-4946 + more.')
      credits.push('**Contributors on GitHub, that helped me improve this bot.**')
      msg.channel.send('**Credits**\n- ' + credits.join('\n- '))
    }
  },
  'event': {
    fn: function (bot, msg, suffix) {
      var dailyEmojis = ['<:Anemone:355028838327255041>', '<:Aurora:355028854135586816>', '<:Obsidian:355028893322706944>', '<:LavaLamp:355028903632568320>', '<:Fissure:355028800540639232>', '<:Waterfall:355028816826990612>', '<:HiddenDoor:355028827505819648>']
      var index = moment.tz(Date.now(), 'America/New_York').day()
      var date = moment.tz('America/New_York')
      var comet = ''
      var cmetTime
      var days
      var hours
      var mins
      var secs
      cmetTime = moment.tz([date.years(), date.months(), 28], 'America/New_York').diff(date)
      if (cmetTime > 0) {
        days = Math.floor(cmetTime / (1000 * 60 * 60 * 24))
        hours = Math.floor(cmetTime / (1000 * 60 * 60) % 24)
        mins = Math.floor(cmetTime / (1000 * 60) % 60)
        secs = Math.floor(cmetTime / (1000) % 60)
        comet = 'Coming in ' + (days > 0 ? days + ' days, ' : '') + (hours > 0 ? hours + ' hours, ' : '') + (mins > 0 ? mins + ' minutes' + (secs > 0 ? ' and ' : ', ') : '') + (secs > 0 ? secs + ' seconds' : '') + '.'
      } else {
        if (date.date() === 28) comet = 'Currently ongoing'
        else {
          cmetTime = moment.tz([(date.months() === 10 ? date.years() + 1 : date.years()), (date.months() === 10 ? 0 : date.months()), 28], 'America/New_York').diff(date)
          days = Math.floor(cmetTime / (1000 * 60 * 60 * 24))
          hours = Math.floor(cmetTime / (1000 * 60 * 60) % 24)
          mins = Math.floor(cmetTime / (1000 * 60) % 60)
          secs = Math.floor(cmetTime / (1000) % 60)
          comet = 'Coming in ' + (days > 0 ? days + ' days, ' : '') + (hours > 0 ? hours + ' hours, ' : '') + (mins > 0 ? mins + ' minutes' + (secs > 0 ? ' and ' : ', ') : '') + (secs > 0 ? secs + ' seconds' : '') + '.'
        }
      }
      var daily = ['Anemone', 'Aurora', 'Obsidian', 'Lava Lamp', 'Fissure', 'Waterfall', 'Hidden Door']
      msg.channel.send({
        embed: {
          fields: [{
            name: '\u{d83d}\u{dd59} Growtopia Time',
            value: moment.tz(Date.now(), 'America/New_York').format('MMM Do - HH:mm:ss')
          }, {
            name: '\u{2604} Night of The Comet',
            value: comet
          }, {
            name: '\u{d83c}\u{dfb2} Daily Block',
            value: dailyEmojis[index] + ' ' + daily[index]
          }]
        }
      })
    }
  },
  'wotd': {
    fn: function (bot, msg, suffix, db) {
      var https = require('https')
      https.get('https://growtopiagame.com/detail', (res) => {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          try {
            var data = JSON.parse(rawData)
            var wotd = data['world_day_images']['full_size'].substr(data['world_day_images']['full_size'].indexOf('worlds/') + 'worlds/'.length).replace('.png', '')
            let opt = {
              host: 'growtopiagame.com',
              path: '/worlds/' + wotd + '.png',
              method: 'HEAD'
            }
            let req = https.request(opt, (res2) => {
              var color = 0x3EE034
              msg.channel.send({
                embed: {
                  color,
                  title: '\u{d83c}\u{dfc6} World of The Day',
                  'description': "Today's WOTD is **" + wotd.toUpperCase() + '**\nAwarded on **' + res2.headers['last-modified'] + '**',
                  'image': {
                    url: 'https://growtopiagame.com/worlds/' + wotd + '.png?v=' + new Date(res2.headers['last-modified']).getTime()
                  }
                }
              })
            })
            req.end()
          } catch (e) {
            msg.channel.send('Error!\n' + e.stack)
          }
        })
      })
    }
  },
  'eval': {
    fn: function (bot, msg, suffix) {
      if (msg.author.id !== config.master) return

            function censor(censor) { // eslint-disable-line
              var i = 0
              return function (key, value) {
                if (i !== 0 && typeof (censor) === 'object' && typeof (value) === 'object' && censor === value && !Array.isArray(value)) return '[Object]'
                if (i > 0 && typeof (value) === 'object' && censor !== value && !Array.isArray(value)) return '[Object]'
                ++i
                return value
              }
            }
      try {
                var result = eval(suffix); // eslint-disable-line
        if (typeof result === 'object') {
          result = JSON.stringify(result, censor(result), 4)
          if (JSON.parse(result).shard) {
            result = JSON.parse(result)
            result.shard = '[Too Large To Display]'
            result = JSON.stringify(result, null, 4)
          }
        }
        if (typeof result === 'string') result = result.replace(new RegExp(bot.token, 'gi'), '[Censored]').substr(0, 1990)
        msg.channel.send('**Evaluation result**\n```xl\n' + result + '\n```').catch(e => {})
      } catch (e) {
        msg.channel.send('<:error:314122616728190976> Uh oh, there was an error in your code.```xl\n' + e.stack + '\n```').catch(e => {})
      }
    }
  },
  'world': {
    fn: function (bot, msg, suffix) {
      if (!suffix) return msg.channel.send('**Please input world name.**')
      if (suffix.match(/[a-zA-Z0-9]+/g)) {
        suffix = suffix.match(/[a-zA-Z0-9]+/g)[0]
      }
      let opt = {
        host: 'growtopiagame.com',
        path: '/worlds/' + suffix.toLowerCase() + '.png',
        method: 'HEAD'
      }
      var https = require('https')
      let req = https.request(opt, (res2) => {
        var color = 0x3EE034
        if (msg.guild) {
                    // color = msg.guild.members.get(bot.user.id).displayHexColor;
        }
        if (res2.statusCode === 404) {
          msg.channel.send({
            embed: {
              color: 0x3EE034,
              title: '\u{d83c}\u{df0e} Renderworld - ' + suffix.toUpperCase(),
              'description': 'No renderworld was found for this world.'
            }
          })
        } else {
          msg.channel.send({
            embed: {
              color,
              title: '\u{d83c}\u{df0e} Renderworld - ' + suffix.toUpperCase(),
              'description': 'Rendered on **' + res2.headers['last-modified'] + '**',
              'image': {
                url: 'https://growtopiagame.com/worlds/' + suffix.toLowerCase() + '.png?v=' + new Date(res2.headers['last-modified']).getTime()
              }
            }
          })
        }
      })
      req.end()
    }
  },
  'achieve': {
    alias: ['achievement'],
    fn: function (bot, msg, suffix) {
      var achieve = require('./achievements.json')
      var color = 0x3EE034
      if (achieve[suffix.toLowerCase()]) {
        msg.channel.send({
          embed: {
            color,
            description: achieve[suffix.toLowerCase()].desc,
            title: achieve[suffix.toLowerCase()].name,
            thumbnail: {
              url: achieve[suffix.toLowerCase()].icon
            }
          }
        })
      } else msg.channel.send("No such achievement found. Please make sure, that you're typing in the exact name of achievement.")
    }
  },
  'xp': {
    alias: ['level'],
    fn: function (bot, msg, suffix) {
      var param = suffix.split(' ')
      if (!isNaN(parseInt(param[0])) && !isNaN(parseInt(param[1]))) {
        var current = parseInt(param[0])
        var target = parseInt(param[1])
        if (current >= target) {
          msg.channel.send("**Target can't be lower or equal to current level.**")
        } else {
          if (current < 1 || current > 99) {
            msg.channel.send("**Current level can't be higher than 99 or lower than 1.**")
          } else {
            if (target < 2 || target > 100) {
              msg.channel.send("**Target level can't be higher than 100 or lower than 2.**")
            } else {
              var xp = 0
              var levelsLeft = target - current
              var progress = []
              while (levelsLeft > 0) {
                xp += Math.floor(50 * (Math.pow(target - levelsLeft, 2) + 2))
                progress.push('Level ' + (target - levelsLeft) + ' to ' + (target - levelsLeft + 1) + ' - ' + Math.floor(50 * (Math.pow(target - levelsLeft, 2) + 2)) + 'XP')
                levelsLeft--
              }
              msg.channel.send('**Level ' + current + ' to ' + target + '**\nTotal experience required: ' + xp + '\n\n' + (progress.length > 5 ? 'Showing your 5 closest levels\n' + progress.splice(0, 5).join('\n') : progress.join('\n')))
            }
          }
        }
      } else {
        msg.channel.send('**Please enter parameters respectively as `x y`, where x is your current level and y is target.**')
      }
    }
  },
  'farm': {
    fn: function (bot, msg, suffix) {
      var param = suffix.split(' ')
      var amount = param[0]
      if (!isNaN(parseInt(amount))) {
        amount = Math.floor(parseInt(amount))
        if (amount < 1) {
          msg.channel.send('Amount of blocks must be a positive number above zero.')
        } else {
          var rarity = parseInt(param[1])
          if (!isNaN(rarity)) {
            if (rarity < 1 && rarity > 500) {
              msg.channel.send('Rarity must be between 1 and 500.')
            } else {
              var maxDrop = parseInt(param[2]) || 2
              if (!isNaN(maxDrop)) {
                var blocks = getAvgBlocks(maxDrop, amount)
                msg.channel.send(':seedling: **Intellect Farming System**\nYou shall get **' + blocks + ' blocks** and **' + getAvgSeeds(rarity, amount) + " seeds**.\nHowever you'll get **" + (getEndSeeds(blocks) * 4 - blocks) + ' more blocks** (totalling ' + (getEndSeeds(blocks) * 4) + ' blocks) from breaking, and end up with **' + (getEndSeeds(blocks) + getAvgSeeds(rarity, amount)) + ' seeds.**\n\n' +
                                    'Ancestral Tesseract of Dimensions end up boosting your blocks total to **' + (getAncestralBonusBlocks(blocks) * 4) + '**, therefore increasing seed total to **' + (getAncestralBonusBlocks(blocks) + getAvgSeeds(rarity, amount)) + '**.')
              } else {
                msg.channel.send('Please specify a proper max drop per visible fruit.')
              }
            }
          } else {
            msg.channel.send('Please specify the rarity.')
          }
        }
      } else msg.channel.send('Please specify the amount of blocks.')
    }
  },
  'item': {
    fn: function (bot, m, suffix) {
      if (!suffix) return m.channel.send('I require input to find something in first place.')
      var data = items[suffix.toLowerCase()]
      var res = Object.keys(items).filter(i => i.includes(suffix.toLowerCase()))
      var len = res.length
      res.splice(10)
      for (var d in res) {
        res[d] = items[res[d]].name
      }
      if (len === 1) {
        if (!data) data = items[res[d].toLowerCase()]
      } else if (!data) {
        if (len === 0) {
          return m.channel.send('No such item found.')
        } else {
          return m.channel.send('**There are ' + len + ' results matching your input' + (len > 10 ? ', showing 10 first.' : '.') + '**\n\n- ' + res.join('\n- '))
        }
      }
      if (data) {
        var properties = []
        if (mass[data.name.toLowerCase()]) {
          if (mass[data.name.toLowerCase()].length === 2) {
            properties.push('To grow, splice a **' + items[mass[data.name.toLowerCase()][0]].name + ' Seed** with a **' + items[mass[data.name.toLowerCase()][1]].name + ' Seed**.\n')
          } else {
            var r = mass[data.name.toLowerCase()]
            properties.push('To create this item, combine **' + r[0].split('?')[0] + ' ' + items[r[0].split('?')[1]].name + '**, **' + r[1].split('?')[0] + ' ' + items[r[1].split('?')[1]].name + '** and **' + r[2].split('?')[0] + ' ' + items[r[2].split('?')[1]].name + '**.\n')
            properties.push("This item can't be spliced.")
          }
        } else {
          properties.push("This item can't be spliced.")
        }
        if ((data.properties & 4) > 0) {
          properties.push('This item never drops any seeds.')
        }
        if (data.category === 37) {
          properties.push('This item has no use... by itself.')
        }
        if ((data.properties & 128) > 0) {
          properties.push('This item can only be used in World-Locked worlds.')
        }
        if ((data.properties & 32768) > 0) {
          properties.push('This item cannot be dropped or traded.')
        }
        if ((data.properties & 512) > 0) {
          properties.push("This item can't be destroyed - smashing it will return it to your backpack if you have room!")
        }
        if ((data.properties & 1) > 0) {
          properties.push("This item can be placed in two directions, depending on the direction you're facing.")
        }
        if ((data.properties & 2) > 0) {
          properties.push('This item has special properties you can adjust with the wrench.')
        }
        if (data.category === 107) {
          properties.push('This item can be upgraded.')
        }
        m.channel.send({
          embed: {
            thumbnail: {
              url: 'https://tools.cernodile.com/growtopia/getItem.php?id=' + data.id
            },
            'color': 0x3EE034,
            'description': '**' + data.name + '** (' + (data.rarity === 999 ? 'No Rarity' : 'Rarity ' + data.rarity) + ', ID ' + data.id + ')\n*' + data.description + '*\n\n' + properties.join('\n')
          }
        })
      }
    }
  }
}
