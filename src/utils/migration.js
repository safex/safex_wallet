

var bitcoin = require('bitcoinjs-lib');

function generateSafexKeys() {

}


function get_utxos(address) {
   return new Promise ((resolve, reject) => {
       fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/utxo')
           .then((resp) => resp.json())
           .then(resp => resolve(resp))
           .catch(err => reject(err))
   });
}

// TODO: byte size of transaction based fee
//standard BTC Blockchain Safex transaction
function generateSafexBtcTransaction(utxos, destination, wif, amount, fee) {
    let key = bitcoin.ECPair.fromWIF(wif);
    var running_total = 0;
    var tx = new bitcoin.TransactionBuilder();
    var inputs_num = 0;
    utxos.forEach(txn => {
        if (running_total < (700 + fee)) {
            running_total += txn.satoshis;
            tx.addInput(txn.txid, txn.vout);
            inputs_num += 1;
        }
    });
    tx.addOutput(destination, 700);

    var btc_remaining = (running_total - (700 + fee));
    if (btc_remaining > 0) {
        tx.addOutput(key.publicKey, btc_remaining);
    }

    if (amount <= 0.1) {
        console.log('Transaction not processed - Amount is too low.');
        return;
    }



    const payload = createSafexPayloadBuffer(56, amount);
    console.log("made the payload " , payload)

    const dataScript = bitcoin.payments.embed({ data: [payload] })


    console.log("generated datascript")
    tx.addOutput(dataScript.output, 1000);


    for (var i = 0; i < inputs_num; i++) {
        tx.sign(i, key);
    }

    var json = {};
    json['rawtx'] = tx.build().toHex();
    console.log(json)

}


//set the public key to where you want safex tokens sent to and safex cash
function setSafexMigrationPublicKey(utxos, destination, wif, amount, fee) {
    let key = bitcoin.ECPair.fromWIF(wif);
    var running_total = 0;
    var tx = new bitcoin.TransactionBuilder();
    var inputs_num = 0;
    utxos.forEach(txn => {
        if (running_total < (700 + fee)) {
            running_total += txn.satoshis;
            tx.addInput(txn.txid, txn.vout);
            inputs_num += 1;
        }
    });
    tx.addOutput(destination, 700);

    var btc_remaining = (running_total - (700 + fee));
    if (btc_remaining > 0) {
        tx.addOutput(key.publicKey, btc_remaining);
    }

    if (amount <= 0.1) {
        console.log('Transaction not processed - Amount is too low.');
        return;
    }


    const payload = createSafexAddressPayload("address");
    console.log("made the payload ", payload)

    const dataScript = bitcoin.payments.embed({data: [payload]})


    console.log("generated datascript")
    tx.addOutput(dataScript.output, 1000);


    for (var i = 0; i < inputs_num; i++) {
        tx.sign(i, key);
    }

    var json = {};
    json['rawtx'] = tx.build().toHex();
    console.log(json)
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


const padZeroes = String.prototype.padStart
    ? (str, length) => str.padStart(length, '0')
    : (str, length) => Array(length - str.length).join('0') + str;

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
    get_utxos,
    generateSafexBtcTransaction,
    setSafexMigrationPublicKey
};