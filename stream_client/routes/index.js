exports.index = function(req, res){
  console.log(req.query);

  var uID, sID;
  if (req.query.userid && req.query.sessionid) {
  	var uID = req.query.userid
  	var sID = req.query.sessionid;
  	res.render('home', { title: 'Brocast Live Stream', userID: uID, sessionID: sID });
  } else {
  	console.log("No session and user data found.")
  }
  
  res.render('landing', { title: 'Landing' });
};