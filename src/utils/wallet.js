import { decrypt } from './utils';

const os = window.require('os');
const fs = window.require('fs');
const libPath = window.require('path');
const fileDownload = require('react-file-download');

const WALLET_FILENAME = 'safexwallet.dat';
const DEFAULT_WALLET_PATH = libPath.resolve(os.homedir(), WALLET_FILENAME);

/**
 * Load wallet from given path on HDD and offer it as download to user. Calls back with error
 * that is suitable to be shown to the user.
 * @param walletPath
 * @param callback
 */
function downloadWallet(walletPath, callback) {
    fs.readFile(walletPath, (err, fd) => {
        if (err) {
            console.error(err);
            return callback(new Error(`Failed to download wallet from ${walletPath}: ${err.message}`));
        }
    
        const date = Date.now();
        fileDownload(fd, `${date}_${WALLET_FILENAME}`);
        return callback(null, fd);
    });
}

/**
 * Decrypt wallet from given encrypted text and password. It defaults to values from local storage.
 * Throws error in case decryption fails. Calling code should catch errors and display message to the user.
 * @param [encryptedWallet]
 * @param [password]
 */
function decryptWalletData(encryptedWallet = null, password = null) {
    encryptedWallet = encryptedWallet || localStorage.getItem('encrypted_wallet');
    password = password || localStorage.getItem('password');
    
    if (!encryptedWallet) {
        throw new Error(`Empty wallet data`);
    }
    
    const algorithm = 'aes-256-ctr';
    const decryptedWallet = decrypt(encryptedWallet, algorithm, password);
    
    let parsedWallet;
    try {
        parsedWallet = JSON.parse(decryptedWallet);
    }
    catch (e) {
        // This means we got an invalid JSON. Wrong password or corrupted file (no way to know?)
        throw new Error(`Invalid password or corrupted wallet data`);
    }
    
    if (!parsedWallet || parsedWallet['version'] !== '1') {
        // We got correct decrypt, but wallet is in some unsupported format
        throw new Error(`Invalid wallet format (expected v1)`);
    }
    
    return parsedWallet;
}

module.exports = {
    WALLET_FILENAME,
    DEFAULT_WALLET_PATH,
    downloadWallet,
    decryptWalletData
};