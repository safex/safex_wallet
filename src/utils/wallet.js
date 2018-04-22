const os = window.require('os');
const fs = window.require('fs');
const libPath = window.require('path');
const fileDownload = require('react-file-download');

const WALLET_FILENAME = 'safexwallet.dat';
const DEFAULT_WALLET_PATH = libPath.resolve(os.homedir(), WALLET_FILENAME);

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

module.exports = {
    WALLET_FILENAME,
    DEFAULT_WALLET_PATH,
    downloadWallet
};