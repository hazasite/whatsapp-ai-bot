FROM node:20

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/src/app

COPY package*.json ./

# DNS issue එකක් එන නිසා npm install කරද්දී මේ විදිහට කරමු
RUN npm install

COPY . .

# Hugging Face එකට අවශ්‍ය Port එක
EXPOSE 7860

# Docker එකේ DNS ප්‍රශ්නය මඟහරවන්න මේ විදිහට run කරමු
CMD ["node", "index.js"]
