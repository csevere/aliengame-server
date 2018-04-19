module.exports = function(router){
  var connection = require('./database');  
  connection.connect(); 
  var bcrypt = require ('bcrypt-nodejs');
  var randToken = require('rand-token'); 

  ////////////REGISTER THE USER//////////////////

  router.post('/register', (req, res, next)=>{
    console.log("*********** REGISTER INPUT RESULTS************"); 
    console.log(req.body);
    // const playerData = req.body; 
    const email = req.body.email;
    const username = req.body.username;
    const character = req.body.character;
    const hash = bcrypt.hashSync(req.body.password);

  //   try {
  //     var result = await connection.query('SELECT * FROM users')
  // } catch(err) {
  //     throw new Error(err)
  // }
  // // Do something with result.

    const checkPlayerForm = new Promise((resolve, reject)=>{
      const checkPlayerFormQuery = "SELECT * FROM players where email = ? OR username = ? OR `character` = ?;";
      connection.query(checkPlayerFormQuery, [email, username, character],(error, results)=>{
        if(error) throw new Error(err);       
        //check player's email, username, character first
        if(results.length > 0){
          console.log("*********DB RESULTS********");
          results = JSON.stringify(results);
          var resJSON = JSON.parse(results);
          console.log(resJSON);  
          var email = resJSON[0].email;
          var username = resJSON[0].username;
          var character = resJSON[0].character;
          if(playerData.email === email){
            reject({msg: 'emailAlreadyExists'});
          }else if(playerData.username === username){
            reject({msg: 'usernameAlreadyExists'});
          }else if(playerData.character === character){
            reject({msg: 'characterAlreadyExists'});
          }
        }else{
          resolve();
        }
      });
    });

    checkPlayerForm.then(
      () => {
        //set up a token for the user
        var token = randToken.uid(25); 
        var insertPlayerQuery = "INSERT INTO players (email, username, `password`, `character`, token) VALUES (?,?,?,?,?);";
        connection.query(insertPlayerQuery, [email, username, hash, character, token], (error, results)=>{
          if(error){
            throw new Error(err); 
            res.json({msg: 'error'}) 
          }else{
            res.json({
              msg:'playerInserted',
              token,
              username,
              email,
              character
            })
            console.log("*************************")
            console.log("registration success!"); 
            console.log("*************************")
          }

          const insertCharQuery = "INSERT INTO characters (`character`, experience, level, time) VALUES (?, 100, 1, '0');"; 
          connection.query(insertCharQuery, [character, experience, level, time], (error, results)=>{
            if(error){
              throw new Error(err); 
              res.json({msg: 'error'}) 
            }
            console.log("*************************")
            console.log("character registration success!");
            console.log("*************************")
          }); 
        });
      }
    ).catch(
        (error)=>{
          console.log(error);
          res.json(error); 
        }
      )
  }); 

///LOGIN THE PLAYER /////

  router.post('/login', (req, res, next)=>{
    console.log("*********** LOGIN INPUT RESULTS************"); 
    console.log(req.body);
    const username = req.body.username;
    const checkPlayerLogin = "SELECT * FROM players WHERE username = ?;";
    connection.query(checkPlayerLogin, [username], (error, results)=>{
      if(error) throw new Error(err);  
      if(results.length === 0){
        res.json({
          msg:'badUserName'
        })
        console.log("ERROR!")
      }else{
        results = JSON.stringify(results);
        var resJSON = JSON.parse(results);
        console.log('**********CHECKING RESULTS*********') 
        console.log(resJSON); 
        var checkHash = bcrypt.compareSync(playerData.password, resJSON[0].password);
        if(checkHash){
          const updateToken = "UPDATE players SET token = ? WHERE username = ?;";
          var token = randToken.uid(25); 
          connection.query(updateToken, [username, token], (error, results)=>{
            if(error) throw new Error(err); 
            console.log('**********CHECKING JSON2*********')
            console.log(results); 
            res.json({
              msg: "loginSuccess",
              name: username,
              charName: resJSON[0].character,
              token
            })
            console.log("*************************")
            console.log("login success"); 
            console.log("*************************")
          })
        }else{
          res.json({
            msg: 'wrongPassword'
          })
        }
      }
    })
  }); 
}