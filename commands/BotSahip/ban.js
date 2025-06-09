const { EmbedBuilder } = require("discord.js");
const { bot: { ownerId } } = require("../../config");

module.exports = {
  name: "ban",
  aliases: ["bannaed"],
  description: "Bir veya birden fazla üyeyi banlar.",
  usage: ".ban @user1 @user2 [sebep]",
  execute: async (message, args, client) => {
    if (!ownerId.includes(message.author.id)) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setDescription("❌ Bu komutu sadece bot sahibi kullanabilir.")]
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }

    if (!args.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setDescription("❌ Lütfen banlanacak kullanıcıları etiketleyin veya ID'sini yazın ve isterseniz sebep belirtin.\n\n**Örnek:** `.ban @user1 12345678901234567 spam`")]
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }

    
    const userArgs = [];
    let sebepIndex = args.length;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.match(/^<@!?(\d+)>$/) || /^\d{17,19}$/.test(arg)) {
        userArgs.push(arg);
      } else {
        sebepIndex = i;
        break;
      }
    }

    let sebep = "Sebep belirtilmedi.";
    if (sebepIndex < args.length) {
      sebep = args.slice(sebepIndex).join(" ");
    }

    if (!userArgs.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setDescription("❌ Geçerli kullanıcılar bulunamadı. Lütfen geçerli bir kullanıcı etiketi veya ID'si girin.")]
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }

    const membersToBan = [];

    for (const arg of userArgs) {
      const id = arg.replace(/[<@!>]/g, "");
      let member = message.guild.members.cache.get(id);
      if (!member) {
        try {
          member = await message.guild.members.fetch(id);
        } catch {
          
        }
      }
      if (member) membersToBan.push(member);
    }

    if (!membersToBan.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setDescription("❌ Geçerli kullanıcılar bulunamadı.")]
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }

    let banSayisi = 0;

    for (const member of membersToBan) {
      if (member.bannable) {
        try {
          await member.ban({ reason: sebep });
          banSayisi++;
        } catch (error) {
          await message.channel.send({
            embeds: [new EmbedBuilder()
              .setColor("Red")
              .setDescription(`❌ ${member.user.tag} banlanamadı: \`${error.message}\``)]
          }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
      } else {
        await message.channel.send({
          embeds: [new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ ${member.user.tag} banlanamaz.`)]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
      }
    }

    return message.channel.send({
      embeds: [new EmbedBuilder()
        .setTitle("✅ Ban İşlemi Tamamlandı")
        .setColor("Green")
        .addFields(
          { name: "🔨 Banlanan Kullanıcı Sayısı", value: `${banSayisi.toString()}`, inline: true },
          { name: "📝 Sebep", value: sebep || "Belirtilmedi.", inline: true },
          { name: "👮 İşlem Yapan", value: message.author.tag }
        )
        .setTimestamp()]
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
  }
};
