import gbtDoctrineData from '../gbt_doctrine.json';

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
  
  // Return the GBT doctrine data
  res.status(200).json({
    status: 200,
    data: gbtDoctrineData,
    timestamp: new Date().toISOString(),
    source: 'weewee-def-update-system',
    total_schemas: gbtDoctrineData.metadata.total_schemas,
    framework: gbtDoctrineData.metadata.framework
  });
} 