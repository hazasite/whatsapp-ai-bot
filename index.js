const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const { OpenAI } = require('openai');
const express = require('express');
const qrcodeImage = require('qr-image');

const app = express();
const port = process.env.PORT || 10000;
let lastQr = null;

// Web Server to view QR
app.get('/', (req, res) => {
    if (lastQr) {
        const qr_png = qrcodeImage.image(lastQr, { type: 'png' });
        res.type('png');
        qr_png.pipe(res);
    } else {
        res.send('<h1>HAZA AI</h1><p>QR එක ජෙනරේට් වෙනකම් පොඩ්ඩක් ඉන්න මචං...</p>');
    }
});

app.listen(port, () => {
    console.log(`Web Server started on port ${port}`);
});

// OpenAI/OpenRouter Setup
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://haza.lk", // Just a placeholder
        "X-Title": "HAZA AI",
    }
});

// WhatsApp Client Setup
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
        // මෙන්න මේ පාත් එක තමයි වැදගත්ම දේ!
        executablePath: '/data/data/com.termux/files/usr/bin/chromium'
    }
});

client.on('qr', (qr) => {
    lastQr = qr;
    console.log('--- NEW QR GENERATED ---');
    qrcodeTerminal.generate(qr, { small: true });
    console.log('Scan above or visit: http://localhost:10000');
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
                { role: "system", content: "You are HAZA AI, a helpful assistant." },
                { role: "user", content: message.body }
            ]
        });
        message.reply(response.choices[0].message.content);
    } catch (e) {
        console.error('API Error:', e.message);
    }
});

client.initialize();
