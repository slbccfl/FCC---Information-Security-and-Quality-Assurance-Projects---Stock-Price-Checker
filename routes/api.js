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

const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      var stockData = {}
      var stock = req.query.stock;
      var like = req.query.like || false;
      var reqIP = req.connection.remoteAddress;
      stockData.stock = req.query.stock;
      stockData.price = 1;
      stockData.likes = 1;
      res.json(stockData); 
  });
    
}; 
