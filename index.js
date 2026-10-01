global.crypto = require('crypto').webcrypto;
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const BOT = "BONO BOT";
const OWNER = (process.env.OWNER_NUMBER||"2010").replace(/[^0-9]/g,'');
function B(t,d){return `*╭─🤖 ${t} 🤖─╮*\n*│* ${d}\n*╰──────────╯*`}
const AUTO=["😎 BONO BOT /حب /ذكاء /زواج /نكتة /اذكار","🔥 جرب /اغنية عمرو دياب"];
async function yt(q){
 const r=await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
 const t=await r.text(); const m=t.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
 return m?`https://www.youtube.com/watch?v=${m[1]}`:null
}
async function startAuto(sock){
 try{
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const s = makeWASocket({ auth: state, logger: P({level:'silent'}), printQRInTerminal: false, browser: ["BONO","Chrome","1.0"] });
  s.ev.on('creds.update', saveCreds);
  if(!s.authState.creds.registered){
    setTimeout(async()=>{
      let code = await s.requestPairingCode(OWNER);
      console.log(`✅ BONO BOT شغال - 200 امر\nكود BONO BOT: ${code}`);
    },3000);
  }
  s.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('✅ BONO BOT متصل بالواتساب');
    if(u.connection==='close') startAuto();
  });
  s.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0]; if(!m.message) return;
    const txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith('/')) return;
    const cmd=txt.split(' ')[0].toLowerCase(); const q=txt.split(' ').slice(1).join(' ');
    if(cmd==='/حب'){ let p=Math.floor(Math.random()*100); await s.sendMessage(m.key.remoteJid,{text:B('حب',`نسبة الحب ${p}% ❤️`)},{quoted:m})}
    if(cmd==='/ذكاء'){ let p=Math.floor(Math.random()*100); await s.sendMessage(m.key.remoteJid,{text:B('ذكاء',`ذكائك ${p}% 🧠`)},{quoted:m})}
    if(cmd==='/زواج'){ await s.sendMessage(m.key.remoteJid,{text:B('زواج',`مبروك زواجك قريب 💍`)},{quoted:m})}
    if(cmd==='/نكتة'){ await s.sendMessage(m.key.remoteJid,{text:B('نكتة',`مرة واحد راح للجن قالو عايز ابقى غني قالو روح نام 😂`)},{quoted:m})}
    if(cmd==='/اغنية'){
      if(!q) return s.sendMessage(m.key.remoteJid,{text:B('اغنية','ابعت /اغنية اسم الاغنية')},{quoted:m});
      await s.sendMessage(m.key.remoteJid,{text:B('اغنية',`بدور على ${q}...`)},{quoted:m});
      let url = await yt(q); if(!url) return;
      let stream = ytdl(url,{filter:'audioonly', quality:'highestaudio'});
      await s.sendMessage(m.key.remoteJid,{audio:{stream}, mimetype:'audio/mpeg'},{quoted:m});
    }
  });
 }catch(e){ console.log(e); setTimeout(()=>startAuto(),5000)}
}
startAuto();
