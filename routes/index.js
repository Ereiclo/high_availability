const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/list", async (req, res) => {
  const name = req.query.name;
  if (!name) {
    res.status(404).send({ message: "Name is required" });
    return;
  }
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${name}`
    );

    if (response.status !== 200) {
      res.send("fallo");
      return;
    }

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
