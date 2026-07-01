const express = require('express');
const app = express();

// Stripe setup using your Railway Environment Variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET;

// Webhook endpoint
// We use express.raw to ensure the body remains a Buffer for signature verification
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the synchronous authorization request from Stripe
  if (event.type === 'issuing_authorization.request') {
    const authorization = event.data.object;
    console.log("Checking authorization for amount:", authorization.amount);

    // --- APPROVAL LOGIC ---
    // Note: Stripe amounts are in cents (e.g., 5000 = $50.00)
    if (authorization.amount < 5000) {
      console.log("Result: Approving transaction.");
      return res.json({ approved: true });
    } else {
      console.log("Result: Declining transaction (Amount too high).");
      return res.json({ approved: false });
    }
  }

  // Acknowledge other event types (like pings)
  res.json({ received: true });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
