const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());

const URL = 'http://20.244.56.144/evaluation-service/auth';
let Token = '';

const Info ={
    email: "ramkrishna@abc.edu",
    name: "ram krishna",
    rollNo: "aa1bb",
    accessCode: "SwuuKE",
    clientID: "d9cbb699-6a27-44a5-8d59-8b1befa816da",
    clientSecret: "tVJaaaRBSeXcRXeM"
};

async function getToken() {
    if(!Token){
        const res = await axios.post(`${URL}/auth`,Info);
        Token = res.data.access_token;

    }
    return Token;
}

app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const minutes = req.query.minutes;
  const token = await getToken();
  const url = `${BASE_URL}/stocks/${ticker}${minutes ? `?minutes=${minutes}` : ''}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  res.json(response.data);
});

app.get('/stocks/:ticker/aggregate', async (req, res) => {
  const { ticker } = req.params;
  const minutes = req.query.minutes;
  const token = await getToken();
  const url = `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token} `}
  });
  const history = response.data;
  const prices = history.map(h => h.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  res.json({ averageStockPrice: avg, priceHistory: history });
});

app.get('/stockcorrelation', async (req, res) => {
  const { ticker: tickers, minutes } = req.query;
  if (!Array.isArray(tickers) || tickers.length !== 2) return res.status(400).send('Two tickers required');

  const token = await getToken();
  const responses = await Promise.all(
    tickers.map(t => axios.get(`${BASE_URL}/stocks/${t}?minutes=${minutes}`, {
      headers: { Authorization: `Bearer ${token}` }
    }))
  );

  const [X, Y] = responses.map(r => r.data.map(p => p.price));
  const avgX = X.reduce((a, b) => a + b) / X.length;
  const avgY = Y.reduce((a, b) => a + b) / Y.length;
  const cov = X.reduce((sum, xi, i) => sum + (xi - avgX) * (Y[i] - avgY), 0) / (X.length - 1);
  const stdX = Math.sqrt(X.reduce((sum, xi) => sum + (xi - avgX) ** 2, 0) / (X.length - 1));
  const stdY = Math.sqrt(Y.reduce((sum, yi) => sum + (yi - avgY) ** 2, 0) / (Y.length - 1));
  const correlation = cov / (stdX * stdY);

  res.json({
    correlation,
    stocks: {
      [tickers[0]]: { averagePrice: avgX, priceHistory: responses[0].data },
      [tickers[1]]: { averagePrice: avgY, priceHistory: responses[1].data }
    }
  });
});

app.listen(5000, () => console.log('Server running on localhost:5000'));
