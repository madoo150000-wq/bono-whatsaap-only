const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const BOT = "BONO BOT";
const OWNER = (process.env.OWNER_NUMBER||"201039757625").replace(/[^0-9]/g,'');
function B(t,d){return `*┏━━━🤖 ${t} 🤖━━━┓*\n${d}\n*┗━━━━━━━━━━━━━━┛*\n> ${BOT} | Hamo & Picasso 👑`;}
const AUTO=["😎 BONO BOT صاحي - /الاوامر","🎵 /اغنية عمرو دياب","🎮 /حب /ذكاء /زواج","👑 Hamo & Picasso","🔥 /منشن","🤖 /بنق","📖 /اذكار /حديث /دعاء","🤲 /استغفارات /تسبيح","🕌 /اذان"];
async function yt(q){
 const r=await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
 const t=await r.text(); const m=t.match(/"videoId":"([^"]+)"/);
 return m?`https://www.youtube.com/watch?v=${m[1]}`:null;
}
async function startAuto(sock){
 setInterval(async()=>{
  try{const c=await sock.groupFetchAllParticipating().catch(()=>({}));
  for(let id in c){await sock.sendMessage(id,{text:B('BONO BOT AUTO',AUTO[Math.floor(Math.random()*AUTO.length)])}); await new Promise(r=>setTimeout(r,2500));}
  }catch(e){}
 },5400000);
}
async function start(){
const {state,saveCreds}=await useMultiFileAuthState('./auth');
const sock=makeWASocket({auth:state,logger:P({level:'silent'}),browser:[BOT,"Chrome","11.0"]});
sock.ev.on('creds.update',saveCreds);
if(!state.creds.registered){await new Promise(r=>setTimeout(r,3000)); try{const c=await sock.requestPairingCode(OWNER);console.log(`\nكود ${BOT}: ${c}\n`);}catch(e){console.log(e.message)}}
sock.ev.on('connection.update',u=>{if(u.connection==='open'){console.log(`✅ ${BOT} شغال - 200 امر`);startAuto(sock);} if(u.connection==='close'&&u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut)start();});
sock.ev.on('messages.upsert',async m=>{
 const msg=m.messages[0];if(!msg.message||msg.key.fromMe)return;
 const from=msg.key.remoteJid;
 const txt=(msg.message.conversation||msg.message.extendedTextMessage?.text||"").trim();
 if(!txt.startsWith('/'))return;
 const q=txt.split(' ').slice(1).join(' ');
 const cmd=txt.split(' ')[0].toLowerCase();
 if(cmd==='/الاوامر'||cmd==='/منيو'){await sock.sendMessage(from,{text:B('200 امر',`🤖 ${BOT} V11 AUTO\n\n🎵 /اغنية [اسم] /غنية\n👥 /منشن /الرابط /طرد /قفل /فتح\n🎮 /العاب /حجر /حب /ذكاء /زواج /نكتة /صراحة /لو /توب\n📖 /اذكار /احاديث /استغفارات /تسبيح /دعاء /اذان /قبلة /سورة\n💬 /بنق /بونو /لو /نسبة\n\n> الرسائل التلقائية كل 90د\n> Hamo & Picasso 👑`)});return;}
 if(cmd==='/بنق'){await sock.sendMessage(from,{text:B('بنق',`🏓 بونج! ${BOT} شغال 200 امر 🤖⚡`)});return;}
 if(cmd==='/بونو'){await sock.sendMessage(from,{text:B('بونو',`نعم يا ملك؟ ${BOT} جاهز 👑`)});return;}
 if(cmd==='/منشن'){const g=await sock.groupMetadata(from).catch(()=>null);if(!g)return;let mem=g.participants.map(p=>p.id);let t='';mem.forEach(x=>t+=`@${x.split('@')[0]} `);await sock.sendMessage(from,{text:B('منشن',`🤖 ${BOT}\n\n${t}`),mentions:mem});return;}
 if(cmd==='/الرابط'){const c=await sock.groupInviteCode(from).catch(()=>null);await sock.sendMessage(from,{text:B('الرابط',c?`https://chat.whatsapp.com/${c}`:'❌ مش جروب')});return;}
 if(cmd==='/طرد'){let u=msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];if(u){await sock.groupParticipantsUpdate(from,[u],'remove');await sock.sendMessage(from,{text:B('طرد',`تم طرد @${u.split('@')[0]}`),mentions:[u]});}return;}
 if(cmd==='/قفل'){await sock.groupSettingUpdate(from,'announcement');await sock.sendMessage(from,{text:B('قفل','🔒 قفل الجروب')});return;}
 if(cmd==='/فتح'){await sock.groupSettingUpdate(from,'not_announcement');await sock.sendMessage(from,{text:B('فتح','🔓 فتح الجروب')});return;}
 if(cmd==='/العاب'){await sock.sendMessage(from,{text:B('العاب','/حجر /حب /ذكاء /زواج /نكتة /صراحة /لو /توب /نسبة')});return;}
 if(cmd==='/حب'){await sock.sendMessage(from,{text:B('حب',`❤️ نسبة الحب: ${Math.floor(Math.random()*101)}%`)});return;}
 if(cmd==='/ذكاء'){await sock.sendMessage(from,{text:B('ذكاء',`🧠 ذكائك: ${Math.floor(Math.random()*101)}%`)});return;}
 if(cmd==='/زواج'){await sock.sendMessage(from,{text:B('زواج',`💍 نسبة الزواج: ${Math.floor(Math.random()*101)}%`)});return;}
 if(cmd==='/نكتة'){await sock.sendMessage(from,{text:B('نكتة',`😂 ${['مرة واحد غبي راح للدكتور','واحد بخيل مات','مسطول سألوه'].sort(()=>0.5-Math.random())[0]}`)});return;}
 if(cmd==='/اذكار'){await sock.sendMessage(from,{text:B('اذكار','🤲 اللهم بك أصبحنا وبك أمسينا\nسبحان الله وبحمده 100 مرة')});return;}
 if(cmd==='/احاديث'||cmd==='/حديث'){await sock.sendMessage(from,{text:B('حديث',`📜 قال ﷺ: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان: سبحان الله وبحمده سبحان الله العظيم"`)});return;}
 if(cmd==='/استغفارات'||cmd==='/استغفار'){await sock.sendMessage(from,{text:B('استغفار','أستغفر الله العظيم\nسبحان الله\nالحمد لله\nالله أكبر')});return;}
 if(cmd==='/تسبيح'){await sock.sendMessage(from,{text:B('تسبيح','سبحان الله 33\nالحمد لله 33\nالله أكبر 34')});return;}
 if(cmd==='/اذان'){await sock.sendMessage(from,{text:B('اذان','🕌 العاشر من رمضان\nفجر 5:10 ظهر 12:50 عصر 4:15 مغرب 6:45 عشاء 8:05')});return;}
 if(cmd==='/قبلة'){await sock.sendMessage(from,{text:B('قبلة','🕋 القبلة: 137° جنوب شرق')});return;}
 if(cmd==='/دعاء'){await sock.sendMessage(from,{text:B('دعاء','🤲 اللهم اغفر لي وارحمني واهدني وارزقني')});return;}
 if(cmd==='/سورة'){await sock.sendMessage(from,{text:B(`سورة ${q||'الفاتحة'}`,`📖 سورة ${q||'الفاتحة'}\nبسم الله الرحمن الرحيم...`)});return;}
 if(cmd==='/اغنية'||cmd==='/غنية'||cmd==='/song'){
  let name=txt.replace('/اغنية','').replace('/غنية','').replace('/song','').trim();
  if(!name){await sock.sendMessage(from,{text:B('اغنية','🎵 اكتب /اغنية تملي معاك')});return;}
  await sock.sendMessage(from,{text:B('بحث',`🎵 ببحث عن: ${name}...`)});
  try{const url=await yt(name); if(!url)throw new Error('ملقتش'); const f=`./${Date.now()}.mp3`;
  const s=ytdl(url,{filter:'audioonly',quality:'highestaudio'}); const w=fs.createWriteStream(f); s.pipe(w);
  await new Promise((r,j)=>{w.on('finish',r);w.on('error',j);});
  await sock.sendMessage(from,{audio:fs.readFileSync(f),mimetype:'audio/mpeg'});
  await sock.sendMessage(from,{document:fs.readFileSync(f),mimetype:'audio/mpeg',fileName:`${name}.mp3`});
  await sock.sendMessage(from,{text:B('تم',`✅ ${name} جاهز 🤖`)}); fs.unlinkSync(f);
  }catch(e){await sock.sendMessage(from,{text:B('خطأ',e.message)});}
  return;
 }
});
}
start();
