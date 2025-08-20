const express = require("express");

function createServer(port, message) {
  const app = express();
  app.get("/", (req, res) => {
    res.send(`<h1>${message}</h1>`);
  });
  app.listen(port, () => {
    console.log(`Server on port ${port} is running...`);
  });
}

createServer(3001, "Hii, this is port 3001");
createServer(3002, "Hello there port 3002");
createServer(3003, "How's it going, this is port 3003");
createServer(3004, "Heads up, you're at port 3004")