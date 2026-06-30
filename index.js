const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY'); // Replace with your actual Test Secret Key
const app = express();
const endpointSecret = "whsec_YOUR_WEBHOOK_SIGNING_SECRET"; // Find this in your Stripe Webhook dashboard

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
