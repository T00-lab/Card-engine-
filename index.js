const express = require('express');
const app = express();

app.use(express.json());

// In-memory store to track daily transaction totals per card
// In a real production app, use Redis or MongoDB for this
const cardHistory = {};

app.post('/webhook', (req, res) => {
  const event = req.body;

  if (event.type === 'issuing_authorization.request') {
    const auth = event.data.object;
    const cardId = auth.card.id;
    const amount = auth.amount; // amount is in cents
    const today = new Date().toISOString().split('T')[0];

    // Initialize history for this card and day if it doesn't exist
    if (!cardHistory[cardId]) cardHistory[cardId] = { date: today, totalSpent: 0 };
    if (cardHistory[cardId].date !== today) {
      cardHistory[cardId] = { date: today, totalSpent: 0 };
    }

    console.log(`--- Processing Auth for ${cardId} ---`);
    console.log(`Amount: $${amount / 100}, Daily Total: $${cardHistory[cardId].totalSpent / 100}`);

    // RULE 1: Single transaction limit ($10,000 = 1,000,000 cents)
    if (amount > 1000000) {
      console.log("Decision: DECLINED (Transaction exceeds $10k)");
      return res.json({ approved: false });
    }

    // RULE 2: Daily transaction limit ($50,000 = 5,000,000 cents)
    if (cardHistory[cardId].totalSpent + amount > 5000000) {
      console.log("Decision: DECLINED (Exceeds $50k daily limit)");
      return res.json({ approved: false });
    }

    // Update history and Approve
    cardHistory[cardId].totalSpent += amount;
    console.log("Decision: APPROVED");
    return res.json({ approved: true });
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
