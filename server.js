/**
 * Node.js Proxy Server for Diamond API
 * Alternative to PHP proxy for Hostinger Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const DIAMOND_API_BASE = 'http://130.250.191.174:3009';
const API_KEY = process.env.DIAMOND_API_KEY || 'mahi4449839dbabkadbakwq1qqd';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Diamond API Proxy is running',
    timestamp: new Date().toISOString()
  });
});

// Main proxy endpoint - handles all paths
app.all('/api/diamond/:path(*)', async (req, res) => {
  try {
    const path = req.params.path || '';
    
    if (!path) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing API path'
      });
    }

    // Build target URL
    let targetUrl = `${DIAMOND_API_BASE}/${path}`;
    
    // Add query parameters
    const queryParams = new URLSearchParams(req.query);
    
    // Add API key if not present
    if (!queryParams.has('key')) {
      queryParams.append('key', API_KEY);
    }
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`[${req.method}] Proxying to: ${targetUrl}`);

    // Make the request
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    // Return response with same status code
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy Error',
      message: 'Failed to connect to Diamond API',
      details: error.message
    });
  }
});

// Catch all other routes
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Use /api/diamond/* for API requests'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Diamond API Proxy running on port ${PORT}`);
  console.log(`📡 Forwarding requests to: ${DIAMOND_API_BASE}`);
  console.log(`🔑 Using API Key: ${API_KEY.substring(0, 10)}...`);
});

module.exports = app;
