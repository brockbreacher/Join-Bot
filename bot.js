const { Client, Intents, GuildMember, MessageEmbed } = require("discord.js");
const path = require("path");
const WOKCommands = require("wokcommands");
require("dotenv").config();
const {
  readFileSync,
  unlinkSync,
  appendFile,
  readdirSync,
  appendFileSync,
  writeFileSync,
} = require("fs");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  partials: ["GUILD_MEMBER"],
});

client.on("ready", () => {
  console.log("change this part"); /*Needed for startup on pteropanel*/
  getFilesInDirectory();
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    testServers: [process.env.DEVGUILDID],
  }).setDefaultPrefix(process.env.PREFIX);
  console.log("I am ready!");
  client.user.setActivity(process.env.ACTIVITY, { type: process.env.TYPE });
  client.shard.fetchClientValues("guilds.cache.size").then(console.log);
});

client.on("guildDelete", (guild) => {
  try {
    getFilesInDirectory();
    if (guild.id) {
      unlinkSync("./guilds/" + guild.id);
    }
  } catch (e) {
    // return logtofile(e);
  }
});

client.on(
  "guildMemberAdd",
  async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createJoinEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
  },
  (e) => logtofile(e)
);

client.on(
  "guildMemberRemove",
  async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createLeaveEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
  },
  (e) => logtofile(e)
);

function logtofile(e) {
  console.log(e);
}

function getFilesInDirectory() {
  let files = readdirSync("./guilds/");
  files.forEach((file) => {
    appendFileSync("./logs/guilds.txt", `${file}\n`, (err) => {
      if (err) throw err;
    });
  });
}

function getJoinChannel(guild) {
  let channelId;
  try {
    channelId = readFileSync("./guilds/" + guild.id, { encoding: "utf8" });
  } catch (e) {
    logtofile(e);
    return null;
  }
  return guild.channels.resolve(channelId);
}

async function createJoinEmbed(member) {
  // Make sure the member is actually a GuildMember, and not a partial
  if (!(member instanceof GuildMember)) return;

  return new MessageEmbed()
    .setTitle(`Welcome ${member.displayName} To ${member.guild.name}`)
    .setColor(0x008000)
    .setDescription(`Welcome To ${member.guild.name}`)
    .addField("Time Joined:", member.joinedAt.toUTCString())
    .addField("Account Creation Date", member.user.createdAt.toUTCString())
    .addField("Total Members", "" + member.guild.memberCount)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
}

async function createLeaveEmbed(member) {
  // Make sure the member is actually a GuildMember, and not a partial
  if (!(member instanceof GuildMember)) return;

  return new MessageEmbed()
    .setTitle(`${member.displayName} Left ${member.guild.name}`)
    .setColor(0xff0000)
    .setDescription("Cya")
    .addField("Total Members", "" + member.guild.memberCount)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
}

process.on("uncaughtException", (err) => {
  console.log(err);
  // appendFileSync("./logs/errors.txt", `${err}\n`, (err) => { if (err) throw err; });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  // appendFileSync("./logs/errors.txt", `${err}\n`, (err) => { if (err) throw err; });
});

client.login(process.env.TOKEN);
