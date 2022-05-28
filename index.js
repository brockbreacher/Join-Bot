const { Client, Intents, GuildMember, MessageEmbed } = require('discord.js');
const config = require('./config.json');
const path = require('path');
const WOKCommands = require('wokcommands');
const { readFileSync, unlinkSync } = require('fs');
const express = require('express');
const app = express();


const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
})

client.on('ready', () => {
    // Needed for startup on pteropanel
    console.log("change this part")
    console.log('Servers: ' + client.guilds.cache.size)
    console.log(`INFO: Connected to discord as ${client.user.tag}`);
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        testServers: [config.devGuildID],
    })
        .setDefaultPrefix(config.prefix)
    console.log('I am ready!')
    client.user.setActivity(config.activity, { type: config.type })
    app.get("/", (req, res) => {
        console.log(Date.now() + " Ping Received");
        res.sendStatus(200);
    });
    app.listen(25568);
})

client.on("guildDelete", guild => {
    try {
        unlinkSync("./guilds/" + guild.id);
    } catch (e) {
        console.log(`ERROR: An error occured while deleting the entry for guild ${guild.id}`);
    }
})

client.on('guildMemberAdd', async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createJoinEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
})

client.on('guildMemberRemove', async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createLeaveEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
})

function getJoinChannel(guild) {
    let channelId;
    try {
        channelId = readFileSync("./guilds/" + guild.id, { encoding: "utf8" });
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("No join channel found for " + guild.name);
        }

        console.log(`ERROR: An error occured while fetching the entry for guild ${guild.id}`);
        return null;
    }
    return guild.channels.resolve(channelId)
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
        .setColor(0xFF0000)
        .setDescription("Cya")
        .addField("Total Members", "" + member.guild.memberCount)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
}

try { client.login(config.token); }
catch (err) { console.error(err); }
