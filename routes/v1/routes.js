const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const createClient = require("@libsql/client").createClient;

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let cache_interno = [];
const CACHE_MAX_SIZE = 1000;

function getMIMETypes(req, res, next) {
  const acceptedMIMEType = req.accepts(["application/json"]);

  if (!acceptedMIMEType) {
    res.status(406).send({ message: `No se acepta ${req.headers.accept}` });
    return;
  }

  next();
}

function removeLRU() {
  let currentMin = Number.MAX_SAFE_INTEGER;
  let currentName = "";

  for (const anime of cache_interno) {
    if (anime.requestsNumber < currentMin) {
      currentMin = anime.requestsNumber;
      currentName = anime.name;
    }
  }

  return cache_interno.filter((element) => element.name != currentName);
}

async function existsAnime(name) {
  const result = await client.execute({
    sql: `select count(1) from "Data" where name = :name`,
    args: {
      name: name,
    },
  });
  const count = result.rows[0]["count (1)"];

  return count > 0;
}

router.get("/list/:name", getMIMETypes, async (req, res) => {
  const name = req.params.name;

  console.log(
    cache_interno.map((element) => ({
      name: element.name,
      requestsNumber: element.requestsNumber,
    }))
  );

  if (!name) {
    res.status(400).send({ message: "Name is required" });
    return;
  }
  try {
    const possibleResult = cache_interno.find(
      (element) => element.name == name
    );
    if (possibleResult) {
      if (possibleResult.value === "") {
        res.status(404).send("No se encontro el anime");
        return;
      }
      res.send(possibleResult.value);
      possibleResult.requestsNumber++;
      return;
    }

    let data = null;

    if (!(await existsAnime(name))) {
      const url = `https://api.jikan.moe/v4/anime?q=${name}`;
      const response = await axios.get(url);

      data = response.data.data;

      //si se encuentra se sube a la base de datos

      await client.execute({
        sql: `insert into "Data" values(:name, :value)`,
        args: { name, value: JSON.stringify(data) },
      });
    } else {
      const result = await client.execute({
        sql: `select value from "Data" where name = :name`,
        args: {
          name: name,
        },
      });

      data = result.rows[0]["value"];
      if (data === "") {
        res.status(404).send("No se encontro el anime");
        return;
      }

      data = JSON.parse(data);
    }

    res.send(data);

    const newElement = {
      name: name,
      value: data,
      requestsNumber: 1,
    };

    if (cache_interno.length >= CACHE_MAX_SIZE) cache_interno = removeLRU();

    cache_interno.push(newElement);

    //si no encuentra un 200 no se encuentra
  } catch (error) {
    console.log("fallo: ", error);

    res.status(404).send("No se encontro el anime");

    if (!(await existsAnime(name)))
      await client.execute({
        sql: `insert into "Data" values(:name, :value)`,
        args: { name, value: "" },
      });
  }
});

module.exports = router;