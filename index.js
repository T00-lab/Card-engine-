const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const endpointSecret = process.env.WEBHOOK_SECRET;

// IMPORTANT: express.raw is needed for Stripe to verify the signature
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be a Buffer for constructEvent to work
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the authorization request
  if (event.type === 'issuing_authorization.request') {
    const authorization = event.data.object;
    console.log("Checking authorization for amount:", authorization.amount);

    if (authorization.amount > 5000) {
      console.log("Declining: Amount too high.");
    } else {
      console.log("Approving: Transaction valid.");
    }
  }

  res.json({received: true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
