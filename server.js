const express = require('express')
const mineflayer = require('mineflayer')
const https = require('https')

const app = express()
const PORT = process.env.PORT || 3000

// ======== WEB SERVER (RENDER) ========
app.get('/', (req, res) => {
  res.send('Keepalive bot running 😈')
})

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`)
})

// ======== SELF PING ========
const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://lcc-mc-bot.onrender.com'

setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log(`Self ping OK - ${res.statusCode}`)
  }).on('error', (err) => {
    console.log('Ping failed:', err.message)
  })
}, 300000)


// ======== MINECRAFT BOT ========

function createBot() {
  const bot = mineflayer.createBot({
    host: '144.76.72.157',
    port: 21515,
    username: 'lccalivebot'
  })

  let moveForward = true
  let afkInterval = null

  bot.on('spawn', () => {
    console.log('Bot joined server!')

    // Register + Login
    setTimeout(() => {
      bot.chat('/register keepalive keepalive')
      bot.chat('/login keepalive')
    }, 3000)

    // ===== ANTI AFK SYSTEM =====
    if (afkInterval) clearInterval(afkInterval)

    afkInterval = setInterval(() => {
      if (moveForward) {
        console.log('Moving forward 1 block')
        bot.setControlState('forward', true)

        setTimeout(() => {
          bot.setControlState('forward', false)
        }, 1000) // ~1 block

      } else {
        console.log('Moving backward 1 block')
        bot.setControlState('back', true)

        setTimeout(() => {
          bot.setControlState('back', false)
        }, 1000)
      }

      moveForward = !moveForward
    }, 300000) // every 5 minutes
  })


  // ===== AUTO RE-LOGIN IF KICKED =====
  bot.on('kicked', (reason) => {
    console.log('Kicked:', reason)
  })

  bot.on('messagestr', (msg) => {
    const lower = msg.toLowerCase()

    if (lower.includes('register')) {
      bot.chat('/register keepalive keepalive')
    }

    if (lower.includes('login')) {
      bot.chat('/login keepalive')
    }
  })


  // ===== RECONNECT SYSTEM =====
  bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 5 seconds...')
    if (afkInterval) clearInterval(afkInterval)
    setTimeout(createBot, 5000)
  })

  bot.on('error', (err) => {
    console.log('Bot error:', err.message)
  })
}

createBot()
