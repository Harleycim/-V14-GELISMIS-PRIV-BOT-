module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const logChannel = oldState.guild.channels.cache.find(c => c.name === "ses-log");
    if (!logChannel) return;

    if (!oldState.channel && newState.channel) {
      logChannel.send(`🔊 ${newState.member.user.tag} ses kanalına katıldı: **${newState.channel.name}**`);
    } else if (oldState.channel && !newState.channel) {
      logChannel.send(`🔇 ${oldState.member.user.tag} ses kanalından ayrıldı: **${oldState.channel.name}**`);
    } else if (oldState.channelId !== newState.channelId) {
      logChannel.send(`🔄 ${oldState.member.user.tag} ses kanalını değiştirdi: **${oldState.channel.name}** → **${newState.channel.name}**`);
    }
  }
};
