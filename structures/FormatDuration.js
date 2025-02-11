const { convertTime } = require('./ConvertTime.js');

module.exports = (duration) => {
    // Validasi input
    if (typeof duration === 'undefined' || isNaN(duration)) return '00:00';

    // Jika durasi lebih dari 1000 jam, kembalikan 'Live'
    if (duration > 3600000000) return 'Live';

    // Pastikan convertTime hanya dipanggil dengan parameter yang valid
    try {
        return convertTime(duration); // Memanggil dengan satu parameter saja
    } catch (error) {
        console.error('Error in convertTime:', error);
        return '00:00'; // Default fallback
    }
};
