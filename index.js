console.log("hello world");

const mysql = require('mysql2');

require('dotenv').config()
const express = require('express');
const app = express();
// const port = process.env.PORT || 8080;
app.use(express.json());

console.log(process.env.MYSQL_URL);
console.log("hello world");

const connection = mysql.createConnection(process.env.MYSQL_URL);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/restaurants', (req, res) => {
    const { restaurant_id, name, address, city, province, postal_code } = req.body;
    const query = 'INSERT INTO restaurantTable (id, name, address, city, province, postal_code) VALUES (?, ?, ?, ?, ?, ?)';
    
    connection.query(query, [restaurant_id, name, address, city, province, postal_code], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error adding restaurant' });
        return;
      }
      res.status(201).json({ id: result.insertId, message: 'Restaurant added successfully' });
    });
  });


app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM restaurantTable WHERE restaurantID = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching restaurant' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }
    res.json(results[0]);
  });
});