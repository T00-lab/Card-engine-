const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const app = express();
const endpointSecret = process.env.WEBHOOK_SECRET;

// ... (rest of your webhook code remains the same)


app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the authorization request
  if (event.type === 'issuing_authorization.request') {
    const authorization = event.data.object;
    console.log("Checking authorization for:", authorization.amount);

    // --- YOUR LOGIC HERE ---
    // Example: If amount > 5000, decline it!
    if (authorization.amount > 5000) {
      console.log("Declining: Amount too high.");
      // In a real app, you would use the Stripe API here to decline
    } else {
      console.log("Approving: Transaction valid.");
    }
  }

  res.json({received: true});
});

app.listen(process.env.PORT || 3000, '0.0.0.0');
