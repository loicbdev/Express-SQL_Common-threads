const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config()
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
 
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});

app.get('/', (req, res) => {
    connection.query('SELECT * FROM audiobook', (err, result) => {
        if(err) {
            res.status(500).send(err);
        }
        if(result.lenght === 0) {
            res.sendStatus(404);
        } else {
        res.status(200).send(result);
        }
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})