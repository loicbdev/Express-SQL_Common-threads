const express = require('express');
const cors = require('cors');
const connection = require('./config');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// We use a middleware to read json formatted Body request
// Express ne peut pas lire l'objet JSON par défaut... Pour le faire fonctionner, nous devons utiliser un middleware express intégré.
app.use(express.json());


// 1. GET - Retrieve all of the data from your table

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

// 2. GET - Retrieve specific fields (i.e. id, names, dates, etc.)

app.get("/:id", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE id=?`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// 3. GET - Retrieve a data set with the following filters (use one route per filter type):
// 3.1. A filter for data that contains... (e.g. name containing the string 'wcs')
// ex : http://localhost:8080/title/?contains=tempête
app.get("/title", (req, res) => {
  const sql = "SELECT * FROM audiobook WHERE title LIKE ?";
  const sqlValue = [];
  req.query.contains && sqlValue.push(`%${req.query.contains}%`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res
        .status(404)
        .send(`No audiobook containing '${req.query.contains}' in its title...`);
    }
  });
});

// 3.2. A filter for data that starts with... (e.g. name beginning with 'campus')

app.get("/title/starting", (req, res) => {
  const sql = "SELECT * FROM book WHERE title LIKE ?";
  const sqlValue = [];
  req.query.with && sqlValue.push(`${req.query.with}%`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res
        .status(404)
        .send(`No audiobook starting with '${req.query.with}' in its title...`);
    }
  });
});

// 3.3 A filter for data that is greater than... (e.g. date greater than 18/10/2010)

app.get("/created_at", (req, res) => {
  let sql = "SELECT * FROM book WHERE created_at > ?";
  const sqlValue = [];
  req.query.greaterThan && sqlValue.push(`${req.query.greaterThan}`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).send(`No audiobook beyond '${req.query.greaterThan}'...`);
    }
  });
});




// 4. GET - Ordered data recovery (i.e. ascending, descending) - The order should be passed as a route parameter

app.get("/asc", (req, res) => {
  let sql = `SELECT * FROM audiobook ORDER BY duration ASC`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    }
  });
});

// 5. POST - Insertion of a new entity

app.post("/api/audiobook", (req, res) => {
  const { title, duration, active, created_at } = req.body;
  connection.query(
    "INSERT INTO audiobook (title, duration, active, created_at) VALUES(?, ?, ?, ?)",
    [title, duration, active, created_at],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving a movie");
      } else {
        res.status(200).send("Successfully saved");
      }
    }
  );
});

// 6. PUT - Modification of an entity

app.put('/:id', (request, response) => {
  let sql = "UPDATE audiobook SET ? WHERE id=?";
  connection.query(sql, [request.body, request.params.id], (err, results) => {
    if (err) {
      response.status(500).send({ errorMessage: 'Error to update the audiobook' });
    } else {
      sql = "SELECT * FROM audiobook WHERE id=?";
      connection.query(sql, request.params.id, (err, results) => {
        if (results.length === 0) {
          response.status(404).send({ errorMessage: `No audiobook found with this id: ${request.params.id}` });
        } else {
          response.status(200).json(results[0]);
        }
      });
    }
  });
});

// 7. PUT - Toggle a Boolean value

app.put("/toggle_active/:id", (req, res) => {
  const AudioBookId = req.params.id;
  connection.query(
    "UPDATE audiobook SET active = !active WHERE id = ?",
    [AudioBookId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating data...");
      } else {
        res
          .status(200)
          .send("Audiobook's active status has been successfully updated !");
      }
    }
  );
});

// 8. DELETE - Delete an entity

app.delete("/api/audiobook/:id", (req, res) => {
  const AudioBookId = req.params.id;
  connection.query(
    "DELETE FROM audiobook WHERE id = ?",
    [AudioBookId],
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("😱 Error deleting an audiobook");
      } else {
        res.status(200).send("🎉 Audiobook deleted!");
      }
    }
  );
});


// 9. DELETE - Delete all entities where boolean value is false

app.delete("/delete/not_active", (req, res) => {
  connection.query("DELETE FROM audiobook WHERE active = 0", (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating data...");
    } else {
      res.status(200).send("Audiobooks not-active successfully deleted !");
    }
  });
});







app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})