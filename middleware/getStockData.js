const getStockData = (req, res, next) => {
  let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.query.stock}&apikey=${alphaVantageAPIKEY}`;
  console.log(url);
  fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      res.locals.stockData = {
        'stock': jsonData['Global Quote']["01. symbol"], 
        'price': jsonData['Global Quote']['05. price']
      }
  }); 
  next();
}

module.exports = getStockData;