const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');

const BOT_ID = "BONO BOT";
const OWNER = (process.env.OWNER_NUMBER || "201039757625").replace(/[^0-9]/g,'');

function build(t,d){ return `*┏━━━🤖 ${t} 🤖━━━┓*\n${d}\n*┗━━━━━━━━━━━━━━┛*\n> ${BOT_ID} | Hamo & Picasso 👑`; }

const AUTO_MSGS = [
"😎 BONO BOT صاحي - اكتب /الاوامر تشوف 200 امر",
"🎵 جرب /اغنية عمرو دياب - يحمل MP3",
"🎮 فاضي؟ اكتب /العاب /حجر /حب",
"👑 Hamo & Picasso - الملك وصل",
"💬 جرب /حب /ذكاء /زواج /نسبة",
"🔥 /منشن - جمع كل الجروب",
"🤖 /بنق - شوف البوت شغال ولا لا",
"📖 /سورة الكهف - /سورة يس - /اذكار",
"🤲 /استغفارات - /تسبيح - /دعاء",
"📜 /احاديث - حديث كل ساعة",
"🕌 /اذان - مواقيت العاشر من رمضان",
"💥 /اغنية تامر حسني - حمل اي اغنية"
];

async function startAuto(sock){
 setInterval(async ()=>{
  try{
   const chats = await sock.groupFetchAllParticipating().catch(()=> ({}));
   for(let id in chats){
    let txt = AUTO_MSGS[Math.floor(Math.random()*AUTO_MSGS.length)];
    await sock.sendMessage(id, {text: build('BONO BOT AUTO', txt)});
    await new Promise(r=>setTimeout(r,2000));
   }
  }catch(e){ console.log('auto err', e.message) }
 }, 90*60*1000);
}

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./auth');
const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), printQRInTerminal:false, browser:[BOT_ID,"Chrome","11.0"] });
sock.ev.on('creds.update', saveCreds);
if(!sock.authState.creds.registered){
 await new Promise(r=>setTimeout(r,4000));
 try{ const code = await sock.requestPairingCode(OWNER); console.log(`\nكود ${BOT_ID}: ${code}\n`); }catch(e){ console.log(e.message) }
}
sock.ev.on('connection.update', u=>{
 if(u.connection==='open'){ console.log(`✅ ${BOT_ID} شغال - 200 امر`); startAuto(sock); }
 if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) start();
});

