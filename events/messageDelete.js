const Snipe = require('../models/snipe');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot || !message.content) return;

    await Snipe.findOneAndUpdate(
      { guildId: message.guild.id, channelId: message.channel.id },
      {
        guildId: message.guild.id,
        channelId: message.channel.id,
        message: {
          content: message.content,
          authorId: message.author.id,
          authorTag: message.author.tag,
          authorAvatar: message.author.displayAvatarURL({ dynamic: true }),
          timestamp: new Date()
        }
      },
      { upsert: true }
    );
  }
};
