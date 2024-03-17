const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");

// File to store messages
//const messageFile = "messages.txt";
const messageFile = "update.lua";
const MAX_ID = 20, MAX_TWITTER=50;

let log_channel = null;

const alphabetRegex = /[^a-zA-Z ,.]/g;
function treat(value) {
  value = value.trim();
  value = value.toLowerCase();
  value = value.replace(alphabetRegex, ""); //only alphabetic
  value = value.replace(/(.)\1{2,}/g, '$1$1'); //trim repeated values
  return value;
}
/*
function modifyAndAppendLine(newItem) {
  fs.readFile(messageFile, 'utf8', (err, data) => {
    if (err) throw err;

    const lines = data.split('\n');
    const lastLine = lines[lines.length - 1];
    const modifiedLine = lastLine.replace('}', `, ${newItem}`); // Replace } with comma and new item
    lines[lines.length - 1] = modifiedLine + '}'; // Replace last line with modified version and closing }

    const updatedData = lines.join('\n');

    fs.writeFile(messageFile, updatedData, (err) => {
      if (err) throw err;
      console.log(`Successfully appended new item to ${messageFile}`);
    });
  });
}
*/
// Replace with your file path and desired item
module.exports = {
  data: new SlashCommandBuilder()
    .setName("post")
    .setDescription("add mod to spotlight")
    .addStringOption((option) =>
      option
        .setName("modid")
        .setDescription("mod id or way to identify mod")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("twitter")
        .setDescription(
          `msg with ${MAX_TWITTER} length max to summary or show how useful can mod be`
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    let modid = interaction.options.getString("modid");
    let twitter = interaction.options.getString("twitter");
    modid = treat(modid);
    twitter = treat(twitter);
    // Defer the initial reply with an ephemeral message
    await interaction.deferReply({ ephemeral: true });

    // Send an ephemeral follow-up message with processing information
    const followUpMessage = `processing ${modid}: ${twitter}`;
    await interaction.followUp({ content: followUpMessage, ephemeral: true });

    if (twitter.length > MAX_TWITTER) {
      await interaction.editReply("twitter too big");
      return;
    }
    if (modid.length > MAX_ID) {
      await interaction.editReply("modid too big");
      return;
    }

    if (log_channel == null) {
      log_channel = await interaction.guild.channels.fetch(
        "1218305100494409909"
      );
    }
    let new_item = `${modid}=${twitter}`;
    await log_channel.send(`<@!${interaction.user.id}>: ${new_item}`);

    //modifyAndAppendLine(`${new_item}`);

    fs.appendFile(messageFile, `${new_item}\n`, (err) => {
      if (err) {
        console.error(err);
        return interaction.editReply("Error saving message!");
      }
      console.log(`Message appended to ${messageFile}`);
      interaction.editReply(modid + " twitter saved successfully!");
    });
  },
};
