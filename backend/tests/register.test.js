// Registration must never leak a password hash, must signal failure via
// status code (not a 200 the frontend has to inspect), and must reject a
// duplicate account with 409. See REVIEW.md item 3.
const request = require('supertest');
const app = require('../app');

describe('POST /api/user/register', () => {
  it('creates an account and never returns the password', async () => {
    const res = await request(app).post('/api/user/register').send({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.user.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/password123|\$2[aby]\$/); // no raw or hashed password anywhere in the body
  });

  it('rejects a registration missing required fields with 400', async () => {
    const res = await request(app).post('/api/user/register').send({ email: 'incomplete@example.com' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email with 409, not a silent 200', async () => {
    await request(app).post('/api/user/register').send({
      name: 'First',
      email: 'dupe@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/user/register').send({
      name: 'Second',
      email: 'dupe@example.com',
      password: 'password456',
    });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/user/users (admin listing)', () => {
  it('never includes a password field for any user', async () => {
    const { createAdmin } = require('./helpers');
    const { token } = await createAdmin();
    await request(app).post('/api/user/register').send({
      name: 'Someone',
      email: 'someone@example.com',
      password: 'password123',
    });

    const res = await request(app).get('/api/user/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toMatch(/password123|\$2[aby]\$/);
  });
});
