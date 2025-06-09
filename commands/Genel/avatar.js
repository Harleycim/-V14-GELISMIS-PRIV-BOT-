const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'avatar',
  aliases: ['av'], 
  description: 'Kendi, belirtilen kullanıcı etiketinin veya ID\'sinin avatarını gösterir.',
  async execute(message, args) {
    let user;

    if (args.length === 0) {
      
      user = message.author;
    } else {
      
      const mention = message.mentions.users.first();
      if (mention) {
        user = mention; 
      } else {
        
        try {
          user = await message.client.users.fetch(args[0]);
        } catch (error) {
          return message.channel.send('Geçersiz kullanıcı ID\'si.');
        }
      }
    }

    
    const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${user.tag} Avatarı`)
      .setImage(avatarUrl);

    message.channel.send({ embeds: [embed] });
  },
};
