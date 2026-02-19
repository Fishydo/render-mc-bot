const express = require('express')
const mineflayer = require('mineflayer')
const http = require('http')

const app = express()
const PORT = process.env.PORT || 3000

// ======== HTTP SERVER (FOR RENDER) ========
app.get('/', (req, res) => {
  res.send('Keepalive bot running 😈')
})

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`)
})

// ======== SELF PING EVERY 5 MINUTES ========
setInterval(() => {
  const url = `http://localhost:${PORT}`
  http.get(url, (res) => {
    console.log('Self ping successful')
  }).on('error', (err) => {
    console.log('Ping failed:', err.message)
  })
}, 300000) // 5 minutes

// ======== MINECRAFT BOT ========

function createBot() {
  const bot = mineflayer.createBot({
    host: '144.76.72.157',
    port: 21515,
    username: 'lccalivebot'
  })

  bot.on('spawn', () => {
    console.log('Bot joined server!')

    // Wait 3 seconds then register/login
    setTimeout(() => {
      bot.chat('/register keepalive keepalive')
      bot.chat('/login keepalive')
    }, 3000)
  })

  bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 5 seconds...')
    setTimeout(createBot, 5000)
  })

  bot.on('error', (err) => {
    console.log('Bot error:', err.message)
  })
}

createBot()
