require("dotenv").config();

const axios = require("axios");
const express = require("express");
const { createHash } = require("crypto");
const app = express();
const BASE_PORT = process.env.basePort;
const N = process.env.N;
const currentPort = process.env.PORT || 5000;
console.log(process.env.PORT);

app.get("/listen", async (req, res) => {
  const name = req.query.name;
  const hash = createHash("sha256");
  hash.update(req.ip + new Date().getTime().toString());
  const finalOffset = parseInt(hash.digest("hex"), 16) % N;

  try {
    const response = axios.get(`/listen?name=${name}`);
    res.send(response.data);
  } catch (error) {
    console.log(error);

    res.status(404).send({ message: "Anime not found" });
  }
});

app.listen(currentPort, () => {
  console.log("escuchando en", currentPort);
});
