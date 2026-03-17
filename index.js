const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

// Render එකට අවශ්‍ය වෙබ් සර්වර් එක (Health Check)
app.get('/', (req, res) => {
    res.send('<h1>HAZA AI බොට් සාර්ථකව ක්‍රියාත්මක වේ!</h1><p>ලොග්ස් පරීක්ෂා කර QR එක ස්කෑන් කරන්න.</p>');
});

app.listen(port, () => {
    console.log(`Web Server is running on port ${port}`);
});

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
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
        // සර්වර් එකේ Chromium තියෙන තැන
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
    }
});

client.on('qr', (qr) => {
    console.log('--- QR CODE START ---');
    // 1. ටර්මිනල් එකේ QR එක පෙන්වයි
    qrcode.generate(qr, { small: true });
    
    // 2. ලොග් එකේ QR එක පේන්න නැත්නම් මේ ලින්ක් එක පාවිච්චි කරන්න
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log('\n--- IMPORTANT: QR LINK ---');
    console.log(qrImageUrl);
    console.log('--- IMPORTANT: QR LINK ---\n');
});

client.on('ready', () => {
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
        console.error('Error with OpenAI API:', e);
    }
});

client.initialize();
