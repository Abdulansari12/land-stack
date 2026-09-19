const http = require('http');

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('--- Running Impact Stats Counter Verification ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('✓ PASS:', message);
      passed++;
    } else {
      console.error('✗ FAIL:', message);
      failed++;
    }
  }

  try {
    // 1. Welcome Page Impact Counter Section
    const welcomeRes = await fetchUrl('/welcome');
    assert(welcomeRes.status === 200, 'Welcome page returns HTTP 200');
    assert(welcomeRes.body.includes('welcome-impact-stats-section'), 'welcome-impact-stats-section data-testid present');
    assert(welcomeRes.body.includes('Parcels Digitized'), 'Metric 1: Parcels Digitized rendered');
    assert(welcomeRes.body.includes('Disputes Resolved'), 'Metric 2: Disputes Resolved rendered');
    assert(welcomeRes.body.includes('Avg. Mutation Time Reduced'), 'Metric 3: Avg. Mutation Time Reduced rendered');
    assert(welcomeRes.body.includes('Departments Integrated'), 'Metric 4: Departments Integrated rendered');

    // 2. Dashboard Collapsible Strip
    const homeRes = await fetchUrl('/');
    assert(homeRes.status === 200, 'Dashboard page returns HTTP 200');
    assert(homeRes.body.includes('dashboard-impact-strip'), 'dashboard-impact-strip data-testid present');

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

runVerification();
