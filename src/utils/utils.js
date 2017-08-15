import crypto from 'crypto';

module.exports = {
    bytesToHex: function (bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join("");
    },

    toHexString: function (byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    },
    encrypt: function (text, algorithm, password) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt: function (text, algorithm, password) {
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    },

    safexPayload: function (amount) {
        const prefix = 'omni';
        const payload = padZeroes16(toHex(56)) + padZeroes16(toHex(amount));

        return new Buffer.concat([new Buffer(prefix), new Buffer(payload, 'hex')]);

        function toHex(num) {
            return (num).toString(16);
        }

        function padZeroes16(str) {
            var result = str,
                left = 16 - str.length;

            if (left < 0) {
                throw new Error('invalid amount');
            }

            for (let i = left; i--;) {
                result = '0' + result;
            }

            return result;
        }
    }

}