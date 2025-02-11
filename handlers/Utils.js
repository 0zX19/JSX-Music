const { EmbedBuilder } = require("discord.js");

module.exports = class Utils {
    constructor(client) {
        this.client = client;
    }

    duration(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60)),
            minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60)),
            seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        const h = hours > 0 ? String(hours).padStart(2, '0') : '00';
        const m = minutes > 0 ? String(minutes).padStart(2, '0') : '00';
        const s = String(seconds).padStart(2, '0');

        if (hours === 0 && minutes === 0) {
            return `00:${s}`;
        } else if (hours === 0) {
            return `${m}:${s}`;
        } else {
            return `${h}:${m}:${s}`;
        }
    }

    msToTime(duration) {
        const milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        const h = hours > 0 ? `${hours}h ` : '';
        const m = minutes > 0 ? `${minutes}m ` : '';
        const s = seconds > 0 ? `${seconds}s ` : '';
        const ms = milliseconds > 0 && duration < 1000 ? `${milliseconds}ms` : '';

        return `${h}${m}${s}${ms}`.trim();
    }
};
