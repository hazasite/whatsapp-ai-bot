const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qr-image'); // මේක අලුතෙන් ඕන වෙනවා
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

let lastQr = null; // QR එක store කරගන්න variable එකක්

// ප්‍රධාන පිටුවට ගියාම QR එක පෙන්වන විදිහ
app.get('/', (req, res) => {
    if (lastQr) {
        // QR එක image එකක් විදිහට generate කරලා පෙන්වනවා
        const qr_svg = qrcodeImage.image(lastQr, { type: 'png' });
        res.type('png');
        qr_svg.pipe(res);
    } else {
        res.send('<h1>HAZA AI</h1><p>තවම QR එකක් ජෙනරේට් වෙලා නැහැ. පොඩ්ඩක් ඉන්න හෝ සර්විස් එක Restart කරන්න.</p>');
    }
});

app.listen(port, () => {
    console.log(`Web Server is running on port ${port}`);
});

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
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
        // Termux එකේ Chromium තියෙන Path එක:
        executablePath: '/data/data/com.termux/files/usr/bin/chromium'
    }
});
client.on('qr', (qr) => {
    lastQr = qr; // අලුත්ම QR එක variable එකට දාගන්නවා
    console.log('New QR generated. Please check the Web URL.');
    qrcodeTerminal.generate(qr, { small: true });
});

client.on('ready', () => {
    lastQr = null; // කනෙක්ට් වුණාම QR එක අයින් කරනවා
    console.log('[SUCCESS] HAZA AI සූදානම්! 🚀');
});

client.on('message', async (message) => {
    if (message.fromMe) return;
    
    // Test: AI එකට යවන්න කලින් මේක වැඩද බලමු
    if (message.body.toLowerCase() === 'hi') {
        message.reply('Haza AI වැඩ මචං! දැන් AI එක කනෙක්ට් කරන එක විතරයි ඉතිරි.');
        return;
    }

    // AI කොටස...
    try {
        // ... කලින් තිබුණු openai කෝඩ් එක ...
    } catch (e) {
        console.error(e);
        message.reply('AI එකේ මොකක් හරි අවුලක් මචං. ලොග් එක බලන්න.');
    }
});;

client.initialize();
