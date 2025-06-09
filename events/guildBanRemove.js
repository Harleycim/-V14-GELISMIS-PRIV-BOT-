module.exports = {
  name: 'guildBanRemove',
  async execute(ban) {
    const logChannel = ban.guild.channels.cache.find(c => c.name === "unban-log");
    if (!logChannel) return;

    logChannel.send(`♻️ ${ban.user.tag} sunucudan **banı kaldırıldı**.`);
  }
};
