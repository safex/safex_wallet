var bitcoin = window.require('bitcoinjs-lib');
var bs58 = require('bs58');
import { toHexString } from './utils';

module.exports = {
    genkey: function() {
        var random_array = new Uint8Array(32);
        window.crypto.getRandomValues(random_array);
        var priv_key_bytes = [];

        for (var i = 0; i < random_array.length; ++i) {
            priv_key_bytes[i] = random_array[i];
        }

        var hex_string = toHexString(priv_key_bytes).toUpperCase();

        var priv_key_and_version = "80" + hex_string;
        var first_bytes = Buffer.from(priv_key_and_version, 'hex');
        var first_sha = bitcoin.crypto.sha256(first_bytes);
        var second_sha = bitcoin.crypto.sha256(first_sha);
        var checksum = toHexString(second_sha).substr(0, 8).toUpperCase();
        var key_with_checksum = priv_key_and_version + checksum;

        var final_bytes = Buffer.from(key_with_checksum, 'hex');
        var priv_key_wif = bs58.encode(final_bytes);

        var key_pair = bitcoin.ECPair.fromWIF(priv_key_wif);
        return key_pair;
    }

}