/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const MongoClient = require('mongodb');
const fetch       = require("node-fetch");

const MONGODB_CONNECTION_STRING = process.env.DB;

const alphaVantageAPIKEY = process.env.APIKEY;

function getStockData(stockSymbol) {
  let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${alphaVantageAPIKEY}`;
  console.log(url);
  fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      let response = {
        'stock': jsonData['Global Quote']["01. symbol"], 
        'price': jsonData['Global Quote']['05. price']
      }
      console.log(response);
      return response;
  }); 
}

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      var response = {stockData: {}}
      var stock = req.query.stock;
      var like = req.query.like || false;
      var reqIP = req.connection.remoteAddress;
      console.log('getStockData return: ' + getStockData(req.query.stock));
      response.stockData.stock = req.query.stock.toUpperCase(); 
      response.stockData.price = 1;
      response.stockData.likes = 1;
      // console.log(response);
      res.json(response); 
      // res.json({stockData:{stock:"GOOG",price:"786.90",likes:1}});
  });
    
}; 
