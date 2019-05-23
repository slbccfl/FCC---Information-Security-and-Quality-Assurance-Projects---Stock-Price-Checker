
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

function getLikesPromise(stockSym, next) {      
  var likes = 0;
  try {
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      const collection = db.collection("stocks");
      var getLikes = () => {
        return new Promise((resolve, reject) => {
          collection.find({symbol: stockSym}).toArray((err, result) => {
            console.log('result: ' + JSON.stringify(result))
            if (result.length === 0) {
              likes = 0; 
            } else {
              likes = result[0].likes;
              console.log('likes 1: ' + likes)
            };
            err 
              ? reject(err) 
              : resolve(likes);
          });
        });
      };
      return getLikes;
      // var callMyPromise = async () => {
      //   return await findLikesPromise()
      // }
    
    }); 
  } catch (err) {
    next(err)
  }
}

const getStockData = (req, res, next) => {
  try {
    let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.query.stock}&apikey=${alphaVantageAPIKEY}`;
    // console.log(`url: ${url}`);
    fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(jsonData => {
        // console.log(`jsonData: ${JSON.stringify(jsonData)}`);
        var stockSym = jsonData['Global Quote']["01. symbol"];
        var getLikes = getLikesPromise(stockSym, next);
        getLikes(stockSym, next).then((stockLikes) => {
          console.log('getLikes return: ' + stockLikes)
          
        })
        res.locals.stockData = {
          'stock': stockSym,
          'price': jsonData['Global Quote']['05. price']
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