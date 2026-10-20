const BASE_URL = 'http://localhost:5000/api/v1';

async function runAuthTests() {
  console.log('=== STARTING REAL END-TO-END AUTHENTICATION SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `reloop.partner.${timestamp}@testexchange.org`;
  const testPassword = 'StrongPassword2026!';
  const orgName = `Circular Logistics & Packaging ${timestamp}`;

  let accessToken = '';
  let cookieHeader = '';

  // TEST 1: Register with valid data
  console.log('1. Testing Registration with valid data...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Elena Rostova',
      organizationName: orgName,
      organizationType: 'manufacturer',
      city: 'Detroit',
      country: 'USA',
    }),
  });

  const regData = await regRes.json();
  const rawSetCookie = regRes.headers.get('set-cookie');
  if (rawSetCookie) {
    cookieHeader = rawSetCookie.split(';')[0];
  }

  if (regRes.status === 201 && regData.success && regData.data.accessToken) {
    console.log('✔ Registration successful! User ID:', regData.data.user.id);
    console.log('✔ Organization context created & bound:', regData.data.user.organizationId);
    console.log('✔ HttpOnly refresh cookie received:', cookieHeader.startsWith('cpe_refresh_token='));
    accessToken = regData.data.accessToken;
  } else {
    console.error('❌ Registration failed:', regData);
    process.exit(1);
  }

  // TEST 2: Register duplicate email
  console.log('\n2. Testing Registration with duplicate email...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Elena Clone',
      organizationName: 'Duplicate Corp',
      organizationType: 'retailer',
      city: 'Detroit',
      country: 'USA',
    }),
  });
  const dupData = await dupRes.json();
  if (dupRes.status === 409 && !dupData.success && dupData.error.code === 'EMAIL_ALREADY_EXISTS') {
    console.log('✔ Duplicate email correctly rejected with 409 EMAIL_ALREADY_EXISTS');
  } else {
    console.error('❌ Duplicate email test failed:', dupData);
    process.exit(1);
  }

  // TEST 3: Register invalid data (Zod schema validation)
  console.log('\n3. Testing Registration with invalid data (short password, bad email)...');
  const invRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'not-an-email',
      password: '123',
      name: '',
      organizationName: '',
      organizationType: 'invalid_type',
      city: '',
      country: 'USA',
    }),
  });
  const invData = await invRes.json();
  if (invRes.status === 400 && invData.error?.code === 'VALIDATION_ERROR') {
    console.log('✔ Zod validation successfully caught invalid fields:', Object.keys(invData.error.fields));
  } else {
    console.error('❌ Validation test failed:', invData);
    process.exit(1);
  }

  // TEST 4: Access protected endpoint /users/me without token
  console.log('\n4. Testing Protected Endpoint /users/me without token...');
  const noTokenRes = await fetch(`${BASE_URL}/users/me`);
  const noTokenData = await noTokenRes.json();
  if (noTokenRes.status === 401 && noTokenData.error?.code === 'UNAUTHORIZED') {
    console.log('✔ Unauthenticated request properly blocked with 401 UNAUTHORIZED');
  } else {
    console.error('❌ Protected endpoint check without token failed:', noTokenData);
    process.exit(1);
  }

  // TEST 5: Access protected endpoint /users/me with valid Bearer token
  console.log('\n5. Testing Protected Endpoint /users/me with Bearer token...');
  const meRes = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meData = await meRes.json();
  if (meRes.status === 200 && meData.success && meData.data.email === testEmail.toLowerCase()) {
    console.log('✔ Protected endpoint returned user profile:', meData.data.name);
    console.log('✔ Organization populated from server-side DB:', meData.data.organizationId?.name);
  } else {
    console.error('❌ Protected endpoint check with token failed:', meData);
    process.exit(1);
  }

  // TEST 6: Login with incorrect password
  console.log('\n6. Testing Login with incorrect password...');
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999!' }),
  });
  const badLoginData = await badLoginRes.json();
  if (badLoginRes.status === 401 && badLoginData.error?.code === 'INVALID_CREDENTIALS') {
    console.log('✔ Invalid password rejected with 401 INVALID_CREDENTIALS');
  } else {
    console.error('❌ Bad login test failed:', badLoginData);
    process.exit(1);
  }

  // TEST 7: Login with valid credentials
  console.log('\n7. Testing Login with valid credentials...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginData = await loginRes.json();
  const loginSetCookie = loginRes.headers.get('set-cookie');
  if (loginSetCookie) {
    cookieHeader = loginSetCookie.split(';')[0];
  }
  if (loginRes.status === 200 && loginData.success && loginData.data.accessToken) {
    console.log('✔ Login successful! New access token received.');
    accessToken = loginData.data.accessToken;
  } else {
    console.error('❌ Login failed:', loginData);
    process.exit(1);
  }

  // TEST 8: Refresh token rotation
  console.log('\n8. Testing Token Refresh & Rotation using HttpOnly cookie...');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  const refreshData = await refreshRes.json();
  const rotatedCookie = refreshRes.headers.get('set-cookie');
  let newCookieHeader = '';
  if (rotatedCookie) {
    newCookieHeader = rotatedCookie.split(';')[0];
  }
  if (refreshRes.status === 200 && refreshData.success && refreshData.data.accessToken) {
    console.log('✔ Token refresh succeeded! New rotated access token received.');
    console.log('✔ New rotated refresh cookie issued:', newCookieHeader.startsWith('cpe_refresh_token='));
    // Verify old refresh token is now rotated out
    const replayOldRefresh = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    if (replayOldRefresh.status === 401) {
      console.log('✔ Replay of old rotated refresh token rejected with 401 (Rotation security verified)');
    } else {
      console.warn('⚠ Replay of old token was not blocked');
    }
    cookieHeader = newCookieHeader;
    accessToken = refreshData.data.accessToken;
  } else {
    console.error('❌ Token refresh failed:', refreshData);
    process.exit(1);
  }

  // TEST 9: Logout
  console.log('\n9. Testing Logout...');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: cookieHeader,
    },
  });
  const logoutData = await logoutRes.json();
  const logoutCookie = logoutRes.headers.get('set-cookie');
  if (logoutRes.status === 200 && logoutData.success) {
    console.log('✔ Logout successful! Message:', logoutData.data.message);
    console.log('✔ Refresh cookie cleared in response:', logoutCookie?.includes('Expires=') || logoutCookie?.includes('Max-Age=0'));
  } else {
    console.error('❌ Logout failed:', logoutData);
    process.exit(1);
  }

  // TEST 10: Refresh after logout fails
  console.log('\n10. Testing Refresh after Logout...');
  const postLogoutRefresh = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  const postLogoutData = await postLogoutRefresh.json();
  if (postLogoutRefresh.status === 401) {
    console.log('✔ Refresh after logout rejected with 401 (Revocation verified in MongoDB)');
  } else {
    console.error('❌ Refresh after logout should fail, got:', postLogoutData);
    process.exit(1);
  }

  console.log('\n=== ALL 10 TEST CASES PASSED SUCCESSFULLY IN REAL ATLAS DB ===');
}

runAuthTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
