require("dotenv").config();

const express = require("express");
const { createHash } = require("crypto");
const app = express();
const basePort = process.env.basePort;
const N = process.env.N;
const currentPort = process.env.PORT || 5000;
console.log(process.env.PORT);

app.get("/listen", async (req, res) => {
  const name = req.query.name;
  const hash = createHash("sha256");
  hash.update(req.ip);
  console.log(parseInt(hash.digest('hex'),16) % N);
});

app.listen(currentPort, () => {
    console.log('escuchando en', currentPort)
})