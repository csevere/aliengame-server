module.exports = function(router){
  const cors = require('cors'); 
  const mysql = require('mysql'); 
  var config = require ('../config/config');
  var connection = mysql.createConnection(config); 
  connection.connect(); 

  router.post('/board', cors(), (req,res,next)=>{
    const charData = req.body; 
    //check the char
    var selectCharStats = "SELECT * FROM characters ORDER BY experience DESC LIMIT 10;";
    connection.query(selectCharStats, [charData.picture, charData.character, charData.experience, charData.level], (error, results)=>{
      if(error) throw error;
      if(results.length > 0){
        results = JSON.stringify(results); 
        var resJSON = JSON.parse(results);
        console.log('**********CHECKING ALL CHAR RESULTS*********') 
        console.log(results);
        res.json({
          results: resJSON,
          msg: 'showStats'
        })
        console.log("Stats taken from db!"); 
      }
      connection.end();
    });
  });
}
