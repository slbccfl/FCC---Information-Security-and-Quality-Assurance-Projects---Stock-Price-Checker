
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

function getLikes(stockSym, IP, newLike, next) {
  console.log('newLike: ' + newLike);
  console.log('typeof newLike: ' + typeof newLike);
  return new Promise((resolve, reject) => {
    try {
      var likes = 0;
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        const collection = db.collection("stocks");
        console.log('newLike: ' + newLike); 
        if (newLike === true) {
          let updateDoc = {stockSym: stockSym, IP: IP} 
          console.log('updateDoc: ' + updateDoc);
          
          collection.update(updateDoc, updateDoc, {upsert: true})
        }
        collection.find({stockSym: stockSym}).toArray((err, result) => {
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

function stockAPI(stockSym, next) {
  return new Promise((resolve, reject) => {
    if (stockSym == 'GOOG') {
    // stub to avoid hitting API too much while developing
        resolve({"stock":"GOOG","price":"1097.9500"});
    } else {
      try {
        let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSym}&apikey=${alphaVantageAPIKEY}`;
        console.log(`url: ${url}`);
        fetch(url)
          .then((response) => response.json())
          .then((jsonData) => {
            console.log(`jsonData: ${JSON.stringify(jsonData)}`);
            var stockSym = jsonData['Global Quote']["01. symbol"];
            // let likes = await getLikes(stockSym, next)
            // console.log('returned likes: ' + likes)
            let stockData = {
              'stock': stockSym,
              'price': jsonData['Global Quote']['05. price']
            }
          console.log(`stockData: ${JSON.stringify(stockData)}`)
          resolve(stockData) 

        })
      }
      catch (err){
        next(err);
      }
    }
  });
}

async function getStockData(req, res, next) {
  var stockSym = '';
  var IP = '';
  if (typeof req.query.stock === 'string') {
    try {
      stockSym = req.query.stock.toUpperCase()
      IP = req.ip
      console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
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
  } else {
    try {
      console.log('TWO STOCKS');
      let likes0, likes1 = 0;
      stockSym = req.query.stock[0].toUpperCase();
      IP = req.ip
      console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
        console.log(`returnData: ${JSON.stringify(returnData)}`)
        res.locals.stockData = [];
        res.locals.stockData[0] = returnData[0];
        likes0 = returnData[1];
      })
      stockSym = req.query.stock[1].toUpperCase()
      IP = req.ip
      console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
        console.log(`returnData: ${JSON.stringify(returnData)}`)
        res.locals.stockData[1] = returnData[0];
        likes1 = returnData[1];
      })
      res.locals.stockData[0].rel_likes = likes0 - likes1;
      res.locals.stockData[1].rel_likes = likes1 - likes0;
      next();
    }
    catch (err){
      next(err);
    }

  }
}


module.exports = getStockData;