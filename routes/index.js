const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const createClient = require("@libsql/client").createClient;

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

router.get("/list", async (req, res) => {
  const name = req.query.name;
  // console.log(name);
  // res.status(404).send({ message: "Name is required" });

  if (!name) {
    res.status(404).send({ message: "Name is required" });
    return;
  }
  try {
    //ver base datos
    let result = await client.execute({
      sql: `select count(1) from "Data" where name = :name`,
      args: {
        name: name,
      },
    });
    let count = result.rows[0]["count (1)"];

    //en caso no exista, se busca en la api

    if (count == 0) {
      let response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${name}`
      );

      if (response.status !== 200) {
        res.send("No se encontro el anime");
        return;
      }
      //si se encuentra se sube a la base de datos
      result = client.execute({
        sql: `insert into "Data" values(:name, :content)`,
        args: {
          name: name,
          content: JSON.stringify(response.data),
        },
      });

      res.send(response.data);
    } else {
      result = await client.execute({
        sql: `select content from "Data" where name = :name`,
        args: {
          name: name,
        },
      });
      let response_data = result.rows[0]["content"];
      res.send(JSON.parse(response_data));
    }

    //si no encuentra un 200 no se encuentra

    // console.log(response.data);
  } catch (error) {
    console.log(error.response.status);
    console.log("fallo");
    res.status(200).send("No se encontro el anime");
  }
});

router.get("/", async (req, res) => {
  console.log("hola");
  res.send("hola");
});

module.exports = router;
