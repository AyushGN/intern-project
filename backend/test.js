const testApi = async () => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'securepassword123';
  
  console.log(`\n--- 1. Testing Registration for ${email} ---`);
  
  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Test User', role: 'FARMER' })
    });
    
    const regData = await regRes.json();
    console.log('Status:', regRes.status);
    console.log('Response:', regData);
    
    if (regRes.status !== 201) throw new Error('Registration failed');
    
    console.log(`\n--- 2. Testing Login for ${email} ---`);
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    console.log('Status:', loginRes.status);
    console.log('Response:', loginData);

    if (loginRes.status !== 200 || !loginData.token) throw new Error('Login failed');

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testApi();
