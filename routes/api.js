/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const getStockData = require('../middleware/getStockData');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(getStockData, function (req, res){
      // var response = {stockData: {}}
      // var stock = req.query.stock;
      // var like = req.query.like || false;
      // var reqIP = req.connection.remoteAddress;
      // console.log(`res.locals.stockData: ${JSON.stringify(res.locals.stockData)}`);
      // response.stockData.stock = req.query.stock.toUpperCase(); 
      // response.stockData.price = 1;
      // response.stockData.likes = 1;
      // // console.log(response);
      res.json(res.locals); 
      // res.json({stockData:{stock:"GOOG",price:"786.90",likes:1}});
  });
    
}; 