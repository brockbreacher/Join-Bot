require("dotenv").config();
const { ShardingManager } = require("discord.js");
const express = require("express");
const app = express();

const manager = new ShardingManager("./bot.js", {
  token: process.env.TOKEN,
});

app.get("/", (req /*Keep req, it is necessary*/, res) => {
  var date = new Date();
  var currentDate =
    date.getMonth() +
    1 +
    "/" +
    date.getDate() +
    "/" +
    date.getFullYear() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes().toPrecision(2);
  console.log(currentDate + " | Ping Received");
  res.sendStatus(200);
});
app.listen(25568);

manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
