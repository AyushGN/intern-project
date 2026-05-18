const testApi = async () => {
  const baseUrl = 'http://localhost:5000/api';
  
  // 1. Register a test user
  const email = `test_farmer_${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log('Registering test user...');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Test Farmer', role: 'FARMER' })
  });
  
  const regData = await regRes.json();
  if (!regRes.ok) {
    console.error('Registration failed:', regData);
    return;
  }
  console.log('Registration success:', regData.user.email);
  
  const token = regData.token;
  
  // 2. Get Profile
  console.log('\nFetching profile...');
  const getRes = await fetch(`${baseUrl}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getData = await getRes.json();
  console.log('Profile Data:', getData);
  
  // 3. Update Profile
  console.log('\nUpdating profile...');
  const updateRes = await fetch(`${baseUrl}/users/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      location: '123 Farm Road',
      store_name: 'Test Fresh Farm',
      avatar_url: 'https://example.com/avatar.jpg'
    })
  });
  const updateData = await updateRes.json();
  console.log('Update Result:', updateData);
};

testApi().catch(console.error);
