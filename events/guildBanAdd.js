module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    const logChannel = ban.guild.channels.cache.find(c => c.name === "ban-log");
    if (!logChannel) return;

    logChannel.send(`🔨 ${ban.user.tag} sunucudan **banlandı**.`);
  }
};
