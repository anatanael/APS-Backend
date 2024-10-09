require("dotenv").config();
const express = require("express");
const cors = require("cors");

const Database = require("./database/connection");
Database.openConnection();

const routes = require("./routes");

const PORT_SERVER = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", routes);

app.listen(PORT_SERVER, () =>
  console.log(`SERVER is running in localhost ${PORT_SERVER}`)
);
