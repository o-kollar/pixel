const express = require('express');
const app = express();
const port = 3000; // You can choose any port you like

// Define your routes and middleware here
app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
