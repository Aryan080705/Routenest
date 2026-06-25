const http = require('http');

const dummyPosts = [
  { name: 'Karan Malhotra', title: 'Road condition on NH48?', body: 'Does anyone know if the construction near Surat on NH48 is complete? Planning a trip to Mumbai next week.', topic: 'questions' },
  { name: 'Riya Sen', title: 'Amazing trip to Spiti Valley', body: 'Just came back from a 10 day road trip to Spiti. The roads are tough but the views are totally worth it! Make sure you carry enough fuel.', topic: 'travelogues' },
  { name: 'Tarun Bajaj', title: 'Best dhabas on Delhi-Chandigarh highway', body: 'I always stop at Amrik Sukhdev, but are there any hidden gems for parathas on this route?', topic: 'food' },
  { name: 'Simran Kaur', title: 'Fog alert: Yamuna Expressway', body: 'Heavy fog on the Yamuna Expressway this morning. Visibility is less than 50 meters. Drive slow!', topic: 'alerts' },
  { name: 'Arjun Nair', title: 'Is it safe to drive to Goa at night?', body: 'Planning to leave Pune around 8 PM. Is the Amboli ghat section safe for night driving?', topic: 'questions' },
  { name: 'Divya Sharma', title: 'Hidden waterfall near Lonavala', body: 'Found a pristine waterfall just 10km off the main highway. The trail is completely empty. Highly recommended.', topic: 'travelogues' },
  { name: 'Mohit Agarwal', title: 'Traffic jam at Peenya, Bangalore', body: 'Huge pileup at Peenya junction right now. Avoid the highway if you are heading towards Tumkur.', topic: 'alerts' },
  { name: 'Neha Singh', title: 'Car breakdown assistance needed', body: 'My car broke down near Jaipur highway. Does anyone have the number for a reliable towing service here?', topic: 'questions' },
  { name: 'Kunal Kapoor', title: 'Best route for Bangalore to Ooty', body: 'Should I take the Mysore road or the Kanakapura road? Heard Mysore road is full of diversions.', topic: 'questions' },
  { name: 'Aarti Desai', title: 'Monsoon driving tips', body: 'Always check your wiper blades and tires before a monsoon trip. The western ghats can get very slippery.', topic: 'travelogues' },
  { name: 'Varun Dhawan', title: 'Heavy rain on Mumbai-Pune Expressway', body: 'It is pouring heavily on the expressway. Traffic is moving very slowly near Lonavala.', topic: 'alerts' },
  { name: 'Megha Reddy', title: 'Must-visit cafe in Pondicherry', body: 'If you are driving to Pondi, do not miss the Coromandel Cafe. Their desserts are out of this world!', topic: 'food' }
];

const req = (path, method, data, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(`Error ${res.statusCode}: ${body}`);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

(async () => {
  for (let i = 0; i < dummyPosts.length; i++) {
    const p = dummyPosts[i];
    const email = `community${i}_${Date.now()}@example.com`;
    const password = 'password123';
    
    try {
      // Register
      console.log(`Registering ${p.name}...`);
      const regRes = await req('/api/auth/register', 'POST', { name: p.name, email, password });
      const token = regRes.token;

      // Create Post
      console.log(`Creating post for ${p.name}...`);
      const postPayload = {
        title: p.title,
        body: p.body,
        topic: p.topic
      };
      await req('/api/community', 'POST', postPayload, token);
      console.log(`Successfully added post for ${p.name}.`);
    } catch (err) {
      console.error(`Failed for ${p.name}:`, err);
    }
  }
  console.log('Community seeding complete!');
})();
