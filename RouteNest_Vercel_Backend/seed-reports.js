const http = require('http');

const req = (path, method, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {}
    };
    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(`Error ${res.statusCode}: ${body}`);
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

(async () => {
  try {
    console.log('Fetching posts...');
    const postsRes = await req('/api/community', 'GET', null);
    const posts = Array.isArray(postsRes) ? postsRes : (postsRes.posts || []);
    
    console.log(`Found ${posts.length} posts`);
    if (posts.length < 3) {
      console.log('Not enough posts to report!');
      return;
    }

    // Register a dummy user to do the reporting
    const email = `reporter_${Date.now()}@example.com`;
    const regRes = await req('/api/auth/register', 'POST', { name: 'Safety Officer', email, password: 'password123' });
    const token = regRes.token;

    console.log('Reporting 3 posts for the Admin Dashboard...');
    
    // Report 1: Spam
    await req(`/api/community/${posts[0].id}/report`, 'POST', { reason: 'spam' }, token);
    
    // Report 2: Harassment
    await req(`/api/community/${posts[1].id}/report`, 'POST', { reason: 'harassment' }, token);
    
    // Report 3: Inappropriate
    await req(`/api/community/${posts[2].id}/report`, 'POST', { reason: 'inappropriate' }, token);

    console.log('Reports seeded successfully! Admin page is no longer empty.');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
})();
