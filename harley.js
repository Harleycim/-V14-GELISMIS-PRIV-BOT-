const { 
  Client, 
  GatewayIntentBits, 
  Events, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  EmbedBuilder 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');
const discordLogs = require("discord-logs");
const Afk = require('./models/afk');
const OzelKomut = require('./models/OzelKomut');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates
  ]
});

discordLogs(client);


mongoose.connect(config.bot.mongoURL)
  .then(() => console.log('MongoDB bağlantısı kuruldu.'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

const komutlar = new Map();

function komutlariYukle(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      komutlariYukle(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const komut = require(fullPath);
        if (komut.name) {
          komutlar.set(komut.name, komut);
          if (komut.aliases) komut.aliases.forEach(alias => komutlar.set(alias, komut));
        } else {
          console.error(`Komut dosyasında eksik alan: ${fullPath}`);
        }
      } catch (err) {
        console.error(`Komut yüklenirken hata oluştu: ${fullPath}`, err);
      }
    }
  }
}

komutlariYukle(path.join(__dirname, 'commands'));

console.log('Komutlar yüklendi');
console.log('Events yüklendi');


const afkData = new Map();



client.once('ready', async () => {
  console.log(`Bot aktif: ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: 'Harleywashere?',
        type: 0
      }
    ],
    status: 'dnd'
  });

  
  try {
    const channel = await client.channels.fetch(config.bot.sesKanaliId);
    if (!channel || !channel.isVoiceBased()) {
      console.error('Ses kanalı bulunamadı veya ses kanalı değil.');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    console.log('Ses kanalına başarıyla bağlanıldı!');
  } catch (error) {
    console.error('Ses kanalına bağlanırken hata oluştu:', error);
  }
});


client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (afkData.has(message.author.id)) {
    const data = afkData.get(message.author.id);
    try {
      const member = message.member;
      if (member && member.nickname && member.nickname.startsWith('[AFK] ')) {
        await member.setNickname(data.eskiIsim || null).catch(() => { });
      }
    } catch (e) {}
    afkData.delete(message.author.id);
    const afkKaldirMesaji = await message.channel.send(`${message.author}, artık AFK değilsin!`);
    setTimeout(() => afkKaldirMesaji.delete().catch(() => { }), 10000);
  }

  if (message.mentions.users.size > 0) {
    for (const [id, data] of afkData) {
      if (message.mentions.users.has(id)) {
        const diffMs = Date.now() - data.zaman.getTime();
        const diffSaat = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDakika = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSaniye = Math.floor((diffMs % (1000 * 60)) / 1000);

        const afkMesaj = `${message.mentions.users.get(id)} kullanıcısı şu sebeple AFK: **${data.sebep}** (AFK: ${diffSaat} saat, ${diffDakika} dakika, ${diffSaniye} saniye önce)`;
        const afkReply = await message.channel.send(afkMesaj);
        setTimeout(() => afkReply.delete().catch(() => { }), 10000);
      }
    }
  }

  if (message.channel.id === config.bot.chatId) {
    config.iltifat.mesajSayaci = config.iltifat.mesajSayaci || 0;
    config.iltifat.mesajSayaci++;

    if (config.iltifat.mesajSayaci >= config.iltifat.aralik) {
      config.iltifat.mesajSayaci = 0;
      const randomIndex = Math.floor(Math.random() * config.iltifat.liste.length);
      const iltifat = config.iltifat.liste[randomIndex];
      const taggedUser = message.mentions.users.first() || message.author;
      const sent = await message.channel.send(`**${taggedUser}** ${iltifat}`);
      setTimeout(() => sent.delete().catch(() => { }), 25000);
    }
  }

  if (!message.content.startsWith(config.bot.prefix)) return;
  const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const komut = komutlar.get(cmdName);
  if (komut) {
    try {
      await komut.execute(message, args, client);
    } catch (err) {
      console.error('Komut çalıştırılırken hata oluştu:', err);
      const hata = await message.reply('❌ Komut işlenirken hata oluştu!');
      setTimeout(() => {
        message.delete().catch(() => { });
        hata.delete().catch(() => { });
      }, 5000);
    }
    return;
  }

  const ozel = await OzelKomut.findOne({ name: cmdName });
  if (!ozel) return;

  const role = message.guild.roles.cache.get(ozel.roleId);
  if (!role) {
    const errMsg = await message.reply('❌ Tanımlı rol bulunamadı.');
    setTimeout(() => {
      message.delete().catch(() => { });
      errMsg.delete().catch(() => { });
    }, 5000);
    return;
  }

  let member = message.mentions.members.first();
  if (!member && args[0]) {
    member = await message.guild.members.fetch(args[0]).catch(() => null);
  }
  if (!member) member = message.member;

  try {
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      const reply = await message.reply(`🗑️ ${member} kullanıcısından <@&${role.id}> rolü alındı.`);
      setTimeout(() => {
        message.delete().catch(() => { });
        reply.delete().catch(() => { });
      }, 5000);
    } else {
      await member.roles.add(role);
      const reply = await message.reply(`✅ ${member} kullanıcısına <@&${role.id}> rolü verildi.`);
      setTimeout(() => {
        message.delete().catch(() => { });
        reply.delete().catch(() => { });
      }, 5000);
    }
  } catch (err) {
    console.error('Rol işlemi başarısız:', err);
    const fail = await message.reply('❌ Rol işlemi gerçekleştirilemedi.');
    setTimeout(() => {
      message.delete().catch(() => { });
      fail.delete().catch(() => { });
    }, 7000);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    const customId = interaction.customId;

    if (customId.startsWith('duzenle_')) {
      const name = customId.replace('duzenle_', '');
      const komut = await OzelKomut.findOne({ name });
      if (!komut) return interaction.reply({ content: '❌ Komut bulunamadı.', ephemeral: true });

      const modal = new ModalBuilder()
        .setCustomId(`modal_duzenle_${name}`)
        .setTitle(`Komut Düzenle: ${name}`);

      const input = new TextInputBuilder()
        .setCustomId('yeni')
        .setLabel('Yeni Rol ID')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(komut.roleId);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    if (customId.startsWith('sil_')) {
      const name = customId.replace('sil_', '');
      await OzelKomut.deleteOne({ name });
      return interaction.reply({ content: `🗑️ \`${name}\` komutu silindi.`, ephemeral: true });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_duzenle_')) {
    const name = interaction.customId.replace('modal_duzenle_', '');
    const value = interaction.fields.getTextInputValue('yeni');

    await OzelKomut.updateOne({ name }, { roleId: value }, { upsert: true });
    return interaction.reply({ content: `✅ \`${name}\` güncellendi.`, ephemeral: true });
  }
});


client.on('guildMemberAdd', async (member) => {
  const kanal = member.guild.channels.cache.get(config.bot.chatId);
  if (!kanal) return;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('Yeni Üye Katıldı!')
    .setDescription(config.messages.hosgeldinMesaji.replace('{user}', `<@${member.id}>`))
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  try {
    const mesaj = await kanal.send({ embeds: [embed] });
    setTimeout(() => {
      mesaj.delete().catch(() => { });
    }, 20000);
  } catch (err) {
    console.error('Hoşgeldin mesajı gönderilemedi:', err);
  }

  try {
    const rol = member.guild.roles.cache.get(config.roles.uyerolId);
    if (rol) {
      await member.roles.add(rol);
    }
  } catch (e) {
    console.error('Otomatik rol verilirken hata oluştu:', e);
  }
});


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args));
  } else {
    console.warn(`[UYARI] ${file} event dosyasında 'name' veya 'execute' tanımı eksik.`);
  }
}

client.login(config.bot.token);
