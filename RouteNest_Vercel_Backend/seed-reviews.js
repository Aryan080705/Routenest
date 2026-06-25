const https = require('https');

const dummyUsers = [
  { name: 'Rahul Sharma', route: 'Delhi to Manali', text: 'This route was absolutely amazing. The OSRM planner helped me navigate perfectly, highly recommended for road trips!' },
  { name: 'Priya Patel', route: 'Mumbai to Goa', text: 'Great experience overall. The community alerts saved me from a major traffic jam near Pune. Will use RouteNest again!' },
  { name: 'Amit Kumar', route: 'Bangalore to Coorg', text: 'I loved the verified community feature. Knowing that other travelers recently went on this route gave me a lot of confidence.' },
  { name: 'Neha Gupta', route: 'Jaipur to Udaipur', text: 'The smart notifications are a lifesaver. Kept me updated about weather conditions. Very smooth journey.' },
  { name: 'Vikram Singh', route: 'Chennai to Pondicherry', text: 'Nice and easy to use app. The road was well mapped out. I just wish there were more food stops marked.' },
  { name: 'Anjali Desai', route: 'Hyderabad to Hampi', text: 'Absolutely fantastic trip. The reviews and forums helped me plan my itinerary perfectly. Great community!' },
  { name: 'Rohan Mehta', route: 'Kolkata to Darjeeling', text: 'A bit of a bumpy ride, but the app navigated me through the safest paths. Thumbs up for the live route planner.' },
  { name: 'Kavita Reddy', route: 'Pune to Mahabaleshwar', text: 'Saved my weekend trip! Real-time alerts are extremely accurate. Best travel app I have used so far.' },
  { name: 'Sanjay Verma', route: 'Chandigarh to Shimla', text: 'Very helpful community. People are active and the route suggestions are top notch. Had a great family trip.' },
  { name: 'Pooja Iyer', route: 'Kochi to Munnar', text: 'The scenery was beautiful and the navigation was flawless. I highly recommend this app to anyone taking a road trip in India.' },
  { name: 'Aditya Joshi', route: 'Ahmedabad to Mount Abu', text: 'Good experience, the app works very smoothly. I left a few alerts on the way to help others too.' },
  { name: 'Sneha Rao', route: 'Dehradun to Mussoorie', text: 'Perfect companion for our short trip. We avoided all the bad roads thanks to the active community members.' }
];

const req = (path, method, data, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'routenest-production.up.railway.app',
      port: 443,
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

    const req = https.request(options, (res) => {
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
  for (let i = 0; i < dummyUsers.length; i++) {
    const u = dummyUsers[i];
    const email = `dummy${i}_${Date.now()}@example.com`;
    const password = 'password123';
    
    try {
      // Register
      console.log(`Registering ${u.name}...`);
      const regRes = await req('/api/auth/register', 'POST', { name: u.name, email, password });
      const token = regRes.token;

      // Post Review
      console.log(`Posting review for ${u.name}...`);
      const reviewPayload = {
        route: u.route,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        text: u.text,
        completedJourney: true,
        journeyId: `journey_${Date.now()}_${i}`
      };
      await req('/api/reviews', 'POST', reviewPayload, token);
      console.log(`Successfully added review for ${u.name}.`);
    } catch (err) {
      console.error(`Failed for ${u.name}:`, err);
    }
  }
  console.log('Seeding complete!');
})();
