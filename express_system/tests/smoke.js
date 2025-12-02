const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

const apiKey = process.env.API_KEY || 'dev-only-api-key';

async function run() {
  User.reset();

  const healthWithoutKey = await request(app).get('/health');
  console.log('Health without API key ->', healthWithoutKey.status);

  const health = await request(app)
    .get('/health')
    .set('x-api-key', apiKey);
  console.log('Health with API key ->', health.status, health.body);

  const registration = await request(app)
    .post('/api/auth/register')
    .set('x-api-key', apiKey)
    .send({ username: 'ali', password: 'StrongPass!23', firstname: 'Ali', lastname: 'Reza' });
  console.log('Registration ->', registration.status, registration.body.success);

  const login = await request(app)
    .post('/api/auth/login')
    .set('x-api-key', apiKey)
    .send({ username: 'ali', password: 'StrongPass!23' });
  console.log('Login ->', login.status, login.body.success);

  const token = login.body?.data?.accessToken;
  if (!token) {
    throw new Error('Missing access token from login response');
  }

  const invalidProfile = await request(app)
    .post('/api/users')
    .set('x-api-key', apiKey)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: '', age: -2 });
  console.log('Invalid profile ->', invalidProfile.status, invalidProfile.body.error?.details);

  const validProfile = await request(app)
    .post('/api/users')
    .set('x-api-key', apiKey)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Ali Reza', age: 25 });
  console.log('Valid profile ->', validProfile.status, validProfile.body.data);

  const listProfiles = await request(app)
    .get('/api/users')
    .set('x-api-key', apiKey)
    .set('Authorization', `Bearer ${token}`);
  console.log('List profiles ->', listProfiles.status, listProfiles.body.data);
}

run()
  .then(() => {
    console.log('Smoke tests completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Smoke tests failed:', error);
    process.exit(1);
  });
