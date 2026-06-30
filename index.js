const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Stripe webhooks require the raw body to verify the signature
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    console.log("Stripe is knocking!");
    // Your logic will go here later
    res.status(200).json({ received: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
