const http = require('http');

function postRequest(path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function test() {
  console.log('--- Testing Export ---');
  const exportRes = await postRequest('/api/export', { 'Content-Type': 'application/json' }, JSON.stringify({ format: 'json' }));
  console.log('Export Status:', exportRes.status);
  const parsedExport = JSON.parse(exportRes.data);
  console.log('Exported User:', parsedExport.profile.fullName);
  console.log('Exported Body Metrics count:', parsedExport.timeSeries.bodyMetrics.length);
  console.log('Exported Lab Results count:', parsedExport.timeSeries.labResults.length);
  console.log('Exported Audit Trail count:', parsedExport.auditTrail.length);
}

test().catch(console.error);
