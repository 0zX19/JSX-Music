const delay = require("delay");
const { PermissionsBitField } = require("discord.js");

module.exports = async (client, oldState, newState) => {
    const player = client.manager?.players.get(newState.guild.id);
    if (!player) return;

    const botMember = newState.guild.members.cache.get(client.user.id);

    // Periksa apakah bot tidak berada di voice channel, hancurkan player jika tidak
    if (!botMember.voice.channelId) {
        const currentTrack = player.queue.current;
        const trackPosition = player.position;

        player.destroy();
        player.autoResume = { track: currentTrack, position: trackPosition };
        return;
    }

    // Jika bot berada di stage channel, pastikan bot menjadi speaker
	if (newState.channelId && newState.channel.type == 13 && newState.guild.members.me.voice.suppress) {
		if (newState.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak) || (newState.channel && newState.channel.permissionsFor(nS.guild.members.me).has(PermissionsBitField.Flags.Speak))) {
			
			await delay(2000);
			
			newState.guild.members.me.voice.setSuppressed(false);
		}
	}


    // Jika bot meninggalkan voice channel, hancurkan player dan simpan track untuk auto-resume
    if (oldState.id === client.user.id || !botMember.voice.channelId) return;
    if (player.twentyFourSeven && player.queue.current) return;

    // Ketika semua anggota non-bot meninggalkan channel, bot akan menunggu sebelum keluar
    if (botMember.voice.channelId === oldState.channelId) {
        const nonBotMembers = oldState.guild.members.me.voice.channel.members.filter(
            (m) => !m.user.bot
        ).size;

        if (nonBotMembers === 0) {
            await delay(client.config.LEAVE_TIMEOUT || 60000); // Default timeout 60 detik

            const vcMembers = oldState.guild.members.me.voice.channel?.members.size;

            if (!vcMembers || vcMembers === 1) {
                const currentTrack = player.queue.current;
                const trackPosition = player.position;

                player.destroy();
                player.autoResume = { track: currentTrack, position: trackPosition };

                return;
            }
        }
    }

    // Auto-resume jika bot kembali terhubung
    if (player.autoResume) {
        const { track, position } = player.autoResume;

        // Hapus state auto-resume
        player.autoResume = null;

        // Resume track dari posisi terakhir
        if (track && typeof position === "number") {
            try {
                player.connect();
                if (!player.queue.current) player.queue.add(track); // Hindari duplikasi track
                await player.play();
                player.seek(position); // Lanjutkan dari posisi sebelumnya
            } catch (error) {
                console.error('Gagal auto-resume:', error);
            }
        }
    }
};
