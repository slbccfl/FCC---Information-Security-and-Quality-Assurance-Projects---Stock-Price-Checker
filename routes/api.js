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
const getStockData = require('../middleware/getStockData');

const MONGODB_CONNECTION_STRING = process.env.DB;

const alphaVantageAPIKEY = process.env.APIKEY;



module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res){
      var response = {stockData: {}}
      var stock = req.query.stock;
      var like = req.query.like || false;
      var reqIP = req.connection.remoteAddress;
      app.use(getStockData)
      response.stockData.stock = req.query.stock.toUpperCase(); 
      response.stockData.price = 1;
      response.stockData.likes = 1;
      // console.log(response);
      res.json(response); 
      // res.json({stockData:{stock:"GOOG",price:"786.90",likes:1}});
  });
    
}; 