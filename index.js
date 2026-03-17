const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

// Render එකට අවශ්‍ය වෙබ් සර්වර් එක
app.get('/', (req, res) => {
    res.send('HAZA AI බොට් සාර්ථකව ක්‍රියාත්මක වේ!');
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
        // Windows සහ Linux දෙකටම ගැළපෙන විදිහට path එක සකස් කර ඇත
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
    }
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE:');
    // ලොග් එකේ පේන්න QR එක ජෙනරේට් කරනවා
    qrcode.generate(qr, { small: true });
    
    // QR එක ලින්ක් එකක් විදිහටත් දෙනවා (ලොග් එකේ පේන්න නැත්නම් මේක පාවිච්චි කරන්න පුළුවන්)
    console.log('If the QR is not clear, use this link to generate it:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
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
        console.error('Error with OpenAI:', e);
    }
});

client.initialize();
