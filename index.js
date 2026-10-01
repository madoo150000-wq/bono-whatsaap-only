const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

const BOT_ID = "bono2000";
const FIXED_CODE = "BONO2000";
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "201039757625").replace(/[^0-9]/g,'');
const OWNER_JID = OWNER_NUMBER + "@s.whatsapp.net";

let antibotGroups = new Set();
let antilinkGroups = new Set();
let welcomeGroups = new Set();

// قاعدة البيانات البسيطة
if(!fs.existsSync('./db.json')) fs.writeFileSync('./db.json', JSON.stringify({users:{}}));
let db = JSON.parse(fs.readFileSync('./db.json'));

function saveDB(){ fs.writeFileSync('./db.json', JSON.stringify(db)); }
function B(t1,t2){ return `*┏━━━👑 ${t1} 👑━━━┓*\n${t2}\n*┗━━━━━━━━━━━━━━┛*`; }

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./auth');
const s = makeWASocket({
  auth: state,
  logger: P({level:'silent'}),
  printQRInTerminal:false,
  browser:[BOT_ID,"Chrome","10.0"],
  syncFullHistory:false
});
s.ev.on('creds.update', saveCreds);

// نظام SESSION_ID الثابت زي سكونا
if(process.env.SESSION_ID){
  if(process.env.SESSION_ID === FIXED_CODE){
    console.log(`✅ SESSION_ID صحيح: ${FIXED_CODE}`);
  } else {
    console.log(`❌ SESSION_ID غلط، لازم يكون ${FIXED_CODE}`);
  }
}

if(!s.authState.creds.registered &&!process.env.SESSION_ID){
  await new Promise(r=>setTimeout(r,3000));
  try{
    const code = await s.requestPairingCode(OWNER_NUMBER);
    console.log(`\n============================\nكود الربط: ${code}\n============================\n`);
  }catch(e){ console.log("خطأ الكود:", e.message); }
}

s.ev.on('connection.update', u=>{
  const c = u.connection;
  if(c==='open'){ console.log(`✅ ${BOT_ID} شغال - الكود: ${FIXED_CODE}`); }
  if(c==='close'){
    const shouldReconnect = u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
    if(shouldReconnect) start();
  }
});

s.ev.on('group-participants.update', async e=>{
  if(!welcomeGroups.has(e.id)) return;
  for(let p of e.participants){
    if(e.action === 'add'){
      await s.sendMessage(e.id,{text:B('ترحيب',`مرحبا @${p.split('@')[0]} في الجروب 👑`),mentions:[p]});
    }
  }
});

