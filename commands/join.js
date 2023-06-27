const { channel } = require("diagnostics_channel");
const DiscordJS = require("discord.js");
const { writeFileSync } = require("fs");

module.exports = {
  category: "general",
  description: "Set a channel for join logs",

  slash: "both",

  options: [
    {
      name: "channel",
      description: "The channel to log join/leave messages to",
      required: true,
      type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL,
      minArgs: 1,
      maxArgs: 1,
    },
  ],

  callback: ({ message, interaction }) => {
    if (message) {
      const member = message.member;
      if (
        member.permissions.has(
          "MANAGE_GUILD" &&
            message.mentions.channels.size === 1 &&
            channel.type === "text"
        )
      ) {
        try {
          const channelID = message.mentions.channels.first().id;
          const guildID = message.guild.id;
          writeFileSync(`./guilds/${guildID}`, channelID);
          console.log(
            `INFO: Set ${channelID} as the join channel for ${guildID}`
          );
          message.reply("Channel set as join channel");
        } catch (err) {
          console.error(err);
        }
      } else if (!message.member.permissions.has("MANAGE_GUILD")) {
        message.reply("You do not have permission to use this command!");
        return;
      } else if (!message.mentions.channels.size === 1) {
        message.reply("Please mention one channel!");
        return;
      } else if (!channel.type === "text") {
        message.reply("Please mention a text channel!");
        return;
      } else {
        message.reply("Error: Unknown error");
        // console.error"ERROR: Unknown error";
      }
    }
    if (interaction) {
      if (interaction.guild === null) {
        interaction.reply("Please run this command in a server!");
        return "ERROR: Guild is null";
      }
      const member = interaction.member;
      const channelStr = String(interaction.options.getChannel("channel"));
      const channelID = channelStr.substring(2, channelStr.length - 1);
      const guildID = interaction.guild.id;
      const channel =
        interaction.guild.channels.cache.get(channelID).type === "GUILD_TEXT";
      try {
        if (!member.permissions.has("MANAGE_GUILD")) {
          interaction.reply("You do not have permission to use this command!");
          return;
        } else if (!interaction.options.getChannel("channel")) {
          interaction.reply("Please mention a text channel!");
          return;
        } else if (member.permissions.has("MANAGE_GUILD")) {
          try {
            console.log("Command run as Interaction");
            writeFileSync(`./guilds/${guildID}`, channelID);
            console.log(
              `INFO: Set ${channelID} as the join channel for ${guildID}`
            );
            interaction.reply("Channel set as join channel");
          } catch (e) {
            console.log(e);
            appendFile("log.txt", `${e} \n`, (e) => {
              if (e) throw e;
            });
            interaction.reply("ERROR: Unknown error");
          }
        }
      } catch (e) {
        console.log(e);
        appendFile("log.txt", `${e} \n`, (e) => {
          if (e) throw e;
        });
        interaction.reply("ERROR: Unknown error");
      }
    }
  },
};
