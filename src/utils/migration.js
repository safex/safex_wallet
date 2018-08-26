

var btc = require('bitcoinjs-lib');

function generateSafexKeys() {

}


function getUTXO(address) {
    let utxos = fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/utxo')
        .then(resp => resp.json())
        .then((resp) => {
            return resp
        });

}


//standard BTC Blockchain Safex transaction
function generateSafexBtcTransaction() {

}


//set the public key to where you want safex tokens sent to and safex cash
function setSafexMigrationPublicKey() {

}




function generateSafexTokenTransaction() {

}



function generateSafexCashTransaction() {

}

//this should only be set if the public address has been set
function generateSafexMigrationTransaction() {

}


function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}


/*
    Omni Payload creation helper functions This emulates the "Simple Send" Payload
 */

const padZeroes = String.prototype.padStart
    ? (str, length) => str.padStart(length, '0')
    : (str, length) => Array(length - str.length).join('0') + str;

function createSafexPayload(propertyId, amount) {
    return (
        '6f6d6e6900000000' +
        padZeroes(propertyId.toString(16), 8) +
        padZeroes(amount.toString(16), 16)
    );
}

function createSafexPayloadBuffer(propertyId, amount) {
    return Buffer.from(createSafexPayload(propertyId, amount), 'hex');
}


function createSafexAddressPayload(safex_address) {
    return '7361666578';
}

function createSafexAddressPayloadBuffer(safex_address) {
    return Buffer.from(createSafexAddressPayload(safex_address), 'hex');
}
/*
    End Omni Payload Helper Functions
 */



module.exports = {
    getUTXO
};