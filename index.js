const express = require('express');
const app = express();

// Use express.json() to parse the authorization request body directly
app.use(express.json());

// Stripe setup
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Authorization endpoint route
app.post('/webhook', (req, res) => {
  const event = req.body;

  console.log("------------------------------------------");
  console.log("RECEIVED EVENT TYPE:", event.type);

  // Handle the synchronous authorization request
  if (event.type === 'issuing_authorization.request') {
    const authorization = event.data.object;
    console.log("Authorization ID:", authorization.id);
    console.log("Amount requested:", authorization.amount);

    // --- YOUR APPROVAL LOGIC ---
    // Example: Approve if amount is less than $50.00 (5000 cents)
    if (authorization.amount < 5000) {
      console.log("Decision: APPROVED");
      return res.json({ approved: true });
    } else {
      console.log("Decision: DECLINED - Amount too high.");
      return res.json({ approved: false });
    }
  }

  // Handle other event types if necessary
  console.log("Received a non-authorization event.");
  res.json({ received: true });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
