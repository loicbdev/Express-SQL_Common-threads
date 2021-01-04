const express = require('express');
const cors = require('cors');
const connection = require('./config');
const { request } = require('express');
const app = express();
const port = 8080;

app.use(cors());

// We use a middleware to read json formatted Body request
// Express ne peut pas lire l'objet JSON par défaut... Pour le faire fonctionner, nous devons utiliser un middleware express intégré.
app.use(express.json());


// 1. GET - Retrieve all of the data from your table

app.get('/', (request, response) => {
    connection.query('SELECT * FROM audiobook', (error, result) => {
        if(error) {
          response.status(500).send(error);
        }
        if(result.lenght === 0) {
          response.sendStatus(404);
        } else {
          response.status(200).json(result);
        }
    });
});

// 2. GET - Retrieve specific fields (i.e. id, names, dates, etc.)

app.get("/titles", (req, res) => {
  connection.query(
    `SELECT title FROM audiobook`,
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.get("/:id", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE id=?`,
    [req.params.id],
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else if (result.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).json(result[0]);
      }
    }
  );
});

// 3. GET - Retrieve a data set with the following filters (use one route per filter type):
// 3.1. A filter for data that contains... (e.g. name containing the string 'wcs')
// ex : http://localhost:8080/titles/contains?title=Fondation

app.get("/titles/contains", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE title LIKE ?`,
    [`%${req.query.title}%`],
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// 3.2. A filter for data that starts with... (e.g. name beginning with 'campus')
// ex : http://localhost:8080/titles/startWith?title=F

app.get("/titles/startWith", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE title LIKE ?`,
    [`${req.query.title}%`],
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// 3.3 A filter for data that is greater than... (e.g. date greater than 18/10/2010)
// ex : http://localhost:8080/duration/1000

app.get("/duration/:duration", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE duration > ?`,
    [`${req.params.duration}%`],
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// ex : http://localhost:8080/created/2020-01-01 (avec tri par title en plus)

// query : filtrer et trier
// params : tout le reste (mieux va utiliser les params!)

app.get("/created/:created", (req, res) => {
  connection.query(
    `SELECT * FROM audiobook WHERE created_at > ? ORDER BY title ASC`,
    [`${req.params.created}%`],
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// 4. GET - Ordered data recovery (i.e. ascending, descending) - The order should be passed as a route parameter
// EX : http://localhost:8080/titles/order/ASC ou http://localhost:8080/titles/order/asc

app.get("/titles/order/:value", (req, res) => {
  let order = 'ASC';
  if (req.params.value.toLowerCase() === 'desc') {
    order = 'DESC';
  }
  connection.query(
    `SELECT * FROM audiobook ORDER BY title ${order}`,
    (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json(result);
      }
    }
  );
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

app.put("/toggle/:id", (req, res) => {
//  const AudioBookId = req.params.id;
  connection.query(
    "UPDATE audiobook SET active = !active WHERE id = ?",
    [req.params.id],
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

app.delete("/delete/:id", (req, res) => {
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

app.delete("/delete/not-active", (req, res) => {
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