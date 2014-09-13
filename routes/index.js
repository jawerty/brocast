exports.index = function(req, res){
  console.log(req.query);
  
  var uID = req.query.userid
  var sID = req.query.sessionid;
  res.render('home', { title: 'Brocast', userID: , sessionID: sID });
};