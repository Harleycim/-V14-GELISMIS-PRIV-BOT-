const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'unban',
  aliases: [],
  async execute(message, args, client) {
    // Sadece bot sahibi kullanabilsin
    if (!config.bot.ownerId.includes(message.author.id)) {
      return message.reply('❌ Bu komutu sadece bot sahibi kullanabilir.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('❌ Lütfen banını kaldırmak istediğin kullanıcının ID\'sini gir.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    try {
      const ban = await message.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        return message.reply('❌ Bu ID ile yasaklı bir kullanıcı bulunamadı.')
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
      }

      await message.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setTitle('Ban Kaldırıldı')
        .setColor('Green')
        .addFields(
          { name: '👤 Kullanıcı ID', value: `\`${userId}\`` },
          { name: '✅ İşlem Yapan', value: `${message.author.tag}` }
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embed] })
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));

    } catch (err) {
      console.error('Unban komutu hatası:', err);
      return message.reply('❌ Ban kaldırılırken bir hata oluştu.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }
  }
};
