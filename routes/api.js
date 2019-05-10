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
      var response = {}
      var stock = req.query.stock;
      var like = req.query.like || false;
      var reqIP = req.connection.remoteAddress;
      response.stockData.stock = req.query.stock.toUpperCase(); 
      response.stockData.price = 1;
      response.stockData.likes = 1;
      res.json(response);
  });
    
}; 
