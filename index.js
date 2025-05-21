// Krakenin API-välipalvelin
const express = require('express');
const cors = require('cors');
const KrakenClient = require('kraken-api');
const dotenv = require('dotenv');

// Lataa ympäristömuuttujat .env-tiedostosta
dotenv.config();

// Luo Express-sovellus
const app = express();
app.use(cors());
app.use(express.json());

// Tarkista, että API-avaimet on määritetty
const API_KEY = process.env.KRAKEN_API_KEY;
const API_SECRET = process.env.KRAKEN_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('KRAKEN_API_KEY ja KRAKEN_API_SECRET täytyy määrittää .env-tiedostossa');
  process.exit(1);
}

// Luo Kraken-asiakas
const kraken = new KrakenClient(API_KEY, API_SECRET);

// Reitti terveystarkistukselle
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Kraken API -välipalvelin on toiminnassa'
  });
});

// Reitti saldon hakemiseen
app.post('/getBalance', async (req, res) => {
  try {
    const balance = await kraken.api('Balance');
    
    res.json({
      success: true,
      message: 'Saldo haettu onnistuneesti',
      data: balance.result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Virhe saldon haussa:', error);
    
    res.json({
      success: false,
      message: `Virhe saldon haussa: ${error.message}`,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// Reitti LTC:n ostamiseen
app.post('/buyLTC', async (req, res) => {
  try {
    const volume = req.body.volume || 0.01;
    
    const order = await kraken.api('AddOrder', {
      pair: 'LTCEUR',
      type: 'buy',
      ordertype: 'market',
      volume: volume.toString()
    });
    
    res.json({
      success: true,
      message: `LTC:n osto onnistui: ${volume} LTC`,
      data: order.result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Virhe LTC:n ostossa:', error);
    
    res.json({
      success: false,
      message: `Virhe LTC:n ostossa: ${error.message}`,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// Reitti LTC:n myymiseen
app.post('/sellLTC', async (req, res) => {
  try {
    const volume = req.body.volume || 0.01;
    
    const order = await kraken.api('AddOrder', {
      pair: 'LTCEUR',
      type: 'sell',
      ordertype: 'market',
      volume: volume.toString()
    });
    
    res.json({
      success: true,
      message: `LTC:n myynti onnistui: ${volume} LTC`,
      data: order.result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Virhe LTC:n myynnissä:', error);
    
    res.json({
      success: false,
      message: `Virhe LTC:n myynnissä: ${error.message}`,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// Käynnistä palvelin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});

// Vercel-tuki
module.exports = app;
