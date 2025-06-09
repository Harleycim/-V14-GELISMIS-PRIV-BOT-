const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const EngelAyar = require("../models/engelAyar");
const config = require("../config");

module.exports = {
  name: "interactionCreate",
  /**
   * 
   * @param {import("discord.js").Interaction} interaction 
   * @param {import("discord.js").Client} client 
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (!config.bot.ownerId.includes(interaction.user.id)) {
      return interaction.reply({ content: "❌ Bu butonları sadece bot sahipleri kullanabilir.", ephemeral: true });
    }

    const guildId = interaction.guild.id;
    let data = await EngelAyar.findOne({ guildID: guildId });
    if (!data) {
      data = new EngelAyar({ guildID: guildId });
    }

    if (interaction.customId === "resimEngel") {
      data.resimEngel = !data.resimEngel;
    } else if (interaction.customId === "urlEngel") {
      data.urlEngel = !data.urlEngel;
    }

    await data.save();

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

    interaction.update({ embeds: [embed], components: [row] });
  }
};
