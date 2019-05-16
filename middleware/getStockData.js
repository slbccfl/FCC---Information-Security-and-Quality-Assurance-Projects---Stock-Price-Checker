
const fetch       = require("node-fetch");
const alphaVantageAPIKEY = process.env.APIKEY;
const MongoClient = require('mongodb');
const MONGODB_CONNECTION_STRING = process.env.DB;

const getStockData = (req, res, next) => {
  let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.query.stock}&apikey=${alphaVantageAPIKEY}`;
  console.log(`url: ${url}`);
  fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      console.log(`jsonData: ${JSON.stringify(jsonData)}`);
      res.locals.stockData = {
        'stock': jsonData['Global Quote']["01. symbol"], 
        'price': jsonData['Global Quote']['05. price'],
        'likes': 1
      }
      console.log(`res.locals.stockData: ${JSON.stringify(res.locals.stockData)}`);
      next();
  }); 
}

module.exports = getStockData;