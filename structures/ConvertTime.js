module.exports = {
    convertTime: function (duration) {
        if (typeof duration !== 'number' || duration < 0) {
            throw new Error('Duration must be a positive number');
        }

        const milliseconds = parseInt((duration % 1000) / 100);
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (duration < 3600000) {
            return `${minutes}:${seconds}`;
        } else {
            return `${hours}:${minutes}:${seconds}`;
        }
    },
    convertNumber: function (number, decPlaces = 2) {
        if (typeof number !== 'number' || number < 0) {
            throw new Error('Number must be a positive number');
        }

        const abbrev = ["K", "M", "B", "T"];
        decPlaces = Math.pow(10, decPlaces);

        for (let i = abbrev.length - 1; i >= 0; i--) {
            const size = Math.pow(10, (i + 1) * 3);

            if (size <= number) {
                number = Math.round(number * decPlaces / size) / decPlaces;

                if (number === 1000 && i < abbrev.length - 1) {
                    number = 1;
                    i++;
                }

                return number + abbrev[i];
            }
        }

        return number.toString();
    },
    chunk: function (arr, size) {
        if (!Array.isArray(arr) || typeof size !== 'number' || size <= 0) {
            throw new Error('Invalid arguments for chunk function');
        }

        const temp = [];
        for (let i = 0; i < arr.length; i += size) {
            temp.push(arr.slice(i, i + size));
        }
        return temp;
    },
    convertHmsToMs: function (hms) {
        if (typeof hms !== 'string' || !/^\d{1,2}(:\d{1,2})?(:\d{1,2})?$/.test(hms)) {
            throw new Error('Invalid H:MM:SS format');
        }

        const parts = hms.split(':').map(Number);

        if (parts.length === 1) {
            return parts[0] * 1000; // SS
        } else if (parts.length === 2) {
            return (parts[0] * 60 + parts[1]) * 1000; // MM:SS
        } else {
            return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000; // HH:MM:SS
        }
    }
};
