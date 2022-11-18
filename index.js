const { Client, Intents, GuildMember, MessageEmbed } = require('discord.js');
const config = require('./config.json');
const path = require('path');
const WOKCommands = require('wokcommands');
const express = require('express');
const app = express();
const { readFileSync, unlinkSync, appendFile, readdirSync, appendFileSync, writeFileSync } = require('fs');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    partials: [
        "GUILD_MEMBER"
    ]
})

client.on('ready', () => {
    let date = new Date();
    let currentDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
    let resetFiles = false; //set to true if you wish to clear logs
    if (resetFiles) {
        checkForFiles();
        try {
            readdirSync('./logs').forEach(file => {
                unlinkSync(`./logs/${file}`);
                writeFileSync(`./logs/${file}`, "");
            })
        } catch (err) {
            console.error(err);
        }
    }
    console.log("change this part") /*Needed for startup on pteropanel*/
    console.log('INFO: Connected to ' + client.guilds.cache.size + ' servers')
    console.log(`INFO: Connected to Discord as ${client.user.tag}`);
    appendFile('./logs/log.txt', `${currentDate} Client rebooted!\n`, (err) => { if (err) console.log(err); });
    getFilesInDirectory();
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        testServers: [config.devGuildID],
    })
        .setDefaultPrefix(config.prefix)
    console.log('I am ready!')
    client.user.setActivity(config.activity, { type: config.type })

    app.get("/", (req /*Keep req, it is necessary*/, res) => {
        var date = new Date();
        var currentDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes().toPrecision(2);
        console.log(currentDate + " | Ping Received");
        appendFileSync("./logs/ping.txt", `${currentDate} | Ping Received\n`, (err) => { if (err) throw err; });
        res.sendStatus(200);
    });
    app.listen(25568);
});

client.on('guildDelete', guild => {
    try {
        getFilesInDirectory();
        if (guild.id) {
        unlinkSync("./guilds/" + guild.id);
        }
    } catch (e) {
        return logtofile(e);
    }
})

client.on('guildMemberAdd', async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createJoinEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
    // if (!channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
    //     return logtofile("ERROR: Missing permissions to send messages in " + channel.id + " channel");
    // }
}, e => logtofile(e));

client.on('guildMemberRemove', async (member) => {
    const channel = getJoinChannel(member.guild);
    const embed = await createLeaveEmbed(member);
    if (channel) channel.send({ embeds: [embed] });
    // if (!channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
    //     return logtofile("ERROR: Missing permissions to send messages in " + channel.name + " channel");
    // }
}, e => logtofile(e));

function logtofile(e) {
    appendFile('./logs/errors.txt', `${e}\n`, (err) => { if (err) throw err; });
    (e) => console.log(e);
}

function checkForFiles() {
    try {
        if (!readFileSync("./logs/log.txt", { encoding: "utf8" })) {
            writeFileSync("./logs/log.txt", "");
        }
        if (!readFileSync("./logs/guilds.txt", { encoding: "utf8" })) {
            writeFileSync("./logs/guilds.txt", "");
        }
        if (!readFileSync("./logs/ping.txt", { encoding: "utf8" })) {
            writeFileSync("./logs/ping.txt", "");
        }
        if (!readFileSync("./logs/errors.txt", { encoding: "utf8" })) {
            writeFileSync("./logs/errors.txt", "");
        }
    } catch (e) {
        logtofile(e);
    }
}

function getFilesInDirectory() {
    let files = readdirSync("./guilds/");
    files.forEach(file => {
        appendFileSync("./logs/guilds.txt", `${file}\n`, (err) => { if (err) throw err; });
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

process.on('uncaughtException', (err) => {
    console.log(err);
    appendFileSync("./logs/errors.txt", `${err}\n`, (err) => { if (err) throw err; });
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    appendFileSync("./logs/errors.txt", `${err}\n`, (err) => { if (err) throw err; });
});

try { client.login(config.token); }
catch (err) { console.error(err); }
