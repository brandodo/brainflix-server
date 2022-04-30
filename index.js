const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const videoRoutes = require("./routes/videos");

require("dotenv").config();
const { PORT, API_KEY } = process.env;

app.use(express.json());
app.use(cors());
app.use(express.static("./public/images"));
app.use(express.static("./public/videos"));
app.use(express.static(path.join(__dirname, "build")));

app.use((req, res, next) => {
  req.query.api_key && req.query.api_key === API_KEY
    ? next()
    : res.status(400).send("API Key Required!");
});
app.use("/videos", videoRoutes);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running...");
});
