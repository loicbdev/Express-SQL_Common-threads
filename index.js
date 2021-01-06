const express = require('express');
const cors = require('cors');
require('express');
require('dotenv').config();
const audiobooksRoute = require('./routes/audiobooks.controller.js');
const app = express();
const port = 8080;

app.use(cors());

// We use a middleware to read json formatted Body request
// Express ne peut pas lire l'objet JSON par défaut... Pour le faire fonctionner, nous devons utiliser un middleware express intégré.
app.use(express.json());

app.use('/audiobooks', audiobooksRoute)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})