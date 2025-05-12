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



app.get('/stockcorrelation', async (req, res) => {
  const { ticker: tickers, minutes } = req.query;
  if (!Array.isArray(tickers) || tickers.length !== 2) return res.status(400).send('Two tickers required');

  const token = await getToken();
  const responses = await Promise.all(
    tickers.map(t => axios.get(`${BASE_URL}/stocks/${t}?minutes=${minutes}`, {
      headers: { Authorization: `Bearer ${token}` }
    }))
  );

  res.json({
    correlation,
    stocks: {
      [tickers[0]]: { averagePrice: avgX, priceHistory: responses[0].data },
      [tickers[1]]: { averagePrice: avgY, priceHistory: responses[1].data }
    }
  });
});

app.listen(5000, () => console.log('Server running on localhost:5000'));