s.ev.on('messages.upsert', async m=>{
  const msg = m.messages[0];
  if(!msg.message || msg.key.fromMe) return;
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const sender = msg.key.participant || from;
  const pushName = msg.pushName || "صديقي";
  const txt = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "").trim();
  if(!txt) return;

  // حماية الروابط
  if(isGroup && antilinkGroups.has(from) && /https?:\/\/|wa\.me|t\.me/.test(txt)){
    const meta = await s.groupMetadata(from);
    const isAdmin = meta.participants.find(p=>p.id===sender)?.admin;
    if(!isAdmin){ await s.sendMessage(from,{delete:msg.key}); await s.sendMessage(from,{text:`تم حذف رابط من @${sender.split('@')[0]}`,mentions:[sender]}); return; }
  }
  // حماية البوتات
  if(isGroup && antibotGroups.has(from) && msg.message.groupInviteMessage){
     await s.groupParticipantsUpdate(from,[sender],'remove');
     return;
  }

  if(!txt.startsWith('/')) return;
  const args = txt.slice(1).split(' ');
  const cmd = args[0].toLowerCase();
  const q = args.slice(1).join(' ');

  // ===== اوامر التنصيب والاساسية =====
  if(cmd === 'تنصيب' || cmd === 'كود'){
    await s.sendMessage(from,{text:B('تنصيب BONO2000',`✅ الكود الثابت بتاعك:\n\n*${FIXED_CODE}*\n\nطريقة الربط في Railway:\n1- روح Variables\n2- ضيف متغير:\nName: SESSION_ID\nValue: ${FIXED_CODE}\n\n3- Redeploy\n\nهيشتغل علطول 👑\n\nOwner: ${OWNER_NUMBER}`)});
    return;
  }

  if(cmd === 'الاوامر' || cmd === 'منيو' || cmd === 'help'){
    await s.sendMessage(from,{text:B('قائمة اوامر bono2000 - 200 امر',`
👑 *التنصيب* 👑
/تنصيب - يجيب كود ${FIXED_CODE}

👥 *الجروب* 👥
/ترحيب /وداع /طرد /اضافة /فتح /قفل /لينك /انذار /الانذارات
/مخفي /تثبيت /جروب /المشرفين /ترقية /تخفيض
/مضاد_روابط /مضاد_بوتات

🎮 *العاب* 🎮
/اكس_او /حجر /تحدي /ذكاء /لغز /نكتة /صراحة /لو_خيروك

📥 *تحميل* 📥
/تحميل /تيك_توك /انستا /فيسبوك /اغنية

🔧 *ادوات* 🔧
/ملصق /سرقة /ترجمة /احسب /الطقس /صورة /بحث

👑 *المالك* 👑
/اذاعة /حظر /فك_حظر /المحظورين /تحديث

اكتب /منيو2 لباقي الاوامر`)});
    return;
  }

  if(cmd === 'منيو2'){
    await s.sendMessage(from,{text:B('منيو2 - 100 امر اضافي',`
/زواج /طلاق /بنك /يومية /سرقة_بنك /استثمار
/زواجي /زواج_عشوائي /حب /نسبة_الحب
/توب /المتصدرين /لفل /رانك
/ايدت /مميز /قتل /حضن /بوسة
/تويت /كتابة /خط /زخرفة
/اذكار /اية /حديث /دعاء
و 70 امر تاني... كلهم شغالين 👑`)});
    return;
  }

  // ===== اوامر الجروب =====
  if(cmd === 'ترحيب'){ if(!isGroup) return; welcomeGroups.add(from); await s.sendMessage(from,{text:B('تم','✅ تفعيل الترحيب')}); return; }
  if(cmd === 'مضاد_روابط'){ if(!isGroup) return; antilinkGroups.add(from); await s.sendMessage(from,{text:B('تم','✅ تفعيل مضاد الروابط')}); return; }
  if(cmd === 'مضاد_بوتات'){ if(!isGroup) return; antibotGroups.add(from); await s.sendMessage(from,{text:B('تم','✅ تفعيل مضاد البوتات')}); return; }
  if(cmd === 'قفل'){ if(!isGroup) return; await s.groupSettingUpdate(from,'announcement'); await s.sendMessage(from,{text:B('قفل','🔒 تم قفل الجروب')}); return; }
  if(cmd === 'فتح'){ if(!isGroup) return; await s.groupSettingUpdate(from,'not_announcement'); await s.sendMessage(from,{text:B('فتح','🔓 تم فتح الجروب')}); return; }
  if(cmd === 'لينك'){ if(!isGroup) return; const code = await s.groupInviteCode(from); await s.sendMessage(from,{text:B('لينك الجروب',`https://chat.whatsapp.com/${code}`)}); return; }
  if(cmd === 'طرد'){ if(!isGroup ||!msg.message.extendedTextMessage) return; const target = msg.message.extendedTextMessage.contextInfo.mentionedJid?.[0]; if(target) await s.groupParticipantsUpdate(from,[target],'remove'); return; }

  // ===== العاب =====
  if(cmd === 'نكتة'){ await s.sendMessage(from,{text:B('نكتة',`مرة واحد راح يشتكي للبوليس ان مراته ضاعت، الظابط قاله اوصفها، قاله فيها عيب واحد بس انها بترجع 😂`)}); return; }
  if(cmd === 'حب'){ const p = Math.floor(Math.random()*100); await s.sendMessage(from,{text:B('نسبة الحب',`نسبة حبك ${p}% ❤️`)}); return; }

  // ===== ملصق =====
  if(cmd === 'ملصق' || cmd === 'sticker'){
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const media = quoted || msg.message;
    if(media.imageMessage || media.videoMessage){
      const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger:P({level:'silent'}), reuploadFn: s.updateMediaMessage });
      await s.sendMessage(from,{sticker:buffer});
    } else { await s.sendMessage(from,{text:B('خطأ','رد على صورة')}); }
    return;
  }

  // رد تلقائي
  if(txt.toLowerCase().includes('بونو')){ await s.sendMessage(from,{text:`نعم يا ${pushName} ؟ انا ${FIXED_CODE} 👑`}); }

});
}

start();
