const PROD_URL = 'https://routenest-production.up.railway.app';

async function seedHiddenReview() {
  const badReview = { 
    route: 'Mumbai to Pune', 
    journeyId: 'JRN-99999', 
    text: 'This is a terrible route, very bad experience. I hate it so much. DO NOT GO HERE!', 
    rating: 1, 
    completedJourney: true 
  };

  try {
    // 1. Create a bad user
    const num = Math.floor(Math.random() * 1000000);
    const email = `baduser${num}@example.com`;
    console.log('Registering bad user...');
    const regRes = await fetch(PROD_URL + '/api/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Angry Traveler', email, password: 'password123' })
    });
    const regData = await regRes.json();
    const token = regData.token;
    const userId = regData.user.id;

    // Verify bad user
    console.log('Verifying bad user...');
    await fetch(PROD_URL + `/api/profiles/${userId}/verify`, {
      method: 'POST', headers: {'Authorization': 'Bearer ' + token}
    });

    // 2. Post 1-star review
    console.log('Posting 1-star review...');
    const revRes = await fetch(PROD_URL + '/api/reviews', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify(badReview)
    });
    const revData = await revRes.json();
    console.log('Posted review ID:', revData.id);
    const reviewId = revData.id;

    // 3. Report the review 3 times so it gets hidden
    console.log('Reporting review 3 times...');
    for(let i=0; i<3; i++) {
        const reportRes = await fetch(PROD_URL + `/api/reviews/${reviewId}/report`, {
            method: 'POST', headers: {'Authorization': 'Bearer ' + token}
        });
        console.log(`Report ${i+1}:`, reportRes.status);
    }
    
    console.log('Done! The 1-star review should now be hidden and NOT affect the average rating.');
  } catch(err) {
    console.error(err);
  }
}
seedHiddenReview();
