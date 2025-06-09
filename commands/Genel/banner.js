module.exports = {
  name: 'banner',
  description: 'Kendi, belirtilen kullanıcı etiketinin veya ID\'sinin bannerını gösterir.',
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

    try {
      const userBannerURL = await user.fetch(true); 
      if (!userBannerURL.banner) {
        return message.channel.send(`${user.tag} için bir banner bulunmamaktadır.`);
      }

      const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${userBannerURL.banner}?size=1024`;

      
      const embed = {
        color: 0x0099ff,
        title: `${user.tag} Bannerı`,
        image: {
          url: bannerUrl,
        },
      };

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.channel.send('Bir hata oluştu veya banner bulunamadı.');
    }
  },
};
