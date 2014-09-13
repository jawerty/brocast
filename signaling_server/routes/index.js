
/*
 * GET home page.
 */
var _static = require('node-static');
var file = new _static.Server('./public');

exports.index = function(req, res){
  req.addListener('end', function() {
      file.serve(req, res);
  }).resume();
  res.render('index', { Info: 'SIGNALING' });

};