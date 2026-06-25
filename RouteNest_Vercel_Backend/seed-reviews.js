const PROD_URL = 'https://routenest-production.up.railway.app';

async function seedReviews() {
  const dummyReviews = [
    { route: 'Mumbai to Pune', journeyId: 'JRN-12345', text: 'This route is amazing during the monsoons. The view of the ghats is breathtaking, just make sure to drive carefully because it gets slippery.', rating: 5, completedJourney: true }
  ];

  try {
    // 1. Create the reviewer user
    const num = Math.floor(Math.random() * 1000000);
    const email = `reviewer${num}@example.com`;
    console.log('Registering reviewer...');
    const regRes = await fetch(PROD_URL + '/api/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Expert Traveler', email, password: 'password123' })
    });
    const regData = await regRes.json();
    const token = regData.token;
    const reviewerId = regData.user.id;

    // Verify reviewer
    console.log('Verifying reviewer...');
    await fetch(PROD_URL + `/api/profiles/${reviewerId}/verify`, {
      method: 'POST', headers: {'Authorization': 'Bearer ' + token}
    });

    // 2. Post reviews
    const reviewIds = [];
    for (let r of dummyReviews) {
      console.log('Posting review...');
      const revRes = await fetch(PROD_URL + '/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
        body: JSON.stringify(r)
      });
      const revData = await revRes.json();
      console.log('Posted review:', revData.id);
      reviewIds.push(revData.id);
    }

    // 3. Create 5 voters to upvote the review (threshold is 5)
    const reviewId = reviewIds[0];
    for(let i=0; i<5; i++) {
        const voterEmail = `voter${num}_${i}@example.com`;
        const regVoter = await fetch(PROD_URL + '/api/auth/register', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name: `Random Voter ${i}`, email: voterEmail, password: 'password123' })
        });
        const voterToken = (await regVoter.json()).token;

        const voteRes = await fetch(PROD_URL + `/api/reviews/${reviewId}/helpful`, {
            method: 'POST', headers: {'Authorization': 'Bearer ' + voterToken}
        });
        console.log(`Voter ${i} upvoted:`, voteRes.status);
    }
    
    console.log('Done! Reviewer should now be a Trusted Reviewer.');
  } catch(err) {
    console.error(err);
  }
}
seedReviews();
