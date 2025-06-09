const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const EngelAyar = require("../../models/engelAyar");
const config = require("../../config");

module.exports = {
  name: "engelsistem",
  aliases: ["engel-sistem"],
  description: "Resim ve URL engel sistemini butonlarla kontrol et.",
  execute: async (client, message, args) => {
    if (!config.bot.ownerId.includes(message.author.id)) {
      return message.reply("❌ Bu komutu sadece bot sahipleri kullanabilir.");
    }

    let data = await EngelAyar.findOne({ guildID: message.guild.id });
    if (!data) {
      data = new EngelAyar({ guildID: message.guild.id });
      await data.save();
    }

    const embed = new EmbedBuilder()
      .setTitle("🛡 Engel Sistemleri")
      .setDescription(
        `📷 **Resim Engelleme:** \`${data.resimEngel ? "Açık" : "Kapalı"}\`\n` +
        `🔗 **URL Engelleme:** \`${data.urlEngel ? "Açık" : "Kapalı"}\``
      )
      .setColor("Blurple");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("resimEngel")
        .setLabel("📷 Resim Engelleme")
        .setStyle(data.resimEngel ? ButtonStyle.Success : ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("urlEngel")
        .setLabel("🔗 URL Engelleme")
        .setStyle(data.urlEngel ? ButtonStyle.Success : ButtonStyle.Danger)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};

