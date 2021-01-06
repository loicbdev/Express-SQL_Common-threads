const express = require('express');
const connection = require('../config');
const router = express.Router();


// 1. GET - Retrieve all of the data from your table

router.get('/', (request, response) => {
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

router.get("/titles", (req, res) => {
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

router.get("/:id", (req, res) => {
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

router.get("/titles/contains", (req, res) => {
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

router.get("/titles/startWith", (req, res) => {
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

router.get("/duration/:duration", (req, res) => {
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

router.get("/created/:created", (req, res) => {
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

router.get("/titles/order/:value", (req, res) => {
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

router.post("/", (req, res) => {
  const { title, duration, active, created_at: createdAt, performer_id: performerId } = req.body;
  connection.query(
    "INSERT INTO audiobook (title, duration, active, created_at, performer_id) VALUES(?, ?, ?, ?, ?)",
    [title, duration, active, createdAt, performerId],
    (err, result) => {
      if(err) {
        res.status(500).send(err);
      } else if(result.affectedRows < 1) {
        res.sendStatus(404);
      } else {
        res.status(201).json({
          id: result.insertId,
        });
      }
    }
  );
});

// 6. PUT - Modification of an entity

router.put('/:id', (request, response) => {
  let sql = "UPDATE audiobook SET ? WHERE id=?";
  connection.query(sql, [request.body, request.params.id], (err, result) => {
    if (err) {
      response.status(500).send({ errorMessage: 'Error to update the audiobook' });
    } else {
      sql = "SELECT * FROM audiobook WHERE id=?";
      connection.query(sql, request.params.id, (err, result) => {
        if (result.length === 0) {
          response.status(404).send({ errorMessage: `No audiobook found with this id: ${request.params.id}` });
        } else {
          response.status(200).json(result[0]);
        }
      });
    }
  });
});

// 7. PUT - Toggle a Boolean value

router.put("/toggle/:id", (req, res) => {
//  const AudioBookId = req.params.id;
  connection.query(
    "UPDATE audiobook SET active = !active WHERE id = ?",
    [req.params.id],
    (error, result) => {
      if (error) {
        res
          .status(500)
          .send("Error updating data...");
      } else if (result.affectedRows < 1) {
        res 
          .sendStatus(404);
      } else {
        res
          .status(200)
          .send("Audiobook's active status has been successfully updated !");
      }
    }
  );
});

// 8. DELETE - Delete an entity

router.delete("/delete/:id", (req, res) => {
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

router.delete("/delete/not-active", (req, res) => {
  connection.query("DELETE FROM audiobook WHERE active = 0", (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating data...");
    } else {
      res.status(200).send("Audiobooks not-active successfully deleted !");
    }
  });
});

module.exports = router;