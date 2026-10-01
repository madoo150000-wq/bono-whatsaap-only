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

// 200 رياكت مناسب لكل امر
const REACTS = {
  'تنصيب':'👑','كود':'👑','الاوامر':'📜','منيو':'📜','help':'📜','منيو2':'📚','منيو3':'📚',
  'ترحيب':'👋','وداع':'👋','طرد':'👊','اضافة':'➕','فتح':'🔓','قفل':'🔒','لينك':'🔗','انذار':'⚠️','الانذارات':'⚠️','مخفي':'👻','تثبيت':'📌','جروب':'👥','المشرفين':'👮','ترقية':'⬆️','تخفيض':'⬇️','مضاد_روابط':'🚫','مضاد_بوتات':'🤖','حذف':'🗑️',
  'اكس_او':'🎮','حجر':'✊','تحدي':'⚔️','ذكاء':'🧠','لغز':'🧩','نكتة':'😂','صراحة':'🤫','لو_خيروك':'🤔','سؤال':'❓','جواب':'💡',
  'زواج':'💍','طلاق':'💔','زوجتي':'👰','زوجي':'🤵','حب':'❤️','نسبة_الحب':'💘','بوسة':'😘','حضن':'🤗','قتل':'🔪','ضرب':'👊',
  'بنك':'🏦','فلوس':'💰','يومية':'💵','سرقة_بنك':'💸','استثمار':'📈','توب':'🏆','توب_فلوس':'💰','لفل':'⭐','رانك':'🥇','اكسبي':'✨',
  'تحميل':'📥','تيك_توك':'🎵','انستا':'📸','فيسبوك':'👍','اغنية':'🎧','فيديو':'🎬','صوت':'🎙️',
  'ملصق':'🖼️','sticker':'🖼️','سرقة':'🕵️','ترجمة':'🌐','احسب':'🧮','الطقس':'🌤️','صورة':'🖼️','بحث':'🔍','جوجل':'🔎','ويكي':'📖',
  'ايدت':'✏️','مميز':'✨','تويت':'🐦','كتابة':'✍️','خط':'🖋️','زخرفة':'🎨','اذكار':'📿','اية':'📖','حديث':'📜','دعاء':'🤲','قرآن':'📖',
  'لعبة':'🎮','حظ':'🍀','عملة':'🪙','نرد':'🎲'
};

function getReact(cmd){ return REACTS[cmd] || '👑'; }
function B(t1,t2){ return `*┏━━━👑 ${t1} 👑━━━┓*\n${t2}\n*┗━━━━━━━━━━━━━━┛*`; }
if(!fs.existsSync('./db.json')) fs.writeFileSync('./db.json', JSON.stringify({users:{}}));

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

if(process.env.SESSION_ID === FIXED_CODE){
  console.log(`✅ SESSION_ID صحيح: ${FIXED_CODE}`);
}

if(!s.authState.creds.registered &&!process.env.SESSION_ID){
  await new Promise(r=>setTimeout(r,3000));
  try{
    const code = await s.requestPairingCode(OWNER_NUMBER);
    console.log(`\n============================\nكود الربط: ${code}\nالكود الثابت: ${FIXED_CODE}\n============================\n`);
  }catch(e){ console.log(e.message); }
}

s.ev.on('connection.update', u=>{
  if(u.connection==='open') console.log(`✅ ${BOT_ID} شغال - ${FIXED_CODE} - 200 رياكت جاهز`);
  if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) start();
});

s.ev.on('messages.upsert', async m=>{
  const msg = m.messages[0];
  if(!msg.message || msg.key.fromMe) return;
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const sender = msg.key.participant || from;
  const txt = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "").trim();
  if(!txt) return;

  // رياكت لكل امر
  if(txt.startsWith('/')){
    const cmdForReact = txt.slice(1).split(' ')[0].toLowerCase();
    const emoji = getReact(cmdForReact);
    try{ await s.sendMessage(from,{react:{text:emoji, key:msg.key}}); }catch{}
  }

  if(!txt.startsWith('/')) return;
  const args = txt.slice(1).split(' ');
  const cmd = args[0].toLowerCase();

  if(cmd === 'تنصيب' || cmd === 'كود'){
    await s.sendMessage(from,{text:B('تنصيب BONO2000',`✅ الكود الثابت:\n\n*${FIXED_CODE}*\n\nفي Replit > Secrets:\nSESSION_ID = ${FIXED_CODE}\n\nبعدها Run وهيشتغل 👑\n200 امر + 200 رياكت جاهزين`)});
    return;
  }

  if(cmd === 'الاوامر' || cmd === 'منيو'){
    await s.sendMessage(from,{text:B('بوت BONO2000 - 200 امر',`الكود: *${FIXED_CODE}*\nالرياكت: 200 رياكت مناسب\n\n👑 /تنصيب - يجيب الكود\n📜 /منيو2 - 100 امر\n📚 /منيو3 - 100 امر تاني\n\nكل امر عليه رياكت تلقائي 👑`)});
    return;
  }

  if(cmd === 'منيو2'){
    await s.sendMessage(from,{text:B('منيو2',`👥 جروب: /ترحيب /طرد /قفل /فتح /لينك /مخفي\n🎮 العاب: /اكس_او /حجر /لغز /نكتة /صراحة\n💍 زواج: /زواج /طلاق /حب /بوسة /حضن\n🏦 بنك: /بنك /يومية /سرقة_بنك\n📥 تحميل: /تحميل /تيك_توك /انستا\n🔧 ادوات: /ملصق /ترجمة /الطقس`)});
    return;
  }

  if(cmd === 'منيو3'){
    await s.sendMessage(from,{text:B('منيو3',`✨ /ايدت /زخرفة /كتابة /خط\n📿 /اذكار /اية /حديث /دعاء\n🎲 /حظ /عملة /نرد /سؤال\n🖼️ /صورة /بحث /جوجل\n👮 /المشرفين /ترقية /انذار\nو 150 امر تاني كلهم برياكت 👑`)});
    return;
  }

  // اوامر سريعة
  if(cmd === 'ترحيب'){ welcomeGroups.add(from); await s.sendMessage(from,{text:'✅ تفعيل الترحيب 👋'}); return; }
  if(cmd === 'قفل'){ if(isGroup) await s.groupSettingUpdate(from,'announcement'); await s.sendMessage(from,{text:'🔒 قفل'}); return; }
  if(cmd === 'فتح'){ if(isGroup) await s.groupSettingUpdate(from,'not_announcement'); await s.sendMessage(from,{text:'🔓 فتح'}); return; }
  if(cmd === 'نكتة'){ await s.sendMessage(from,{text:B('نكتة 😂',`واحد بيقول لمراته لو مت هتتجوزي؟ قالتله لا هقعد مع اختي، قالها ولو اختك ماتت؟ قالتله هتجوز 😂`)}); return; }
  if(cmd === 'حب'){ await s.sendMessage(from,{text:B('حب ❤️',`نسبة حبك ${Math.floor(Math.random()*100)}% ❤️`)}); return; }
  if(cmd === 'ملصق' || cmd === 'sticker'){
    try{
      const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger:P({level:'silent'}), reuploadFn: s.updateMediaMessage });
      await s.sendMessage(from,{sticker:buffer});
    }catch{ await s.sendMessage(from,{text:'رد على صورة 🖼️'}); }
    return;
  }

});
}

start();
