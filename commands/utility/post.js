const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const scrape = require("../../lib/webscrapping")

// File to store messages
//const messageFile = "messages.txt";
const messageFile = "update.lua";
const MAX_ID = 20,
  MAX_TWITTER = 50;

const hint_recycleMSG = "press UP, to restore your last message";

let log_channel = null;

const alphabetRegex = /[^a-zA-Z0-9 ,.]/g;
function treat(value) {
  value = value.trim();
  value = value.toLowerCase();
  value = value.replace(alphabetRegex, ""); //only alphabetic
  value = value.replace(/(.)\1{2,}/g, "$1$1"); //trim repeated values
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
        .setName("workshop_id")
        .setDescription("workshop_id")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("short_desc")
        .setDescription(
          `msg with ${MAX_TWITTER} length max to summary or show how useful can mod be`
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    let modid = interaction.options.getString("workshop_id");
    let short_desc = interaction.options.getString("short_desc");
    await interaction.deferReply({ ephemeral: true });
    const followUpMessage = `processing ${modid}: ${short_desc}`;
    await interaction.followUp({ content: followUpMessage, ephemeral: true });

    if(!/^\d+$/.test(modid)){
 await interaction.editReply("add workshop id, only numbers");
return;
}
    let mod_data = await scrape.getModData(modid);

    if (log_channel == null) {
      log_channel = await interaction.guild.channels.fetch(
        "1218305100494409909"
      );
    }
    if(mod_data.subscriber_count > 109999){
      await interaction.editReply(`this mod is too popular >100k subs, ${hint_recycleMSG}`);
      await log_channel.send(`${interaction.user.id}: too popular ${new_item}`);
      return;

    }
    if(mod_data.subscriber_count<300){
      await interaction.editReply(`this mod is too small <300 subs, ${hint_recycleMSG}`);
      await log_channel.send(`${interaction.user.id}: too small ${new_item}`);
      return;
    }
    modid = mod_data.modName;
    //modid = treat(modid);
    short_desc = treat(short_desc);
    // Defer the initial reply with an ephemeral message

    // Send an ephemeral follow-up message with processing information


    if (short_desc.length > MAX_TWITTER) {
      await interaction.editReply(`short_desc too big, ${hint_recycleMSG}`);
      return;
    }
    if (modid.length > MAX_ID) {
      await interaction.editReply(`modid too big, ${hint_recycleMSG}`);
      return;
    }

    let new_item = `${modid}=${short_desc}`;
    await log_channel.send(`<@!${interaction.user.id}>: ${new_item}`);

    //modifyAndAppendLine(`${new_item}`);

    fs.appendFile(messageFile, `${new_item}\n`, (err) => {
      if (err) {
        console.error(err);
        return interaction.editReply(`Error saving message! ${hint_recycleMSG}`);
      }
      console.log(`Message appended to ${messageFile}`);
      interaction.editReply(modid + " short_desc saved successfully!");
    });
  },
};
