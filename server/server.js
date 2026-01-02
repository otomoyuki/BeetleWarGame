// server/server.js
// 将来のマルチプレイヤー対応のための基本構造

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sgPointsRoutes from './routes/sg-points.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// SemanticGrove SGポイントAPI
app.use('/api/sg', sgPointsRoutes);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Beetle War Game Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes (将来実装予定)
// app.use('/api/auth', authRoutes);
// app.use('/api/games', gameRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🪲 Beetle War Game Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

export default app;