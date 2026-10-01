global.crypto = require('crypto').webcrypto;
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const BOT = "BONO BOT";
const OWNER = (process.env.OWNER_NUMBER || "2010").replace(/[^0-9]/g,'');

function B(t,d){ return `*╭─🤖 ${t} ─╮*\n*│* ${d}\n*╰──────────╯*`; }

// ================= البوت الاساسي =================
async function startMain(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_main');
  const sock = makeWASocket({ 
    auth: state, 
    logger: P({level:'silent'}), 
    printQRInTerminal: false, 
    browser: ["BONO BOT","Chrome","1.0"] 
  });

  sock.ev.on('creds.update', saveCreds);

  // لو لسه مش مربوط - طلع كود للرقم الاساسي
  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      try{
        let code = await sock.requestPairingCode(OWNER);
        code = code.match(/.{1,4}/g).join('-');
        console.log(`✅ BONO BOT شغال - 200 امر\nكود BONO BOT: ${code}\nالكود صالح لمدة 60 ثانية فقط!`);
      }catch(e){ console.log("خطأ كود:", e.message); }
    },3000);
  }

  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('✅ BONO BOT متصل بالواتساب');
    if(u.connection==='close') setTimeout(startMain, 5000);
  });

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]; if(!m.message) return;
    const txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith('/')) return;
    
    const cmd = txt.split(' ')[0].toLowerCase();
    const q = txt.split(' ').slice(1).join(' ').trim();

    // اوامر عادية
    if(cmd==='/حب'){ let p=Math.floor(Math.random()*100); await sock.sendMessage(m.key.remoteJid,{text:B('حب',`نسبة الحب ${p}% ❤️`)},{quoted:m}); }
    if(cmd==='/ذكاء'){ let p=Math.floor(Math.random()*100); await sock.sendMessage(m.key.remoteJid,{text:B('ذكاء',`ذكائك ${p}% 🧠`)},{quoted:m}); }
    if(cmd==='/نكتة'){ await sock.sendMessage(m.key.remoteJid,{text:B('نكتة',`مرة واحد راح للجن قالو عايز ابقى غني قالو روح نام 😂`)},{quoted:m}); }
    if(cmd==='/زواج'){ await sock.sendMessage(m.key.remoteJid,{text:B('زواج',`مبروك فرحك قرب 💍`)},{quoted:m}); }

    // امر التنصيب الجديد
    if(cmd==='/تنصيب'){
      if(!q){
        return await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`عشان انصب البوت على تليفون تاني:\n\nاكتب:\n/تنصيب رقمك بكود البلد\n\nمثال:\n/تنصيب 201012345678\n\nهبعتلك كود تحطه في واتساب > الاجهزة المرتبطة`)},{quoted:m});
      }
      let num = q.replace(/[^0-9]/g,'');
      if(num.length < 11){
        return await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`رقم غلط!\nاكتبه زي كده: 201012345678`)},{quoted:m});
      }

      await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`⏳ بجهز كود لرقم ${num}...\nثواني وهبعتهولك`)},{quoted:m});

      try{
        // اعمل جلسة مؤقتة للرقم الجديد
        const folder = `./temp_${num}`;
        const { state: state2, saveCreds: save2 } = await useMultiFileAuthState(folder);
        const sock2 = makeWASocket({ auth: state2, logger: P({level:'silent'}), printQRInTerminal:false, browser:["BONO","Chrome","1.0"] });
        sock2.ev.on('creds.update', save2);

        setTimeout(async()=>{
          try{
            let code = await sock2.requestPairingCode(num);
            let pretty = code.match(/.{1,4}/g).join('-');
            await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`✅ كود الربط جاهز:\n\n*${pretty}*\n\n📱 روح تليفونك التاني:\n1- افتح واتساب\n2- الاعدادات > الاجهزة المرتبطة\n3- ربط جهاز > ربط برقم هاتف\n4- اكتب الكود ده\n\n⚠️ الكود صالح 60 ثانية بس!\nلو انتهى اكتب /تنصيب تاني وهبعتلك واحد جديد`)},{quoted:m});
            // امسح الجلسة المؤقتة بعد 2 دقيقة
            setTimeout(()=>{ try{ fs.rmSync(folder,{recursive:true,force:true}) }catch{} }, 120000);
          }catch(e){
            await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`❌ فشل:\n${e.message}\n\nجرب تاني بعد دقيقة`)},{quoted:m});
          }
        },4000);

      }catch(e){
        await sock.sendMessage(m.key.remoteJid,{text:B('تنصيب',`❌ ايرور: ${e.message}`)},{quoted:m});
      }
    }
  });
}

startMain();
