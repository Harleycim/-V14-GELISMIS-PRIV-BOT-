const fs = require('fs');
const path = require('path');
const Afk = require('../models/afk');
const config = require('../config'); 

module.exports = {
  name: 'messageCreate',
  async execute(message, client, komutlar) {
    if (message.author.bot || !message.guild) return;

    
    const afkUser = await Afk.findOne({ userId: message.author.id, guildId: message.guild.id });
    if (afkUser) {
      const member = message.member;

      if (member.manageable && member.nickname && member.nickname.startsWith('[AFK]')) {
        try {
          await member.setNickname(afkUser.oldNickname || member.user.username);
        } catch {}
      }

      await Afk.deleteOne({ userId: message.author.id, guildId: message.guild.id });

      message.reply('Artık AFK değilsin! Tekrar hoşgeldin.').catch(() => {});
    }

    
    message.mentions.users.forEach(async (user) => {
      if (user.id === message.author.id) return;

      const afk = await Afk.findOne({ userId: user.id, guildId: message.guild.id });
      if (afk) {
        const diff = Date.now() - afk.afkAt.getTime();
        const saat = Math.floor(diff / (1000 * 60 * 60));
        const dakika = Math.floor((diff / (1000 * 60)) % 60);
        const saniye = Math.floor((diff / 1000) % 60);

        message.channel.send(`${user.tag} şu anda AFK: **${afk.reason}** (AFK süresi: ${saat} saat, ${dakika} dakika, ${saniye} saniye)`).catch(() => {});
      }
    });

    
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();

    const komut = komutlar.get(cmdName);
    if (komut) {
      try {
        await komut.execute(message, args, client);
      } catch (err) {
        console.error('Komut hata:', err);
        message.react('❌').catch(() => {});
      }
      return;
    }

    const dataDir = path.join(__dirname, 'data');
    const ozelPath = path.join(dataDir, 'ozelkomutlar.json');
    let ozel = {};
    try {
      ozel = JSON.parse(fs.readFileSync(ozelPath, 'utf8'));
    } catch (e) {
      console.error('Özel komut dosyası okunamadı:', e);
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(ozel, cmdName)) return;

    const roleId = ozel[cmdName];
    const role = message.guild.roles.cache.get(roleId);
    if (!role) {
      console.error(`Rol bulunamadı: ${roleId}`);
      message.react('❌').catch(() => {});
      return;
    }

    let member = message.mentions.members.first();
    if (!member && args[0]) {
      member = await message.guild.members.fetch(args[0]).catch(() => null);
    }
    if (!member) member = message.member;

    member.roles.add(role)
      .then(() => message.react('✅').catch(() => {}))
      .catch(err => {
        console.error('Rol verilemedi:', err);
        message.react('❌').catch(() => {});
      });
  }
};
