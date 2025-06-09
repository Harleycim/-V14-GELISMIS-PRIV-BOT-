module.exports = {
    name: 'sil',
    description: 'Belirtilen kadar mesajı siler (en fazla 100)',
    async execute(message, args) {
      
      if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın.');
      }
  
      const miktar = parseInt(args[0], 10);
  
      if (isNaN(miktar) || miktar < 1 || miktar > 100) {
        return message.reply('Lütfen 1 ile 100 arasında geçerli bir sayı girin.');
      }
  
      try {
        await message.channel.bulkDelete(miktar, true);
        const reply = await message.channel.send(`**${miktar} mesaj silindi.**`);
        setTimeout(() => reply.delete().catch(() => {}), 5000); 
      } catch (err) {
        console.error('Mesajlar silinirken hata oluştu:', err);
        message.reply('Mesajlar silinirken bir hata oluştu.');
      }
    }
  };
  