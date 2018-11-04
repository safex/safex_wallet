var bitcoin = window.require('bitcoinjs-lib');
var swg = window.require('safex-addressjs');

const Buffer = window.require('safe-buffer').Buffer;

function get_utxos(address) {
    return new Promise((resolve, reject) => {
        fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/utxo')
            .then((resp) => resp.json())
            .then(resp => resolve(resp))
            .catch(err => reject(err))
    });
}


function getFee() {
    return new Promise((resolve, reject) => {
        fetch('http://omni.safex.io:3001/getfee')
            .then((resp) => resp.json())
            .then(resp => resolve(resp))
            .catch(err => reject(err))
    });
}


function broadcastTransaction(rawtx) {
    return new Promise((resolve, reject) => {
        fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(rawtx)})
            .then(resp => resp.text())
            .then((resp) => {
                resolve(resp)
            })
            .catch(e => {
                reject(e)
            });
    });
}

function generate_btc_transaction(utxos, destination, wif, amountdec, fee) {
    let key = bitcoin.ECPair.fromWIF(wif);
    var running_total = 0;
    var tx = new bitcoin.TransactionBuilder();
    var inputs_num = 0;
    let fee_adj;
    console.log(amountdec)
    var amount = amountdec * 100000000;
    utxos.forEach(txn => {
        if (running_total < (fee + amount)) {
            running_total += txn.satoshis;
            inputs_num += 1;
        }
    });
    fee_adj = inputs_num * 180;

    fee_adj += 100;

    fee = Math.trunc(fee * (fee_adj / 1000));
    var inputs_num = 0;
    var running_total = 0;
    utxos.forEach(txn => {
        if (running_total < (fee + amount)) {
            running_total += txn.satoshis;
            tx.addInput(txn.txid, txn.vout);
            inputs_num += 1;
        }
    });

    const {address} = bitcoin.payments.p2pkh({pubkey: key.publicKey})
    //problem is right here when adding a Output
    tx.addOutput(destination, amount);


    const left_overs = running_total - (amount + fee);
    if (left_overs > 0) {
        tx.addOutput(address, left_overs);
    }

    for (var i = 0; i < inputs_num; i++) {
        tx.sign(i, key);
    }

    var json = {};
    json['rawtx'] = tx.build().toHex();
    json['fee'] = fee;
    return json;
}

//standard BTC Blockchain Safex transaction
function generateSafexBtcTransaction(utxos, destination, wif, amount, fee) {
    let key = bitcoin.ECPair.fromWIF(wif);
    var running_total = 0;
    var tx = new bitcoin.TransactionBuilder();
    var inputs_num = 0;
    let fee_adj;
    utxos.forEach(txn => {
        if (running_total < (700 + fee)) {
            running_total += txn.satoshis;
            inputs_num += 1;
        }
    });
    fee_adj = inputs_num * 200;

    fee_adj += 265;

    fee = Math.trunc(fee * (fee_adj / 1000));
    var inputs_num = 0;
    var running_total = 0;
    utxos.forEach(txn => {
        if (running_total < (700 + fee)) {
            running_total += txn.satoshis;
            tx.addInput(txn.txid, txn.vout);
            inputs_num += 1;
        }
    });

    const {address} = bitcoin.payments.p2pkh({pubkey: key.publicKey})
    //problem is right here when adding a Output
    tx.addOutput(destination, 700);


    const left_overs = running_total - (700 + fee);
    if (left_overs > 0) {
        tx.addOutput(address, left_overs);
    }

    const _payload = createSafexPayloadBuffer(56, amount);
    console.log("made the payload ", _payload)

    const dataScript = bitcoin.payments.embed({data: [_payload]})

    console.log("generated datascript")
    tx.addOutput(dataScript.output, 0);


    for (var i = 0; i < inputs_num; i++) {
        tx.sign(i, key);
    }

    var json = {};
    json['rawtx'] = tx.build().toHex();
    json['fee'] = fee;
    return json;

}


//set the public key to where you want safex tokens and safex cash to be sent
function setSafexMigrationAddress(utxos, destination, wif, payload, fee) {
    let key = bitcoin.ECPair.fromWIF(wif);
    var running_total = 0;
    var tx = new bitcoin.TransactionBuilder();
    var inputs_num = 0;
    let fee_adj;
    utxos.forEach(txn => {

        if (running_total == 0 && txn.satoshis > (fee + 700)) {
            running_total += txn.satoshis;
            inputs_num += 1;
        }
    });
    fee_adj = inputs_num * 200;

    fee_adj += 400;

    fee = Math.trunc(fee * (fee_adj / 1000));
    var inputs_num = 0;
    var running_total = 0;
    utxos.forEach(txn => {
        if (running_total == 0 && txn.satoshis > (fee + 700)) {
            running_total += txn.satoshis;
            tx.addInput(txn.txid, txn.vout);
            inputs_num += 1;
        }
    });

    const {address} = bitcoin.payments.p2pkh({pubkey: key.publicKey})
    //problem is right here when adding a Output
    tx.addOutput(destination, 700);

    const left_overs = running_total - (700 + fee);
    if (left_overs > 0) {
        tx.addOutput(address, left_overs);
    }

    const _payload = Buffer.from(payload, 'hex');
    console.log("made the payload ", _payload)

    const dataScript = bitcoin.payments.embed({data: [_payload]})

    console.log("generated datascript")
    tx.addOutput(dataScript.output, 0);

    for (var i = 0; i < inputs_num; i++) {
        tx.sign(i, key);
    }

    var json = {};
    json['rawtx'] = tx.build().toHex();
    json['fee'] = fee;
    return json;
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

/* send safe exchange coins */

function createSafexPayloadBuffer(propertyId, amount) {
    return Buffer.from(createSafexPayload(propertyId, amount), 'hex');
}

const padZeroes = String.prototype.padStart
    ? (str, length) => str.padStart(length, '0')
    : (str, length) => Array(length - str.length).join('0') + str;


function createSafexAddressPayloadBuffer(keyset) {
    return Buffer.from(keyset, 'hex');
}

function createSafexAddress() {
    const seed = swg.sc_reduce32(swg.rand_32());
    const keys = swg.create_address(seed);
    const pubkey = swg.pubkeys_to_string(keys.spend.pub, keys.view.pub);

    const checksum = swg.address_checksum(keys.spend.pub, keys.view.pub);
    keys["checksum"] = checksum;
    return keys;
}

function structureSafexKeys(spend, view) {
    const keys = swg.structure_keys(spend, view);
    const checksum = swg.address_checksum(keys.spend.pub, keys.view.pub);
    keys["checksum"] = checksum;

    return keys;
}

function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

/*
    End Omni Payload Helper Functions
 */

const BURN_ADDRESS = "1SAFEXg6ah1JqixuYUnEyKetC4hJhztoz";

function verify_safex_address(spend, view, address) {

    var spend_pub = swg.sec_key_to_pub(spend);
    var view_pub = swg.sec_key_to_pub(view);

    var _address = swg.pubkeys_to_string(spend_pub, view_pub);

    if (_address == address) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    get_utxos,
    generateSafexBtcTransaction,
    setSafexMigrationAddress,
    createSafexAddress,
    broadcastTransaction,
    getFee,
    BURN_ADDRESS,
    verify_safex_address,
    structureSafexKeys,
    generate_btc_transaction
};