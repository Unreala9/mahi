/**
 * Production Proxy Server for Hostinger
 * This server proxies requests from your HTTPS frontend to the HTTP Diamond API
 * 
 * Deploy this alongside your frontend build on Hostinger
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3000;

// Diamond API configuration
const DIAMOND_API_BASE = process.env.DIAMOND_API_BASE || 'http://130.250.191.174:3009';
const DIAMOND_API_KEY = process.env.DIAMOND_API_KEY || 'mahi4449839dbabkadbakwq1qqd';

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Set your Hostinger domain here
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Proxy all /api/diamond requests to the Diamond API
app.all('/api/diamond/*', async (req, res) => {
  try {
    // Extract the path after /api/diamond
    const apiPath = req.path.replace('/api/diamond', '');
    
    // Build the target URL
    const targetUrl = `${DIAMOND_API_BASE}${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
    
    console.log(`[Proxy] ${req.method} ${targetUrl}`);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      ...req.headers
    };

    // Remove host header to avoid conflicts
    delete headers.host;

    // Add API key if not already in query params
    const urlObj = new URL(targetUrl);
    if (!urlObj.searchParams.has('key')) {
      urlObj.searchParams.set('key', DIAMOND_API_KEY);
    }

    // Make the request to the Diamond API
    const options = {
      method: req.method,
      headers: headers
    };

    // Add body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(urlObj.toString(), options);
    const data = await response.text();

    // Forward the response
    res.status(response.status);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send the response
    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }

  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message
    });
  }
});

// WebSocket proxy for real-time data (optional)
const server = http.createServer(app);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying requests to: ${DIAMOND_API_BASE}`);
  console.log(`🔑 Using API key: ${DIAMOND_API_KEY.substring(0, 10)}...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
