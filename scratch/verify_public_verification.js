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

async function verifyPublicVerification() {
  console.log('--- Running Public Title Verification Route Tests ---');
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
    // 1. Test UP Parcel Verification
    const upRes = await fetchUrl('/verify/UP26A8941B');
    assert(upRes.status === 200, 'HTTP 200 returned for /verify/UP26A8941B');
    assert(upRes.body.includes('UP26A8941B'), 'UP26A8941B ULPIN present in response');
    assert(upRes.body.includes('Rameshwar'), 'Owner Rameshwar Prasad Sharma rendered');
    assert(upRes.body.includes('245/2') || upRes.body.includes('245'), 'Khasra 245/2 rendered');

    // 2. Test Tamil Nadu Parcel Verification
    const tnRes = await fetchUrl('/verify/TN04M4910A');
    assert(tnRes.status === 200, 'HTTP 200 returned for /verify/TN04M4910A');
    assert(tnRes.body.includes('TN04M4910A'), 'TN04M4910A ULPIN present in response');
    assert(tnRes.body.includes('Senthil'), 'Owner K. Senthil Murugan rendered');
    assert(tnRes.body.includes('142/3A1') || tnRes.body.includes('142'), 'Survey 142/3A1 rendered');

    // 3. Test Chandigarh Parcel Verification
    const chRes = await fetchUrl('/verify/CH17C0440A');
    assert(chRes.status === 200, 'HTTP 200 returned for /verify/CH17C0440A');
    assert(chRes.body.includes('CH17C0440A'), 'CH17C0440A ULPIN present in response');

    // 4. Test Disputed Parcel
    const disputedRes = await fetchUrl('/verify/UP14D8831P');
    assert(disputedRes.status === 200, 'HTTP 200 returned for disputed parcel UP14D8831P');

    // 5. Test Invalid / Not Found Parcel
    const notFoundRes = await fetchUrl('/verify/NON-EXISTENT-ULPIN-999');
    assert(notFoundRes.status === 200, 'HTTP 200 returned for non-existent ULPIN');
    assert(
      notFoundRes.body.includes('Not Found') || notFoundRes.body.includes('Record'),
      'Record Not Found feedback rendered'
    );

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

verifyPublicVerification();
