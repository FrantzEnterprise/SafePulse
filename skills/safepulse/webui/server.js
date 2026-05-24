#!/usr/bin/env node
/**
 * SafePulse Web UI Server
 * Serves the frontend and proxies prediction requests to predict.sh
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3099; // Fixed to avoid env override (global PORT=3001)
const PUBLIC_DIR = __dirname;
const PREDICT_SCRIPT = path.join(__dirname, '..', 'predict.sh');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function runPrediction(input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('bash', [PREDICT_SCRIPT], {
      env: { ...process.env, PATH: process.env.PATH },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);

    proc.on('close', code => {
      if (code !== 0 && code !== null) {
        reject(new Error(stderr.trim() || `Exit code ${code}`));
        return;
      }

      // Parse the structured output from predict.sh
      // The script outputs a formatted text block. We parse it into JSON.
      const result = parsePredictOutput(stdout);
      resolve(result);
    });

    proc.on('error', reject);

    // Send input as JSON
    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();
  });
}

function parsePredictOutput(text) {
  const result = {
    risk: '',
    likely_cause: '',
    technician_notes: '',
    recommended_action: '',
    parts_tools: '',
    customer_explanation: '',
    follow_up_months: 12
  };

  // Extract sections by header patterns
  const lines = text.split('\n');

  let currentSection = '';
  let buffer = [];

  const sectionMap = {
    'risk level': 'risk',
    'likely failure cause': 'likely_cause',
    'technician notes': 'technician_notes',
    'recommended action': 'recommended_action',
    'parts / tools to bring': 'parts_tools',
    'customer-friendly explanation': 'customer_explanation',
    'follow-up interval': 'follow_up_months',
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section header: "--- N. Section Name ---"
    const headerMatch = trimmed.match(/^---\s*\d+\.\s*(.+?)\s*---$/i);
    if (headerMatch) {
      // Flush previous section
      if (currentSection && buffer.length > 0) {
        const val = buffer.join(' ').trim();
        const key = sectionMap[currentSection];
        if (key) {
          if (key === 'follow_up_months') {
            const num = parseInt(val);
            result[key] = isNaN(num) ? 12 : num;
          } else if (key === 'risk') {
            // Risk may have icon prefix: "🚨 high" → "high"
            const words = val.split(/\s+/);
            result[key] = words[words.length - 1].toLowerCase();
          } else {
            result[key] = val;
          }
        }
      }
      currentSection = headerMatch[1].trim().toLowerCase();
      buffer = [];
      continue;
    }

    // Skip decorative lines and empty lines after headers
    if (trimmed.startsWith('===') || trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('Safe:') || trimmed.startsWith('Usage:') || trimmed.startsWith('Symptoms:') || trimmed.startsWith('Customer:') || trimmed.startsWith('Last Service:')) continue;

    if (trimmed) buffer.push(trimmed);
  }

  // Flush last section
  if (currentSection && buffer.length > 0) {
    const val = buffer.join(' ').trim();
    const key = sectionMap[currentSection];
    if (key) {
      if (key === 'follow_up_months') {
        const num = parseInt(val);
        result[key] = isNaN(num) ? 12 : num;
      } else if (key === 'risk') {
        const words = val.split(/\s+/);
        result[key] = words[words.length - 1].toLowerCase();
      } else {
        result[key] = val;
      }
    }
  }

  // Capitalize risk level
  if (result.risk) {
    result.risk = result.risk.charAt(0).toUpperCase() + result.risk.slice(1);
  }

  return result;
}

// --- Server ---
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API endpoint
  if (pathname === '/api/predict' && req.method === 'POST') {
    try {
      const input = await parseBody(req);
      const result = await runPrediction(input);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  // Basic path traversal protection
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`SafePulse Web UI running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
});
