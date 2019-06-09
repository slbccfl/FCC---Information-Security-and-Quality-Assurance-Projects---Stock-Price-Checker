
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

const getLikes = (stockSym, IP, newLike, next) => {
  return new Promise((resolve, reject) => {
    try {
      var likes = 0;
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        const collection = db.collection("stocks");
        if (newLike) {
          let updateDoc = {stockSym: stockSym.toUpperCase(), IP: IP} 
          collection.update(updateDoc, updateDoc, {upsert: true})
        }
        collection.find({stockSym: stockSym.toUpperCase()}).toArray((err, result) => {
          console.log('result: ' + JSON.stringify(result))
          likes = result.length
          resolve(likes)
        });
      });
    } catch (err) { 
      next(err)
    }
  });
}

const stockAPI = (stockSym, next) => {
  return new Promise((resolve, reject) => {
    try {
      let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSym}&apikey=${alphaVantageAPIKEY}`;
      // console.log(`url: ${url}`);
      fetch(url)
        .then((response) => response.json())
        .then((jsonData) => {
          // console.log(`jsonData: ${JSON.stringify(jsonData)}`);
          var stockSym = jsonData['Global Quote']["01. symbol"];
          // let likes = await getLikes(stockSym, next)
          // console.log('returned likes: ' + likes)
          let stockData = {
            'stock': stockSym,
            'price': jsonData['Global Quote']['05. price'],
            // 'likes': likes
        }
        // console.log(`stockData: ${JSON.stringify(stockData)}`)
        resolve(stockData) 
        
      })
    }
    catch (err){
      next(err);
    }
  });
}

const getStockData = async (req, res, next) => {
  try {
    
    let stockSym = req.query.stock 
    let IP = req.connection.remoteAddress
    // console.log(`stockSym: ${stockSym}`)
    // let returnData = await stockAPI(stockSym, next)
    // console.log(`returnData: ${JSON.stringify(returnData)}`)
    // let likes = await getLikes(stockSym, next)
    // console.log(`likes: ${likes}`)
    await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, next)]).then((returnData) => {
      console.log(`returnData: ${JSON.stringify(returnData)}`)
      res.locals.stockData = returnData[0];
      res.locals.stockData.likes = returnData[1];
      // console.log(`res.locals: ${JSON.stringify(res.locals)}`)
      
    })

    next();
  }
  catch (err){
    next(err);
  }
}


module.exports = getStockData;