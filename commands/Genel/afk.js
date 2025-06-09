const Afk = require('../../models/afk');

module.exports = {
  name: 'afk',
  description: 'AFK moduna girersiniz.',
  aliases: ['away'],

  async execute(message, args) {
    const reason = args.join(' ') || 'AFK';

    const member = message.member;
    if (!member.manageable) return message.reply('İsmim değiştiremiyorum.');

    const existing = await Afk.findOne({ userId: member.id, guildId: message.guild.id });
    if (existing) return message.reply('Zaten AFK durumundasınız.');

    const oldNickname = member.nickname || member.user.username;

    try {
      await member.setNickname(`[AFK] ${oldNickname}`);
    } catch {}

    await Afk.create({
      userId: member.id,
      guildId: message.guild.id,
      reason,
      oldNickname,
      afkAt: new Date()
    });

    message.reply(`Başarıyla AFK moduna girdiniz. Sebep: **${reason}**`);
  }
};
