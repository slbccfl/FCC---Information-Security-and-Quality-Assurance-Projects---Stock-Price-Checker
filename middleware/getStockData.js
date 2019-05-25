
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

const getLikes = (stockSym, next) => {
  return new Promise((resolve, reject) => {
    try {
      var likes = 0;
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        const collection = db.collection("stocks");
        collection.find({symbol: stockSym}).toArray((err, result) => {
          console.log('result: ' + JSON.stringify(result))
          if (result.length === 0) {
            likes = 0; 
          } else {
            likes = result[0].likes;
          };
          resolve(likes)
        });
      });
    } catch (err) { 
      next(err)
    }
  });
}

const getStockData = async (req, res, next) => {
  try {
    let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.query.stock}&apikey=${alphaVantageAPIKEY}`;
    // console.log(`url: ${url}`);
    let response = await fetch(url)
    let jsonData = await response.json()
    console.log(`jsonData: ${JSON.stringify(jsonData)}`);
    var stockSym = jsonData['Global Quote']["01. symbol"];
    let likes = await getLikes(stockSym, next)
    console.log('returned likes: ' + likes)
    res.locals.stockData = {
      'stock': stockSym,
      'price': jsonData['Global Quote']['05. price'],
      'likes': likes
    }
    next();
  }
  catch (err){
    next(err);
  }
}


module.exports = getStockData;