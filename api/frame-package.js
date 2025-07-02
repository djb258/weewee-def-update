import framePackageData from '../frame_phase_package.json';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json');
  
  // Return the frame phase package
  res.status(200).json({
    status: 200,
    data: framePackageData,
    timestamp: new Date().toISOString(),
    source: 'weewee-def-update-system',
    phase: 'Frame',
    validation: {
      schema_version: 'frame-v1.0',
      validated: true,
      timestamp: new Date().toISOString()
    }
  });
} 