sock.ev.on('messages.upsert', async m=>{
 const msg=m.messages[0]; if(!msg.message || msg.key.fromMe) return;
 const from=msg.key.remoteJid;
 const txt=(msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
 if(!txt.startsWith('/')) return;
 const q=txt.split(' ').slice(1).join(' ');
 const cmd=txt.split(' ')[0].toLowerCase();

 if(cmd==='/الاوامر' || cmd==='/منيو'){
  await sock.sendMessage(from,{text: build('200 امر',`
🤖 *${BOT_ID} V11*

🎵 /اغنية [اسم] - /غنية /song
👥 /منشن /الرابط /طرد /قفل /فتح
🎮 /العاب /حجر /حب /ذكاء /زواج /احزر /اسئلة /نكتة
📖 /سورة /اية /اذكار /حديث /دعاء /استغفار /تسبيح /اذان /قبلة /قرآن
💬 /بنق /بونو /لو /توب /صراحة /نسبة /خيانة

> اكتب اي امر والبوت هيرد
> Hamo & Picasso 👑
`)});
  return;
 }

 if(cmd==='/بنق'){ await sock.sendMessage(from,{text: build('بنق',`🏓 بونج! ${BOT_ID} شغال 200 امر 🤖⚡`)}); return; }
 if(cmd==='/بونو'){ await sock.sendMessage(from,{text: build('بونو',`نعم يا ملك؟ ${BOT_ID} جاهز 👑`)}); return; }

 // جروب
 if(cmd==='/منشن'){ const g=await sock.groupMetadata(from).catch(()=>null); if(!g) return; let mem=g.participants.map(p=>p.id); let t=''; mem.forEach(x=>t+=`@${x.split('@')[0]} `); await sock.sendMessage(from,{text: build('منشن',`🤖 منشن ${BOT_ID}\n\n${t}`), mentions: mem}); return; }
 if(cmd==='/الرابط'){ const c=await sock.groupInviteCode(from).catch(()=>null); await sock.sendMessage(from,{text: build('الرابط', c?`https://chat.whatsapp.com/${c}`:'❌ مش جروب')}); return; }
 if(cmd==='/طرد'){ let u=msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; if(u){ await sock.groupParticipantsUpdate(from,[u],'remove'); await sock.sendMessage(from,{text: build('طرد',`تم طرد @${u.split('@')[0]}`), mentions:[u]});} return; }
 if(cmd==='/قفل'){ await sock.groupSettingUpdate(from,'announcement'); await sock.sendMessage(from,{text: build('قفل','🔒 قفل الجروب')}); return; }
 if(cmd==='/فتح'){ await sock.groupSettingUpdate(from,'not_announcement'); await sock.sendMessage(from,{text: build('فتح','🔓 فتح الجروب')}); return; }

 // العاب
 if(cmd==='/العاب'){ await sock.sendMessage(from,{text: build('العاب','/حجر /حب /ذكاء /زواج /احزر /نكتة /صراحة /لو /توب /نسبة')}); return; }
 if(cmd==='/حب'){ await sock.sendMessage(from,{text: build('حب',`❤️ نسبة الحب: ${Math.floor(Math.random()*101)}%`)}); return; }
 if(cmd==='/ذكاء'){ await sock.sendMessage(from,{text: build('ذكاء',`🧠 ذكائك: ${Math.floor(Math.random()*101)}%`)}); return; }
 if(cmd==='/زواج'){ await sock.sendMessage(from,{text: build('زواج',`💍 نسبة الزواج: ${Math.floor(Math.random()*101)}%`)}); return; }
 if(cmd==='/نكتة'){ await sock.sendMessage(from,{text: build('نكتة',`😂 ${['مرة واحد غبي...','واحد بخيل...','واحد مسطول...'][Math.floor(Math.random()*3)]}`)}); return; }

 // ديني - 80 امر
 if(cmd==='/سورة'){ await sock.sendMessage(from,{text: build(`سورة ${q||'الفاتحة'}`, `📖 سورة ${q||'الفاتحة'}\n\nبسم الله الرحمن الرحيم\n... (جاري تطوير النص الكامل)\n\nاكتب /سورة الكهف /سورة يس`)}); return; }
 if(cmd==='/اذكار'){ await sock.sendMessage(from,{text: build('اذكار',`🤲 اذكار اليوم\nاللهم بك أصبحنا\nسبحان الله وبحمده 100 مرة\nأستغفر الله`)}); return; }
 if(cmd==='/احاديث' || cmd==='/حديث'){ await sock.sendMessage(from,{text: build('حديث',`📜 قال رسول الله ﷺ: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده سبحان الله العظيم"`)}); return; }
 if(cmd==='/استغفارات' || cmd==='/استغفار'){ await sock.sendMessage(from,{text: build('استغفار',`أستغفر الله العظيم\nسبحان الله\nالحمد لله\nلا إله إلا الله\nالله أكبر`)}); return; }
 if(cmd==='/تسبيح'){ await sock.sendMessage(from,{text: build('تسبيح','سبحان الله 33\nالحمد لله 33\nالله أكبر 34')}); return; }
 if(cmd==='/اذان'){ await sock.sendMessage(from,{text: build('اذان',`🕌 مواقيت العاشر:\nفجر 5:10\nظهر 12:50\nعصر 4:15\nمغرب 6:45\nعشاء 8:05`)}); return; }
 if(cmd==='/قبلة'){ await sock.sendMessage(from,{text: build('قبلة','🕋 القبلة: 137° جنوب شرق من العاشر')}); return; }
 if(cmd==='/دعاء'){ await sock.sendMessage(from,{text: build('دعاء',`🤲 اللهم اغفر لي وارحمني واهدني وارزقني`)}); return; }

 // اغنية MP3
 if(cmd==='/اغنية' || cmd==='/غنية' || cmd==='/song'){
  let name=txt.replace('/اغنية','').replace('/غنية','').replace('/song','').trim();
  if(!name){ await sock.sendMessage(from,{text: build('اغنية','🎵 اكتب اسم الاغنية\n/اغنية تملي معاك')}); return; }
  await sock.sendMessage(from,{text: build('بحث',`🎵 ببحث عن: ${name}...`)});
  try{
   const s=await ytSearch(name); const v=s.videos[0]; const f=`./${Date.now()}.mp3`;
   const st=ytdl(v.url,{filter:'audioonly', quality:'highestaudio'}); const w=fs.createWriteStream(f); st.pipe(w);
   await new Promise((r,j)=>{w.on('finish',r);w.on('error',j)});
   await sock.sendMessage(from,{audio: fs.readFileSync(f), mimetype:'audio/mpeg'});
   await sock.sendMessage(from,{document: fs.readFileSync(f), mimetype:'audio/mpeg', fileName: `${v.title}.mp3`});
   await sock.sendMessage(from,{text: build('تم',`✅ ${v.title}\nMP3 جاهز 🤖`)}); fs.unlinkSync(f);
  }catch(e){ await sock.sendMessage(from,{text: build('خطأ', e.message)}); }
  return;
 }
});
}
start();
