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
    .get(getStockData, function (req, res, next){
      console.log(`req.query: ${JSON.stringify(req.query)}`); 
      res.json(res.locals); 
  });
    
}; 