const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');

// 1. AI Configuration (OpenRouter)
// This uses your provided API key and the Step-3.5-Flash model
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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",
    defaultHeaders: {
        "HTTP-Referer": "https://github.com/haza", // Required by OpenRouter for free models
        "X-Title": "HAZA AI Bot",
    }
});

// 2. System Prompt - Identity of HAZA AI
const systemPrompt = `You are HAZA AI, a highly professional and intelligent WhatsApp assistant. 
You represent Janma Hasarel, the founder of the brand HAZA. 
Janma is a versatile Full Stack Developer (Web, App, Graphic Design) from Richmond College, Galle. 
He learned his skills from the "nas.io/kdj" community admin, KD Jayakody.
Always maintain a professional and polite tone. You can respond in both Sinhala and English. 
Since you don't require a prefix, engage naturally in conversation as an expert assistant.`;

// 3. WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Pointing to your local Chrome to save data and avoid Puppeteer download issues
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions'
        ]
    }
});

// --- Event Listeners ---

// QR Code Generation
client.on('qr', (qr) => {
    console.log('\n[INFO] QR Code generated. Please scan it using your WhatsApp app.');
    qrcode.generate(qr, { small: true });
});

// Successful Connection
client.on('ready', () => {
    console.log('--------------------------------------------------');
    console.log('[SUCCESS] HAZA AI is now online and active! 🚀');
    console.log('--------------------------------------------------');
});

// Main Message Handler
client.on('message', async (message) => {
    // Stop the bot from responding to itself to avoid infinite loops
    if (message.fromMe) return;

    const chat = await message.getChat();

    // Specific Status Commands (Optional but professional)
    if (message.body.toLowerCase() === '.info') {
        return message.reply(`*HAZA AI - System Information*\n\n*Status:* Online ✅\n*Developer:* Janma Hasarel (HAZA)\n*AI Model:* Step-3.5-Flash`);
    }

    if (message.body.toLowerCase() === '.ping') {
        return message.reply('Pong! 🏓\nSystem is fully operational.');
    }

    // AI Processing for all messages (No prefix required)
    try {
        // Show "typing..." status in WhatsApp for a realistic feel
        await chat.sendStateTyping();

        const response = await openai.chat.completions.create({
            model: "stepfun/step-3.5-flash:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message.body }
            ]
        });

        const aiReply = response.choices[0].message.content;
        
        // Send the AI response
        await message.reply(aiReply);

    } catch (error) {
        console.error('\n[ERROR] AI Logic Failed:', error.message);
        // Silently fail to avoid spamming the user with error logs in the chat
    }
});

// Start the Bot
client.initialize();