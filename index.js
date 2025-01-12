console.log("hello world");

const mysql = require('mysql2');

require('dotenv').config()
const express = require('express');
const app = express();
// const port = process.env.PORT || 8080;
app.use(express.json());

var restaurant_number = 40;
var item_number = 40;

console.log(process.env.MYSQL_URL);
console.log("hello world");

const connection = mysql.createConnection(process.env.MYSQL_URL);

const port = process.env.PORT || 8080;
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
  console.error(err.message);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Server is running');
});



// Restaurants. We want to add, and make sure that we don't add duplicates to the database.
app.post('/restaurants', (req, res) => {
    const { yelp_key, name, address, latitude, longitude } = req.body;
    const query = 'INSERT INTO restaurantTable (restaurant_id, yelp_key, name, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)';
    
    // Restaurant Id generation. Find the largest and then choose that?
    const restaurant_id = restaurant_number;
    ++restaurant_number;
    // 


    connection.query(query, [restaurant_id, yelp_key, name, address, latitude, longitude], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).json({ error: 'Restaurant already exists' });

        } else {
          console.error(err.message);
          res.status(500).json({ error: 'Error adding restaurant' });
          return;
        }
        
      }
      res.status(201).json({ id: result.insertId, message: 'Restaurant added successfully' });
    });
});

// Get restaurant from yelpkey.
app.get('/restaurants/:yelp_key', (req, res) => {
  const id = req.params.yelp_key;
  const query = 'SELECT * FROM restaurantTable WHERE yelp_key = ?';
  
  connection.query(query, [yelp_key], (err, results) => {
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



// Menu Items, we want to just add here, checking for duplicates too complicated. YOU NEED TO 
// DO AN API CALL TO GET THE RESTAURANT's ID USING ITS YELP KEY BEFORE YOU ACTUALLY GET THE RESTAURANT ID.
app.post('/menuItems', (req, res) => {
  const {yelp_key, name, isVegan, isVegetarian, isNutFree, isPescatarian, isGlutenFree} = req.body;

  // Generate our item id.
  const item_id = item_number;
  item_number++;


  const query = 'INSERT INTO menuItems (item_id, restaurant_id, name, isVegan, isVegetarian, isNutFree, isPescatarian, isGlutenFree) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  connection.query(query, [item_id, restaurant_id, name, isVegan, isVegetarian, isNutFree, isPescatarian, isGlutenFree], (err, result) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Error adding menu item' });
      return;
    }
    res.status(201).json({ id: result.insertId, message: 'menu item added successfully' });
  });


});

// Get menu items from yelp_key
app.get('/menuItems/:yelp_key', (req, res) => {
  const yelp_key = req.params.yelp_key;
  const query = 'SELECT * FROM menuItems WHERE yelp_key = ?';
  
  connection.query(query, [yelp_key], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching menu items' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'No menu items found for this restaurant' });
      return;
    }
    res.json(results);
  });
});