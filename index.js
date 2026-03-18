const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qr-image');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

let lastQr = null;

// වෙබ් පිටුවෙන් QR එක බලන්න (https://localhost:10000)
app.get('/', (req, res) => {
    if (lastQr) {
        const qr_png = qrcodeImage.image(lastQr, { type: 'png' });
        res.type('png');
        qr_png.pipe(res);
    } else {
        res.send('<h1>HAZA AI</h1><p>තවම QR එකක් ජෙනරේට් වෙලා නැහැ. පොඩ්ඩක් ඉන්න...</p>');
    }
});

app.listen(port, () => {
    console.log(`Web Server is running on port ${port}`);
});

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY, // ඔයා කමාන්ඩ් එකෙන් දෙන Key එක මෙතනට ගනීවි
    defaultHeaders: {
        "HTTP-Referer": "https://render.com",
        "X-Title": "HAZA AI",
    }
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        // Termux එකේ Chromium තියෙන නිවැරදිම පාත් එක තමයි මේක:
        executablePath: '/data/data/com.termux/files/usr/bin/chromium'
    }
});

client.on('qr', (qr) => {
    lastQr = qr;
    console.log('--- NEW QR GENERATED ---');
    qrcodeTerminal.generate(qr, { small: true });
    console.log('Scan the QR above or visit the Web URL to see the QR.');
});

client.on('ready', () => {
    lastQr = null;
    console.log('[SUCCESS] HAZA AI සූදානම්! 🚀');
});

client.on('message', async (message) => {
    if (message.fromMe) return;

    try {
        const response = await openai.chat.completions.create({
            model: "stepfun/step-3.5-flash:free",
            messages: [
                { role: "system", content: "You are HAZA AI, a professional assistant created by Janma Hasarel." },
                { role: "user", content: message.body }
            ]
        });
        message.reply(response.choices[0].message.content);
    } catch (e) {
        console.error('Error with OpenAI/OpenRouter:', e.message);
    }
});

client.initialize();
