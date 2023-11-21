require("dotenv").config();

const axios = require("axios");
const express = require("express");
const { createHash } = require("crypto");
const app = express();
const { URL, BASE_PORT, N, currentPort = 25565 } = process.env;

let currentNode = 0;

function chooseNextAvailableNode() {
  return (currentNode + 1) % N;
}

app.get("/api/v1/list/:name", async (req, res) => {
  const name = req.params.name;

  if (!name) {
    res.status(400).send({ message: "Name is required" });
    return;
  }

  const serverURL = `${URL}:${parseInt(BASE_PORT) + currentNode}`;
  currentNode = chooseNextAvailableNode();

  console.log(`Se eligio el server ${serverURL}`);

  try {
    res.redirect(`${serverURL}/api/v1/list/${name}`);
  } catch (error) {
    res.status(520).send({ message: "ni idea", error });
  }
});

app.listen(currentPort, () => {
  console.log("escuchando en", currentPort);
});
