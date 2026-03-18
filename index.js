const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');

// OpenAI Setup
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function startHazaAI() {
    const { state, saveCreds } = await useMultiFileAuthState('haza_auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // මෙතනින් කෙලින්ම QR එක පෙන්වයි
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('සම්බන්ධතාවය විසන්ධි වුණා. නැවත උත්සාහ කරනවා...', shouldReconnect);
            if (shouldReconnect) startHazaAI();
        } else if (connection === 'open') {
            console.log('[SUCCESS] HAZA AI දැන් සක්‍රියයි! 🚀');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (!text) return;

            const from = msg.key.remoteJid;

            try {
                const aiResponse = await openai.chat.completions.create({
                    model: "stepfun/step-3.5-flash:free",
                    messages: [
                        { role: "system", content: "You are HAZA AI, created by Janma Hasarel." },
                        { role: "user", content: text }
                    ]
                });

                await sock.sendMessage(from, { text: aiResponse.choices[0].message.content });
            } catch (e) {
                console.error("AI Error:", e.message);
            }
        }
    });
}

startHazaAI();
