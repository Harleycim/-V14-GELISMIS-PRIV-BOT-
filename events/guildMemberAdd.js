const config = require("../config");

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const uyerolId = config.uyerolId;
      if (!uyerolId) return;

      const role = member.guild.roles.cache.get(uyerolId);
      if (!role) {
        console.error(`Otomatik rol bulunamadı: ${uyerolId}`);
        return;
      }

      await member.roles.add(role);
      console.log(`${member.user.tag} kullanıcısına otomatik rol verildi.`);
    } catch (err) {
      console.error('Otomatik rol verme hatası:', err);
    }
  }
};
