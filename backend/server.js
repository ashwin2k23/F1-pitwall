require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const http = require('http');
const WebSocket = require('ws');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fantasyRoutes = require('./routes/fantasyRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fantasy', fantasyRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'F1 PitWall backend is running' });
});

// YouTube Proxy Endpoint
app.get('/api/youtube/latest', async (req, res) => {
    try {
        const response = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg');
        const xml = await response.text();
        
        // Simple Regex to extract video id and title
        const entries = [];
        const entryRegex = /<entry>[\s\S]*?<\/entry>/g;
        let match;
        
        while ((match = entryRegex.exec(xml)) !== null) {
            const entryText = match[0];
            const videoIdMatch = entryText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            const titleMatch = entryText.match(/<title>([^<]+)<\/title>/);
            
            if (videoIdMatch && titleMatch) {
                entries.push({
                    id: videoIdMatch[1],
                    title: titleMatch[1],
                    // We can derive race/label generically since we don't have tags in RSS
                    race: 'Latest Video',
                    label: titleMatch[1].toUpperCase().includes('HIGHLIGHTS') ? 'RACE HIGHLIGHTS' : 'NEW'
                });
            }
        }
        
        // Return latest 12 videos
        res.json(entries.slice(0, 12));
    } catch (error) {
        console.error("Error fetching YouTube feed:", error);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('🔌 Client connected to Pitwall Live Telemetry WebSocket');
    ws.send(JSON.stringify({ type: 'STATUS', message: 'TELEMETRY_LINKED' }));
    
    ws.on('close', () => {
        console.log('🔌 Client disconnected');
    });
});

// Telemetry Broadcast Ticker
const ACRONYMS = ['VER', 'NOR', 'LEC', 'PIA', 'SAI', 'HAM', 'RUS', 'PER', 'ALO', 'TSU', 'ALB', 'GAS', 'OCO', 'HUL', 'STR', 'MAG', 'BOT', 'ZHO', 'SAR'];
const SECTOR_LABELS = ['Sector 1', 'Sector 2', 'Sector 3'];

setInterval(() => {
    if (wss.clients.size > 0) {
        const acronym = ACRONYMS[Math.floor(Math.random() * ACRONYMS.length)];
        const sectorNum = Math.floor(Math.random() * 3) + 1;
        const sectorTime = (12 + Math.random() * 20).toFixed(3);
        
        // Broadcast telemetry ticks
        const payload = JSON.stringify({
            type: 'TELEMETRY_TICK',
            acronym,
            sector: sectorNum,
            time: sectorTime,
            status: Math.random() > 0.85 ? 'PURPLE' : Math.random() > 0.5 ? 'GREEN' : 'YELLOW',
            gapDelta: (Math.random() * 0.18 - 0.09).toFixed(3),
            speedTrap: Math.floor(305 + Math.random() * 38)
        });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }
}, 3000);

server.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
