exports.index = function(req, res){
  console.log(req.query);

  var uID, sID;
  if (req.query.userid && req.query.sessionid) {
  	var uID = req.query.userid
  	var sID = req.query.sessionid;
  } else {
  	console.log("No session and user data found.")
  }
  
  res.render('home', { title: 'Brocast', userID: uID, sessionID: sID });
};