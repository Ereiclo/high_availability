require("dotenv").config();

const axios = require("axios");
const express = require("express");
const { createHash } = require("crypto");
const app = express();
const { URL, BASE_PORT, N, currentPort = 25565 } = process.env;

app.get("/list", async (req, res) => {
  const name = req.query.name??"";
  // console.log(`Se recibio el request ${name}`);
  const hash = createHash("sha256");
  hash.update(req.ip + new Date().getTime().toString());
  const hash_digest = hash.digest("hex")
  const finalOffset = parseInt(hash_digest, 16) % N;
  // console.log(hash)
  // console.log(hash_digest)
  // console.log(finalOffset)
  const serverURL = `${URL}:${parseInt(BASE_PORT) + finalOffset}`;

  console.log(`Se eligio el server ${serverURL}`);
  try {
    const response = await axios.get(`${serverURL}/list?name=${name}`);
    // console.log(response.data);
    res.send(response.data);
  } catch (error) {
    //console.log(error)
    if (error?.code === "ECONNRESET" || error?.code === "ECONNREFUSED") {
      res.status(503).send({ message: "Server is down" });
      return;
    }
    // console.log(error);
    res.status(404).send(error.response.data);
  }
});

app.listen(currentPort, () => {
  console.log("escuchando en", currentPort);
});
