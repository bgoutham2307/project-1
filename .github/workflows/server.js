const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./src/routes/auth');
const listingsRouter = require('./src/routes/listings');
const bookingsRouter = require('./src/routes/bookings');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'go-rent-api' }));

// Serve the frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Go Rent API + frontend running at http://localhost:${PORT}`);
});
