require("dotenv").config();

const axios = require("axios");
const express = require("express");
const { createHash } = require("crypto");
const app = express();
const { URL, BASE_PORT, N, currentPort = 5000 } = process.env;

app.get("/list", async (req, res) => {
  const name = req.query.name;
  const hash = createHash("sha256");
  hash.update(req.ip + new Date().getTime().toString());
  const finalOffset = parseInt(hash.digest("hex"), 16) % N;
  const serverURL = `${URL}:${parseInt(BASE_PORT) + finalOffset}`;

  console.log(`Se eligio el server ${serverURL}`);
  try {
    const response = await axios.get(`${serverURL}/list?name=`);
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    // console.log(error);
    res.status(404).send(error.response.data);
  }
});

app.listen(currentPort, () => {
  console.log("escuchando en", currentPort);
});
