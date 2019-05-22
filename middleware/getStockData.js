
const fetch       = require("node-fetch");
const alphaVantageAPIKEY = process.env.APIKEY;
const MongoClient = require('mongodb');
const MONGODB_CONNECTION_STRING = process.env.DB;

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw res.statusText;
    }
}

async function getStock(stockSym) {      
  var likes = 0;
  await MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
    const collection = db.collection("stocks");
    collection.find({symbol: stockSym}).toArray((err, result) => {
      console.log(result)
      if (result.length === 0) {
        likes = 0; 
      } else {
        likes = result[0].likes;
      };
    });
  }); 
  return likes;
}

const getStockData = async (req, res, next) => {
  try {
    let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.query.stock}&apikey=${alphaVantageAPIKEY}`;
    // console.log(`url: ${url}`);
    fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(jsonData => {
        // console.log(`jsonData: ${JSON.stringify(jsonData)}`);
        var stockSym = jsonData['Global Quote']["01. symbol"];
        console.log('getStock return: ' + getStock(stockSym))
        res.locals.stockData = {
          'stock': stockSym, 
          'price': jsonData['Global Quote']['05. price'],
          'likes': getStock(stockSym)
        }
      })
        // console.log(`res.locals.stockData: ${JSON.stringify(res.locals.stockData)}`);
      .catch(err => console.log(`fetch err: ${err}`)); 
    next();
  }
  catch (err){
    next(err);
  }
}

module.exports = getStockData;