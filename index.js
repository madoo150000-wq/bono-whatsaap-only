const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
const readline = require('readline')

const BOT_ID = "BONO2000" // كود الربط الثابت 8 حروف

const designs = {
ping: `╔═══❖•ೋ°•❖═══╗
║ 🏓 𝗣𝗜𝗡𝗚: ${BOT_ID} 🏓 ║
║ ⚡ ʟᴀɢ: 0.02ᴍs ⚡ ║
║ 👑 𝓗𝓪𝓶𝓸 & 𝓟𝓮𝓬𝓪𝓼𝓸 ║
║ 🆔 𝓘𝓓: ${BOT_ID} ║
╚═══❖•ೋ°•❖═══╝`,
menu: `┏━•❃°•°❀°•°❃•━┓
┃ 📜 ${BOT_ID} 𝕄𝔼ℕ𝕌 📜 ┃
┃ 🔥 𝔸𝕃 ℂ𝕆𝕄𝔸ℕ𝔻𝕊 🔥 ┃
┃ 👑 ℌ𝔞𝔪𝔬 & 𝔓𝔢𝔠𝔞𝔰𝔬 ┃
┃ 🆔 ID: ${BOT_ID} ┃
┗━•❃°•°❀°•°❃•━┛`,
owner: `◤━━━━━•◈•━━━━━◥
◣ 👑 𝙾𝚆𝙽𝙴𝚁𝚂: ${BOT_ID} 👑 ◢
◤ 𝕳𝖆𝖒𝖔 & 𝕻𝖊𝖈𝖆𝖘𝖔 ◥
◣ 🆔 ${BOT_ID} ◢
◤━━━━━•◈•━━━━━◥`,
bot: `╭──•◍•──•◍•──╮
│ 🤖 ${BOT_ID} 𝗕𝗢𝗧 🤖 │
│ ✨ 𝑶𝒏𝒍𝒊𝒏𝒆 ✨ │
│ 👑 𝑯𝒂𝒎𝒐 & 𝑷𝒆𝒄𝒂𝒔𝒐 │
│ 🆔 𝑰𝑫: ${BOT_ID} │
╰──•◍•──•◍•──╯`,
}

function build(type, body) {
 return `${designs[type]}\n\n${body}\n\n━━━━━━━ • ❖ • ━━━━━━━\n👑 𝕮𝖗𝖊𝖆𝖙𝖊𝖉 𝖇𝖞 𝕳𝖆𝖒𝖔 & 𝕻𝖊𝖈𝖆𝖘𝖔 | 🆔 ${BOT_ID}`
}

function askNumber() {
 const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
 return new Promise(resolve => {
  rl.question('📱 دخل رقم واتساب للربط (2010xxxxxxxx) > ', ans => { rl.close(); resolve(ans.trim()) })
 })
}

async function start() {
 console.log(designs.owner)
 const { state, saveCreds } = await useMultiFileAuthState(`auth-${BOT_ID}`)
 const sock = makeWASocket({
  auth: state,
  logger: P({ level: 'silent' }),
  printQRInTerminal: false,
  browser: [BOT_ID, "Chrome", "1.0"]
 })

 if (!sock.authState.creds.registered) {
  console.log(`\n🤖 جاري طلب كود ${BOT_ID}...`)
  let phoneNumber = await askNumber()
  phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
  setTimeout(async () => {
   try {
    // هنا بنثبت الكود BONO2000
    const code = await sock.requestPairingCode(phoneNumber, BOT_ID)
    console.log(`\n🔥🔥🔥 كود الربط: ${code} 🔥🔥🔥\nروح واتساب > الاجهزة المرتبطة > ربط برقم هاتف واكتب الكود`)
   } catch(e) {
    console.log("❌ لازم تحدث Baileys:", e.message)
    console.log("اكتب في التيرمنال: npm install github:WhiskeySockets/Baileys")
    const fallback = await sock.requestPairingCode(phoneNumber)
    console.log(`كود مؤقت: ${fallback}`)
   }
  }, 3000)
 }

 sock.ev.on('creds.update', saveCreds)
 sock.ev.on('connection.update', ({connection}) => { if(connection==='close') start() })

 sock.ev.on('messages.upsert', async m => {
  const msg = m.messages[0]
  if (!msg.message) return
  const from = msg.key.remoteJid
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
  if (!text.startsWith('.')) return
  const cmd = text.split(' ')[0].toLowerCase()

  if (cmd === '.تنصيب' || cmd === '.pair') {
   try {
    const num = from.split('@')[0]
    const code = await sock.requestPairingCode(num, BOT_ID)
    await sock.sendMessage(from, { text: build('owner', `✅ كود الربط بتاع ${BOT_ID}:\n\n*${code}*\n\n📱 روح:\nالاعدادات > الاجهزة المرتبطة > ربط جهاز > ربط برقم هاتف\n\nواكتب الكود ده\n\n👑 حمو & بيكاسو`) })
   } catch(e){ await sock.sendMessage(from, { text: `❌ ${e.message}` }) }
   return
  }

  if (cmd === '.ping') await sock.sendMessage(from, { text: build('ping', '🏓 Pong!') })
  if (cmd === '.menu') await sock.sendMessage(from, { text: build('menu', '.ping\n.menu\n.owner\n.bot\n.تنصيب') })
  if (cmd === '.owner') await sock.sendMessage(from, { text: build('owner', '1- 𝕳𝖆𝖒𝖔\n2- 𝕻𝖊𝖈𝖆𝖘𝖔') })
  if (cmd === '.bot') await sock.sendMessage(from, { text: build('bot', `BOT ID: ${BOT_ID}`) })
 })
}
start()
