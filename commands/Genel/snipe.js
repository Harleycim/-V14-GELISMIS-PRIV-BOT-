const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Snipe = require('../../models/Snipe');

module.exports = {
  name: "snipe",
  description: "Silinen son mesajı havalı bir şekilde gösterir.",
  async execute(message, args, client) {
    const data = await Snipe.findOne({ guildId: message.guild.id, channelId: message.channel.id });
    if (!data) {
      return message.reply("😕 Bu kanalda silinen bir mesaj bulunamadı.")
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: data.message.authorTag, iconURL: data.message.authorAvatar })
      .setDescription(`🗑️ **Silinen Mesaj:**\n> ${data.message.content}`)
      .addFields(
        { name: "👤 Yazan Kişi", value: `<@${data.message.authorId}>`, inline: true },
        { name: "🕒 Silinme Zamanı", value: `<t:${Math.floor(new Date(data.message.timestamp).getTime() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `Bu mesaj 10 saniye sonra yok olacak...` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("refresh_snipe")
        .setLabel("Yenile")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔄")
        .setDisabled(true)
    );

    const sent = await message.reply({ embeds: [embed], components: [row] });

    setTimeout(() => {
      sent.delete().catch(() => {});
    }, 10000);
  }
};
