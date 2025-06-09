const config = require('../../config');
const OzelKomut = require('../../models/OzelKomut');

module.exports = {
    name: 'özelkomut',
    description: 'Rol atayan özel komutları ayarla (MongoDB)',
    async execute(message, args) {
        
        if (!config.bot.ownerId.includes(message.author.id)) {
            const reply = await message.reply('❌ Bu komutu sadece yetkili kişiler kullanabilir.');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 5000);
            return;
        }

        const subCommand = args[0];

        if (subCommand === 'ekle') {
            const komutAdi = args[1];
            const rol = message.mentions.roles.first();
            if (!komutAdi || !rol) {
                const yanit = await message.reply('Kullanım: `.özelkomut ekle <komutAdı> @Rol`');
                setTimeout(() => {
                    message.delete().catch(() => {});
                    yanit.delete().catch(() => {});
                }, 7000);
                return;
            }

            await OzelKomut.findOneAndUpdate(
                { name: komutAdi },
                { roleId: rol.id },
                { upsert: true, new: true }
            );

            const yanit = await message.reply(`✅ \`${komutAdi}\` komutu artık <@&${rol.id}> rolünü veriyor.`);
            setTimeout(() => {
                message.delete().catch(() => {});
                yanit.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (subCommand === 'sil') {
            const komutAdi = args[1];
            const silinen = await OzelKomut.findOneAndDelete({ name: komutAdi });

            if (!silinen) {
                const yanit = await message.reply('❌ Böyle bir özel komut yok.');
                setTimeout(() => {
                    message.delete().catch(() => {});
                    yanit.delete().catch(() => {});
                }, 5000);
                return;
            }

            const yanit = await message.reply(`🗑️ \`${komutAdi}\` özel komutu silindi.`);
            setTimeout(() => {
                message.delete().catch(() => {});
                yanit.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (subCommand === 'liste') {
            const komutlar = await OzelKomut.find({});
            if (komutlar.length === 0) {
                const yanit = await message.reply('📭 Hiç özel komut yok.');
                setTimeout(() => {
                    message.delete().catch(() => {});
                    yanit.delete().catch(() => {});
                }, 7000);
                return;
            }

            let liste = '';
            for (const k of komutlar) {
                liste += `\`${k.name}\` → <@&${k.roleId}>\n`;
            }

            const yanit = await message.reply(`📜 Özel Komutlar:\n${liste}`);
            setTimeout(() => {
                message.delete().catch(() => {});
                yanit.delete().catch(() => {});
            }, 15000);
            return;
        }

        const yanit = await message.reply(
            '**Kullanım:**\n' +
            '`.özelkomut ekle <komut> @Rol`\n' +
            '`.özelkomut sil <komut>`\n' +
            '`.özelkomut liste`'
        );
        setTimeout(() => {
            message.delete().catch(() => {});
            yanit.delete().catch(() => {});
        }, 10000);
    }
};
