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
  res.status(404).send({ message: "Name is required" });
  return;

  if (!name) {
    res.status(404).send({ message: "Name is required" });
    return;
  }
  try {
    //ver base datos
    const result = await client.execute({
      sql: `select count(1) from "Data" where name = :name`,
      args: {
        name: name,
      },
    });
    const count = result.rows[0]['count (1)'];

    //en caso no exista, se busca en la api

    if(count == 0){
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${name}`
      );
  
      if (response.status !== 200) {
        res.send("fallo");
        return;
      }
      
    }

    //si se encuentra se sube a la base de datos

    //si no encuentra un 200 no se encuentra


    // console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.log(error.response.status);
    console.log("fallo");
    res.send("fallo");
  }
});

router.get("/", async (req, res) => {
  console.log("hola");
  res.send("hola");
});

module.exports = router;
