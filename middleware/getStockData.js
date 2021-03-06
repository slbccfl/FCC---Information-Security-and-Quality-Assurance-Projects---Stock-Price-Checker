
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

function findLikes(collection, stockSym) {
  // console.log('collection: ' + collection);
  // console.log('stockSym: ' + stockSym);
  return new Promise((resolve, reject) => {
    collection.find({stockSym: stockSym}).toArray((err, result) => {
      if (err != null) reject(err);
      // console.log('result: ' + JSON.stringify(result))
      resolve(result.length) 
    });
  }); 
      
}

function getLikes(stockSym, IP, newLike, next) {
  // console.log('newLike: ' + newLike);
  return new Promise((resolve, reject) => {
    try {
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        if (err != null) throw err;
        var likes = null;
        const collection = db.collection("stocks");
        if (newLike === "true") { 
          let updateDoc = {stockSym: stockSym, IP: IP}
          // console.log('updateDoc: ' + JSON.stringify(updateDoc));
          collection.update(updateDoc, updateDoc, {upsert: true}, async (err, result) => {
            if (err != null) throw err;
            likes = await findLikes(collection, stockSym);
            resolve(likes);
          })
        } else {
          likes = await findLikes(collection, stockSym);
          resolve(likes);
        }
      });
    } catch (error) { 
      reject (error)
    }
  });
}

function stubStockAPI(stockSym, next) {
  return new Promise((resolve, reject) => {
    // console.log(Date.now());
    setTimeout(function() {
      if (stockSym == 'GOOG') {
      // stub to avoid hitting API too much while developing
          resolve({"stock":"GOOG","price":"0000.0000"});
      } else {
          if (stockSym == 'MSFT') {
          // stub to avoid hitting API too much while developing
              resolve({"stock":"MSFT","price":"0000.0000"});
          }
      }
      
    },500)
  });
}

function stockAPI(stockSym, next) {
  return new Promise((resolve, reject) => {

    try {
      setTimeout(function() {
        let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSym}&apikey=${alphaVantageAPIKEY}`;
        // console.log(`url: ${url}`);
        fetch(url)
          .then((response) => response.json())
          .then((jsonData) => {
            console.log(`jsonData: ${JSON.stringify(jsonData)}`);
            var stockSym = jsonData['Global Quote']["01. symbol"];
            let stockData = {
              'stock': stockSym,
              'price': jsonData['Global Quote']['05. price']
            }
          // console.log(`stockData: ${JSON.stringify(stockData)}`)
          resolve(stockData) 

        })
      
      },500)
    } 
    catch (error){
      reject (error);
    }
  });
}

async function getStockData(req, res, next) {
  var stockSym = '';
  var IP = '';
  // console.log('req.query' + JSON.stringify(req.query));
  if (typeof req.query.stock === 'string') {
    try {
      stockSym = req.query.stock.toUpperCase()
      IP = req.ip
      // console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
        // console.log(`returnData: ${JSON.stringify(returnData)}`)
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
      let likes0, likes1 = 0;
      stockSym = req.query.stock[0].toUpperCase();
      IP = req.ip
      // console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
        // console.log(`returnData: ${JSON.stringify(returnData)}`)
        res.locals.stockData = [];
        res.locals.stockData[0] = returnData[0];
        likes0 = returnData[1];
      })
      stockSym = req.query.stock[1].toUpperCase()
      IP = req.ip
      // console.log(`stockSym: ${stockSym}`)
      await Promise.all([stockAPI(stockSym, next), getLikes(stockSym, IP, req.query.like, next)]).then((returnData) => {
        // console.log(`returnData: ${JSON.stringify(returnData)}`)
        res.locals.stockData[1] = returnData[0];
        likes1 = returnData[1];
      })
      res.locals.stockData[0].rel_likes = likes0 - likes1;
      res.locals.stockData[1].rel_likes = likes1 - likes0;
      next();
    }
    catch (error){
      next(error); 
    }

  }
}


module.exports = getStockData;