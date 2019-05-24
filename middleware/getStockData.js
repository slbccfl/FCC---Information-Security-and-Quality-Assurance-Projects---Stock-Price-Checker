
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

function getLikes(stockSym) {      
  var likes = 0;
  MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
    const collection = db.collection("stocks");
    collection.find({symbol: stockSym}).toArray((err, result) => {
      console.log('result: ' + JSON.stringify(result))
      if (result.length === 0) {
        likes = 0; 
      } else {
        likes = result[0].likes;
        console.log('likes 1: ' + likes)
      };
      console.log('likes 2: ' + likes)
      return likes
    });
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
    let likes = await getLikes(stockSym)
    console.log('returned likes: ' + likes)
    res.locals.stockData = {
      'stock': stockSym,
      'price': jsonData['Global Quote']['05. price']
    }
    next();
  }
  catch (err){
    next(err);
  }
}


module.exports = getStockData;