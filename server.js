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
}, 300000) // every 5 minutes


// ======== MINECRAFT BOT ========
function createBot() {
  const bot = mineflayer.createBot({
    host: '144.76.72.157',
    port: 21515,
    username: 'lccalivebot',
    version: '1.12.2'
  })

  let afkInterval = null

  bot.on('spawn', () => {
    console.log('Bot joined server!')

    // Register + Login after short delay
    setTimeout(() => {
      bot.chat('/register keepalive keepalive')
      bot.chat('/login keepalive')
    }, 3000)

    // ===== IMPROVED ANTI-AFK SYSTEM =====
    if (afkInterval) clearInterval(afkInterval)

    afkInterval = setInterval(() => {
      // Randomize movements to look more natural
      const actions = ['forward', 'back', 'left', 'right', 'jump']
      const action = actions[Math.floor(Math.random() * actions.length)]

      console.log(`Performing anti-AFK action: ${action}`)
      bot.setControlState(action, true)

      // Stop movement after short time (0.5–1s)
      setTimeout(() => {
        bot.setControlState(action, false)
      }, 500 + Math.random() * 500)

      // Random chat occasionally to prevent idle
      if (Math.random() < 0.1) {
        bot.chat('.') // small dot to simulate activity
      }
    }, 30000) // every 30 seconds (much safer than 5 minutes)
  })


  // ===== AUTO RE-LOGIN IF KICKED =====
  bot.on('kicked', (reason) => {
    console.log('Kicked:', reason)
  })

  bot.on('messagestr', (msg) => {
    const lower = msg.toLowerCase()
    if (lower.includes('register')) bot.chat('/register keepalive keepalive')
    if (lower.includes('login')) bot.chat('/login keepalive')
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
