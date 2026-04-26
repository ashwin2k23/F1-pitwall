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

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

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

app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
