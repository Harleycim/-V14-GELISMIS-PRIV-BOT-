const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'logkur',
  description: 'Sunucu için log sistemini kurar, log kanallarını Harley Logs kategorisine oluşturur.',
  async execute(message, args, client) {
    if (!config.bot.ownerId.includes(message.author.id)) {
  return message.reply('Bu komutu kullanmak için yetkiniz yok.');
}

   
    const yoneticiRol = message.guild.roles.cache.find(r => r.name === '/');
    if (!yoneticiRol) return message.reply('Sunucuda "/" adlı bir rol bulunamadı!');

    
    let category = message.guild.channels.cache.find(c => c.name === 'Harley Logs' && c.type === ChannelType.GuildCategory);
    if (!category) {
      try {
        category = await message.guild.channels.create({
          name: 'Harley Logs',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: message.guild.roles.everyone.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: yoneticiRol.id,
              allow: [PermissionsBitField.Flags.ViewChannel]
            }
          ]
        });
      } catch (err) {
        return message.reply(`Kategori oluşturulamadı: ${err.message}`);
      }
    }

    
    const logChannelsInfo = {
      'ses-log': {
        topic: 'Ses kanalı giriş-çıkış logları',
        color: 'Blue'
      },
      'mesaj-log': {
        topic: 'Mesaj silme ve düzenleme logları',
        color: 'Orange'
      },
      'ban-log': {
        topic: 'Ban logları',
        color: 'DarkRed'
      },
      'kick-log': {
        topic: 'Kick logları',
        color: 'DarkOrange'
      },
      'unban-log': {
        topic: 'Unban logları',
        color: 'Green'
      }
    };

    
    const createdChannels = {};

    for (const [channelName, info] of Object.entries(logChannelsInfo)) {
      let channel = message.guild.channels.cache.find(ch => ch.name === channelName && ch.parentId === category.id);
      if (!channel) {
        try {
          channel = await message.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: info.topic,
            parent: category.id,
            permissionOverwrites: [
              {
                id: message.guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
              },
              {
                id: yoneticiRol.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
              }
            ]
          });
        } catch (err) {
          return message.reply(`\`${channelName}\` kanalı oluşturulamadı: ${err.message}`);
        }
      }
      createdChannels[channelName] = channel;
    }

    message.reply('**Harley Logs kategorisi ve log kanalları başarıyla oluşturuldu.**');

    client.on('voiceStateUpdate', async (oldState, newState) => {
      if (oldState.guild.id !== message.guild.id) return;

      const user = newState.member.user;
      let description = null;

      if (!oldState.channel && newState.channel) {
        description = `${user.tag} ses kanalına katıldı: ${newState.channel.name}`;
      } else if (oldState.channel && !newState.channel) {
        description = `${user.tag} ses kanalından ayrıldı: ${oldState.channel.name}`;
      } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        description = `${user.tag} ses kanalını değiştirdi: ${oldState.channel.name} ➡️ ${newState.channel.name}`;
      }

      if (description) {
        const embed = new EmbedBuilder()
          .setColor(logChannelsInfo['ses-log'].color)
          .setTitle('Ses Kanalı Güncellemesi')
          .setDescription(description)
          .setTimestamp();

        createdChannels['ses-log'].send({ embeds: [embed] }).catch(() => {});
      }
    });

    client.on('messageDelete', async (messageDeleted) => {
      if (!messageDeleted.guild || messageDeleted.guild.id !== message.guild.id) return;
      if (messageDeleted.author?.bot) return;

      const embed = new EmbedBuilder()
        .setColor(logChannelsInfo['mesaj-log'].color)
        .setTitle('Mesaj Silindi')
        .addFields(
          { name: 'Kullanıcı', value: `${messageDeleted.author.tag} (${messageDeleted.author.id})`, inline: true },
          { name: 'Kanal', value: `${messageDeleted.channel}`, inline: true },
          { name: 'Mesaj', value: messageDeleted.content?.slice(0, 1024) || '*İçerik yok*' }
        )
        .setTimestamp();

      createdChannels['mesaj-log'].send({ embeds: [embed] }).catch(() => {});
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
      if (!oldMessage.guild || oldMessage.guild.id !== message.guild.id) return;
      if (oldMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return;

      const embed = new EmbedBuilder()
        .setColor(logChannelsInfo['mesaj-log'].color)
        .setTitle('Mesaj Düzenlendi')
        .addFields(
          { name: 'Kullanıcı', value: `${oldMessage.author.tag} (${oldMessage.author.id})`, inline: true },
          { name: 'Kanal', value: `${oldMessage.channel}`, inline: true },
          { name: 'Eski Mesaj', value: oldMessage.content?.slice(0, 1024) || '*İçerik yok*' },
          { name: 'Yeni Mesaj', value: newMessage.content?.slice(0, 1024) || '*İçerik yok*' }
        )
        .setTimestamp();

      createdChannels['mesaj-log'].send({ embeds: [embed] }).catch(() => {});
    });

    client.on('guildBanAdd', async (ban) => {
      if (ban.guild.id !== message.guild.id) return;

      const embed = new EmbedBuilder()
        .setColor(logChannelsInfo['ban-log'].color)
        .setTitle('Kullanıcı Banlandı')
        .setDescription(`${ban.user.tag} (${ban.user.id}) sunucudan banlandı.`)
        .setTimestamp();

      createdChannels['ban-log'].send({ embeds: [embed] }).catch(() => {});
    });

    client.on('guildBanRemove', async (ban) => {
      if (ban.guild.id !== message.guild.id) return;

      const embed = new EmbedBuilder()
        .setColor(logChannelsInfo['unban-log'].color)
        .setTitle('Ban Kaldırıldı')
        .setDescription(`${ban.user.tag} (${ban.user.id}) banı kaldırıldı.`)
        .setTimestamp();

      createdChannels['unban-log'].send({ embeds: [embed] }).catch(() => {});
    });

    client.on('guildMemberRemove', async (member) => {
      if (member.guild.id !== message.guild.id) return;

      try {
        const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
        const kickLog = auditLogs.entries.first();

        if (kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp) < 5000) {
          const executor = kickLog.executor;
          const reason = kickLog.reason || 'Belirtilmemiş';

          const embed = new EmbedBuilder()
            .setColor(logChannelsInfo['kick-log'].color)
            .setTitle('Kullanıcı Atıldı')
            .setDescription(`${member.user.tag} (${member.user.id}) sunucudan atıldı.`)
            .addFields(
              { name: 'Atan Yetkili', value: `${executor.tag} (${executor.id})`, inline: true },
              { name: 'Sebep', value: reason, inline: true }
            )
            .setTimestamp();

          createdChannels['kick-log'].send({ embeds: [embed] }).catch(() => {});
          return;
        }
      } catch (e) {
        
      }

       
      
      const embed = new EmbedBuilder()
        .setColor('Grey')
        .setTitle('Üye Ayrıldı')
        .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
        .setTimestamp();
      createdChannels['kick-log'].send({ embeds: [embed] }).catch(() => {});
      
    });
  }
};
