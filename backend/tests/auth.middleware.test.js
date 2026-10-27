// Unit tests for the middleware everything else depends on. Isolated from
// the real app/DB on purpose - these should fail for exactly one reason:
// the middleware's own logic, not a routing or DB issue elsewhere.
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const buildTestApp = () => {
  const app = express();
  app.get('/protected', protect, (req, res) => res.json({ ok: true, user: req.user }));
  app.get('/admin-only', protect, adminOnly, (req, res) => res.json({ ok: true }));
  return app;
};

describe('authMiddleware.protect', () => {
  const app = buildTestApp();

  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('rejects a header that is not "Bearer <token>"', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('rejects a syntactically invalid token', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ email: 'attacker@example.com', role: 'admin' }, 'wrong-secret');
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ email: 'a@example.com', role: 'user' }, process.env.SECRET_KEY, { expiresIn: -10 });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('accepts a valid token and attaches the decoded payload as req.user', async () => {
    const token = jwt.sign({ email: 'real@example.com', role: 'user' }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('real@example.com');
  });
});

describe('authMiddleware.adminOnly', () => {
  const app = buildTestApp();

  it('blocks a non-admin role with 403', async () => {
    const token = jwt.sign({ email: 'u@example.com', role: 'user' }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows the admin role through', async () => {
    const token = jwt.sign({ email: 'a@example.com', role: 'admin' }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
