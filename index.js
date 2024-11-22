const express = require('express');
const fs = require('fs');
const users = require('./MOCK_DATA.json');
const { json } = require('express/lib/response');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false })); // Parses incoming JSON requests


// All Routes

app.get('/', (req, res) => {

  const html = `<ul>
  ${users.map((user) => `<li>${user.first_name}</li>`).join(" ")}
  </ul>`;
  res.send(html);


});

// Get API Request
app.get('/api/users', (req, res) => {
  return res.json(users);
});

// Get request for particular user 

app.get('/api/users/:id', (req, res) => {
  const reqUserId = Number(req.params.id);
  const user = users.find((user) => user.id === reqUserId);

  return res.json(user);
});

// Post Request

app.post('/api/users', (req, res) => {
  const body = req.body;
  const id = users.length + 1;

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ Status: 'Failure', Error: 'Invalid or empty request body' });
  }

  const finalObject = { id, ...body };
  users.push(finalObject);

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      console.error("Error in Updation:", err);
      return res.status(500).json({ Status: "Failure", Error: err.message });
    }
    res.json({ Status: "Success", id: users.length });
  });

});


// PUT Request: Update user details
app.put('/api/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const updatedDetails = req.body;

  // Find the user by ID
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    // User not found
    return res.status(404).json({ Status: "Failure", message: "User not found" });
  }

  // Update the user details
  users[userIndex] = { ...users[userIndex], ...updatedDetails };

  // Write updated users to the file
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ Status: "Failure", Error: err.message });
    }
    res.json({ Status: "Success", message: `User with id ${userId} updated`, user: users[userIndex] });
  });
});



// Delete Request

app.delete('/api/users/:id', (req, res) => {
  const delUserId = Number(req.params.id);
  let isPresent = false;
  isPresent = users.some((user) => user.id === delUserId);

  if (!isPresent) {
    // Response is send and stop sending again
    res.json({ error: "No Such User Exist" });
  }
  else {
    const updatedUsers = users.filter((user) => user.id !== delUserId);

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(updatedUsers), (err) => {
      if (err) {
        console.error("Error in Deleting User:", err);
        return res.status(500).json({ Status: "Failure", Error: err.message });
      }
      res.json({ Status: "Success", id: users.length });
    });
  }

});



// Server Start Listening 

app.listen(PORT, () => {
  console.log(`Server is Listening on Port ${PORT}....`);
})

