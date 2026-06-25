const PROD_URL = 'https://routenest-production.up.railway.app';

async function seedOldReview() {
  const oldReview = { 
    route: 'Jaipur to Delhi', 
    journeyId: 'JRN-OLD-1', 
    text: 'This was a decent trip, but the highway was a bit rough in some patches. Overall okay, would recommend starting early morning.', 
    rating: 3, 
    completedJourney: true 
  };

  try {
    // 1. Create a user
    const num = Math.floor(Math.random() * 1000000);
    const email = `olduser${num}@example.com`;
    console.log('Registering user...');
    const regRes = await fetch(PROD_URL + '/api/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Time Traveler', email, password: 'password123' })
    });
    const regData = await regRes.json();
    const token = regData.token;
    const userId = regData.user.id;

    // Verify user
    console.log('Verifying user...');
    await fetch(PROD_URL + `/api/profiles/${userId}/verify`, {
      method: 'POST', headers: {'Authorization': 'Bearer ' + token}
    });

    // 2. Post review
    console.log('Posting review...');
    const revRes = await fetch(PROD_URL + '/api/reviews', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify(oldReview)
    });
    const revData = await revRes.json();
    console.log('Posted review ID:', revData.id);

    // 3. Hack the review creation date in the database to be 25 hours ago
    console.log('Hacking the creation date to 25 hours ago...');
    // I can't do this directly over the API because there's no endpoint to change createdAt.
    // Wait, the API only allows standard posts.
    
    // I need to use an internal script on the Railway server, OR just modify the local `store.js` and push it, but we are doing this live.
    // Oh, Railway doesn't let me run local code against its file system. 
  } catch(err) {
    console.error(err);
  }
}
seedOldReview();
