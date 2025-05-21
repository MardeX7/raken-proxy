const express = require('express' );
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Krakenin API-avaimet ympäristömuuttujista
const API_KEY = process.env.KRAKEN_API_KEY;
const API_SECRET = process.env.KRAKEN_API_SECRET;

// Tervetulosivu
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Kraken API -välipalvelin on toiminnassa'
  });
});

// Julkinen API: Palvelimen aika
app.get('/api/time', async (req, res) => {
  try {
    const response = await axios.get('https://api.kraken.com/0/public/Time' );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yksityinen API: Tilin saldo
app.get('/api/balance', async (req, res) => {
  try {
    const endpoint = '/0/private/Balance';
    const nonce = Date.now().toString();
    
    // Luo allekirjoitus
    const signature = createSignature(endpoint, nonce, `nonce=${nonce}`);
    
    // Tee API-kutsu
    const response = await axios.post('https://api.kraken.com' + endpoint, `nonce=${nonce}`, {
      headers: {
        'API-Key': API_KEY,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    } );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Funktio API-kutsun allekirjoituksen luomiseen
function createSignature(endpoint, nonce, postData) {
  // Luo SHA256-tiiviste
  const message = nonce + postData;
  const sha256 = crypto.createHash('sha256').update(message).digest();
  
  // Yhdistä endpoint ja SHA256-tiiviste
  const secret = Buffer.from(API_SECRET, 'base64');
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(endpoint + sha256);
  
  // Palauta Base64-muodossa
  return hmac.digest('base64');
}

// Käynnistä palvelin
app.listen(port, () => {
  console.log(`Palvelin käynnissä portissa ${port}`);
});

// Vercel serverless function export
module.exports = app;
