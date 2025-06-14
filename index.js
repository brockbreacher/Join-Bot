require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const guildsDir = path.join(__dirname, 'guilds');
if (!fs.existsSync(guildsDir)) {
  fs.mkdirSync(guildsDir);
  console.log('[System] Guilds directory not found, creating one now.');
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

const commands = [
  {
    name: "join",
    description: "Set a channel for Join-Logs",
    options: [
      {
        name: "channel",
        description: "The channel to make a Join-Log",
        type: 7,
        required: true,
        channel_types: [0]
      }
    ]
  }
];

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(process.env.ACTIVITY, { type: ActivityType.Watching });
  await client.application.commands.set(commands);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "join") {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ 
        content: "You do not have permission to use this command!", 
        ephemeral: true 
      });
    }

    const channel = interaction.options.getChannel("channel");
    if (!channel.isTextBased()) {
      return interaction.reply({ 
        content: "Please mention a text channel!", 
        ephemeral: true 
      });
    }

    try {
      fs.writeFileSync(path.join(guildsDir, interaction.guildId), channel.id);
      console.log(`Set ${channel.id} as join-log for guild ${interaction.guildId}`);
      await interaction.reply({ content: "Channel set as join-log", ephemeral: true });
    } catch {
      await interaction.reply({ content: "ERROR: Unknown error", ephemeral: true });
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel = getJoinChannel(member.guild);
  if (channel) channel.send({ embeds: [createJoinEmbed(member)] });
});

client.on("guildMemberRemove", async (member) => {
  const channel = getJoinChannel(member.guild);
  if (channel) channel.send({ embeds: [createLeaveEmbed(member)] });
});

function getJoinChannel(guild) {
  try {
    const channelId = fs.readFileSync(path.join(guildsDir, guild.id), "utf8");
    return guild.channels.cache.get(channelId);
  } catch {
    return null;
  }
}

function createJoinEmbed(member) {
  return new EmbedBuilder()
    .setTitle(`Welcome ${member.displayName} To ${member.guild.name}`)
    .setColor(0x008000)
    .setDescription(`Welcome To ${member.guild.name}`)
    .addFields(
      { name: "Time Joined:", value: member.joinedAt.toUTCString() },
      { name: "Account Creation Date", value: member.user.createdAt.toUTCString() },
      { name: "Total Members", value: member.guild.memberCount.toString() }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
}

function createLeaveEmbed(member) {
  return new EmbedBuilder()
    .setTitle(`${member.displayName} Left ${member.guild.name}`)
    .setColor(0xff0000)
    .setDescription("Cya")
    .addFields(
      { name: "Total Members", value: member.guild.memberCount.toString() }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
}

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

client.login(process.env.TOKEN);