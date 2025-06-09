const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'ship',
  description: 'Sunucudan rastgele biriyle seni eşleştirir veya etiketlediğin/ID verdiğin kişiyle eşleştirir ve görsel gönderir',
  async execute(message, args) {
    try {
      const user1 = message.author;
      let user2;

      // 1. Öncelik: Etiketli kullanıcı
      if (message.mentions.users.size > 0) {
        user2 = message.mentions.users.first();
      }

      // 2. Etiket yoksa, ID girilmiş olabilir
      else if (args[0]) {
        try {
          const fetched = await message.client.users.fetch(args[0]);
          if (fetched && !fetched.bot && fetched.id !== user1.id) {
            user2 = fetched;
          }
        } catch (err) {
          console.warn('ID ile kullanıcı bulunamadı:', args[0]);
        }
      }

      // 3. Hâlâ yoksa, rastgele bir kullanıcı seç
      if (!user2) {
        const guild = message.guild;
        const members = await guild.members.fetch();

        const nonBotMembers = members.filter(member =>
          !member.user.bot && member.id !== user1.id
        );

        if (nonBotMembers.size === 0) {
          return message.reply("Bu sunucuda eşleşebileceğin kimse yok :(");
        }

        user2 = nonBotMembers.random().user;
      }

      // Aşk oranını rastgele belirle
      const lovePercentage = Math.floor(Math.random() * 100) + 1;

      // Canvas oluştur
      const canvas = Canvas.createCanvas(700, 250);
      const ctx = canvas.getContext('2d');

      const background = await Canvas.loadImage('../../assets/10.png');
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatar1 = await Canvas.loadImage(user1.displayAvatarURL({ extension: 'png' }));
      const avatar2 = await Canvas.loadImage(user2.displayAvatarURL({ extension: 'png' }));

      const heart = lovePercentage >= 50
        ? await Canvas.loadImage('../../assets/kalp.png')
        : await Canvas.loadImage('../../assets/kalp2.png');

      ctx.drawImage(avatar1, 50, 25, 200, 200);
      ctx.drawImage(avatar2, 450, 25, 200, 200);
      ctx.drawImage(heart, 275, 75, 150, 100);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'ship.png' });

      message.channel.send({
        content: `**${user1.username}** ❤️ **${user2.username}** eşleşti!\nAşk oranı: **${lovePercentage}%**`,
        files: [attachment]
      });

    } catch (err) {
      console.error('Bir hata oluştu:', err);
      message.reply('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
};
