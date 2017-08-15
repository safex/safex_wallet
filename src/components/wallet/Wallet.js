import React from 'react';

var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
var bitcoin = window.require('bitcoinjs-lib');
var bitcore = window.require('bitcore-lib');
import axios from 'axios';
import {toHexString, encrypt, safexPayload} from '../../utils/utils';
import QRCode from 'qrcode.react';


import Navigation from '../Navigation';


export default class Wallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keys: [],
            wallet: {},
            is_loading: false,
            safex_price: 0,
            bitcoin_price: 0,

        }

        this.createKey = this.createKey.bind(this);
        this.importKey = this.importKey.bind(this);
        this.sendCoins = this.sendCoins.bind(this);
        this.prepareDisplay = this.prepareDisplay.bind(this);
    }


    componentWillMount() {

        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            console.log(e);
        }


    }

    componentDidMount() {

        this.prepareDisplay();
    }

    sendBitcoin() {
        //send bitcoins
        //fetch UTXOs for a specific address /insight-api/addr/[:addr]/utxo
        //broadcast /insight-api/tx/send
        // rawtx: "signed transaction as hex string"

        //eg

        //rawtx: 01000000017b1eabe0209b1fe794124575ef807057c77ada2138ae4fa8d6c4de0398a14f3f00000000494830450221008949f0cb400094ad2b5eb399d59d01c14d73d8fe6e96df1a7150deb388ab8935022079656090d7f6bac4c9a94e0aad311a4268e082a725f8aeae0573fb12ff866a5f01ffffffff01f0ca052a010000001976a914cbc20a7664f2f69e5355aa427045bc15e7c6c77288ac00000000

        //estimate fee:
        // /insight-api/utils/estimatefee[?nbBlocks=2]
    }

    sendSafex() {

    }


    getBitcoinPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'BTC') {
                        console.log('bitcoin price ' + res.data[i].price_usd)
                        this.setState({bitcoin_price: res.data[i].price_usd});
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get the current price of bitcoin
    }

    getSafexPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'SAFEX') {
                        console.log('safex price ' + res.data[i].price_usd)
                        this.setState({safex_price: res.data[i].price_usd});
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get the latest price of safex
    }

    getPrices() {

        var myHeaders = new Headers();
        myHeaders.append('pragma', 'no-cache');
        myHeaders.append('cache-control', 'no-cache');

        fetch('https://api.coinmarketcap.com/v1/ticker/', {method: "GET", headers: myHeaders})
            .then(resp => resp.json())
            .then((resp) => {
                try {
                    var btc = 0;
                    var safex = 0;
                    for (var i = 0; i < resp.length; i++) {
                        // look for the entry with a matching `code` value
                        if (resp[i].symbol === 'SAFEX') {
                            console.log(resp)
                            safex = resp[i].price_usd
                        } else if (resp[i].symbol === 'BTC') {
                            console.log(resp)
                            btc = resp[i].price_usd
                        }
                    }

                    this.setState({safex_price: safex, bitcoin_price: btc});
                } catch (e) {
                    console.log(e);
                }
            });
    }


    getAverageFee() {
        //fetch the average fee cost, for preloading into transactions, for safex or for bitcoin

        //axios.post('http://localhost:3001/balance', JSON.stringify(json)).then(res => {
        // return res.data["balance"];
        //});
    }

    prepareDisplay() {
        var promises = [];
        console.log(this.state.keys);

        this.state.keys.forEach((key) => {
            var json = {};
            json['address'] = key.public_key;
            promises.push(fetch('http://localhost:3001/balance', {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://46.101.251.77:3001/insight-api/addr/' + key.public_key + '/balance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://46.101.251.77:3001/insight-api/addr/' + key.public_key + '/unconfirmedBalance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://localhost:3001/unconfirmed', {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
        });
        Promise.all(promises).then(values => {
            var hold_keys = this.state.keys;
            var internal_index = 0;
            var iteration = 0;
            for (var x = 0; x < values.length; x++) {

                if (iteration === 0) {
                    hold_keys[internal_index].safex_bal = values[x].balance;
                    iteration += 1;
                } else if (iteration === 1) {
                    hold_keys[internal_index].btc_bal = values[x] / 100000000;
                    iteration += 1;
                } else if (iteration === 2) {
                    hold_keys[internal_index].pending_btc_bal = values[x] / 100000000;
                    iteration += 1;
                } else if (iteration === 3) {
                    hold_keys[internal_index].pending_safex_bal = values[x];
                    iteration = 0;
                    internal_index += 1;
                }
            }
            this.setState({keys: hold_keys});
        });
    }

    sendCoins(e) {
        e.preventDefault();
        console.log(e.target.which.checked);
        if (e.target.which.checked === true) {
            var keys = bitcore.PrivateKey.fromWIF(e.target.private_key.value);
            var source = e.target.public_key.value;
            var amount = e.target.amount.value;
            var fee = e.target.fee.value;
            var destination = e.target.destination.value;
            fetch('http://46.101.251.77:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                .then(resp => resp.json())
                .then((resp) => {
                    console.log(resp)
                    this.formSafexTransaction(resp, amount, fee * 100000000, destination, keys, source);
                });

            //send safex

        } else {
            var keys = bitcoin.ECPair.fromWIF(e.target.private_key.value);
            var source = e.target.public_key.value;
            var amount = e.target.amount.value;
            var fee = e.target.fee.value;
            var destination = e.target.destination.value;
            fetch('http://46.101.251.77:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                .then(resp => resp.json())
                .then((resp) => {
                    console.log(resp)
                    this.formBitcoinTransaction(resp, amount * 100000000, fee * 100000000, destination, keys, source);
                });


        }
    }

    formBitcoinTransaction(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;
        utxos.forEach(txn => {
            console.log(txn);
            if (running_total < (amount + fee)) {
                running_total += txn.satoshis;
                tx.addInput(txn.txid, txn.vout);
                inputs_num += 1;
            }
        });
        console.log('running total ' + running_total)
        console.log('fee ' + fee)
        console.log('amount ' + amount)
        console.log('subtracted total ' + (running_total - (amount + fee)))
        console.log('inputs num ' + inputs_num)
        tx.addOutput(destination, amount);
        tx.addOutput(source, (running_total - (amount + fee)));
        for (var i = 0; i < inputs_num; i++) {
            tx.sign(i, key);
        }

        var json = {};
        json['rawtx'] = tx.build().toHex();
        console.log('the json ' + JSON.stringify(json))
        fetch('http://localhost:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
            .then(resp => resp.text())
            .then((resp) => {
                console.log(resp)
            });
    }

    formSafexTransaction(utxos, amount, fee, destination, key, source) {

        var tx_array = [];
        var running_total = 0;
        console.log(utxos);

        utxos.forEach(txn => {
            console.log(txn);
            if (running_total < (1e3 + fee)) {
                running_total += txn.satoshis;
                var scriptkey = txn.scriptPubKey;
                var the_utxo = {
                    'txId' : txn.txid,
                    'outputIndex' : txn.vout,
                    'address' : txn.address,
                    'script' : txn.scriptPubKey,
                    'satoshis' : txn.satoshis,
                };
                tx_array.push(the_utxo);
            }
        });

        console.log(safexPayload(amount).toString('utf8'));
        var tx = new bitcore.Transaction()
            .from(tx_array)
            .to(destination, 1e3)
            .fee(fee)
            .addData(safexPayload(amount).toString('utf8'))
            .change(source)
            .sign(key);

        console.log(tx.serialize());
        var json = {};
        json['rawtx'] = tx.serialize();
        console.log('the json ' + JSON.stringify(json))
        fetch('http://localhost:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
           .then(resp => resp.text())
            .then((resp) => {
               console.log(resp)
            });

    }


    safexPayload(amount) {
        const prefix = 'omni';
        const payload = this.padZeroes16(this.toHex(56)) + this.padZeroes16(this.toHex(amount));

        return new Buffer.concat([new Buffer(prefix), new Buffer(payload, 'hex')]);
    }

    toHex(num) {
        return (num).toString(16);
    }

    padZeroes16(str) {
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



    createKey() {
        this.setState({is_loading: true});

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

        var address = key_pair.getAddress();


        var key_json = {};
        key_json['public_key'] = address;
        key_json['private_key'] = priv_key_wif;
        key_json['safex_bal'] = 0;
        key_json['btc_bal'] = 0;
        key_json['pending_safex_bal'] = 0;
        key_json['pending_btc_bal'] = 0;


        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            console.log(e);
        }


        json['keys'].push(key_json);
        console.log(json);


        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = localStorage.getItem('password');

        var cipher_text = encrypt(JSON.stringify(json), algorithm, password);


        var home_dir = os.homedir();

        fs.writeFile(home_dir + '/safexwallet.dat', cipher_text, (err) => {
            if (err) {
                console.log(err)
            } else {
                localStorage.setItem('wallet', JSON.stringify(json));
                try {
                    var json2 = JSON.parse(localStorage.getItem('wallet'));
                    this.setState({wallet: json2, keys: json2['keys'], is_loading: false});
                } catch (e) {
                    console.log(e);
                }

            }
        });
    }

    importKey(e) {
        e.preventDefault();
        try {
            var key_pair = bitcoin.ECPair.fromWIF(e.target.key.value);

            var address = key_pair.getAddress();

            var key_json = {};
            key_json['public_key'] = address;
            key_json['private_key'] = e.target.key.value;
            key_json['safex_bal'] = 0;
            key_json['btc_bal'] = 0;
            key_json['pending_safex_bal'] = 0;
            key_json['pending_btc_bal'] = 0;


            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
                var key_exists = false;

                for (var i = 0; i < json['keys'].length; i++) {
                    // look for the entry with a matching `code` value
                    if (json['keys'][i].public_key === address) {
                        key_exists = true;
                    }
                }

                if (key_exists === false) {

                    json['keys'].push(key_json);
                    console.log(json);

                    var crypto = require('crypto'),
                        algorithm = 'aes-256-ctr',
                        password = localStorage.getItem('password');

                    var cipher_text = encrypt(JSON.stringify(json), algorithm, password);


                    var home_dir = os.homedir();

                    fs.writeFile(home_dir + '/safexwallet.dat', cipher_text, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            localStorage.setItem('wallet', JSON.stringify(json));
                            try {
                                var json2 = JSON.parse(localStorage.getItem('wallet'));
                                this.setState({wallet: json2, keys: json2['keys'], is_loading: false});
                                this.prepareDisplay();
                            } catch (e) {
                                console.log(e);
                            }

                        }
                    });
                } else {
                    console.log('key exists');
                }


            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }


    }

    exportKey() {

    }


    render() {
        const {keys} = this.state;


        var table = Object.keys(keys).map((key) => {
            return <tbody key={key}>
            <tr>
                <td>{keys[key].public_key}</td>
                <td>safex: {keys[key].pending_safex_bal > 0 | keys[key].pending_safex_bal < 0 ? (keys[key].safex_bal + keys[key].pending_safex_bal) : keys[key].safex_bal}
                {keys[key].pending_safex_bal > 0 | keys[key].pending_safex_bal < 0 ? '(pending ' + keys[key].pending_safex_bal + ')' : ''}</td>
                <td>bitcoin: {keys[key].btc_bal} {keys[key].pending_btc_bal > 0 | keys[key].pending_btc_bal < 0 ? '(pending ' + keys[key].pending_btc_bal + ')' : ''}</td>
                <td>
                    <button>send</button>
                </td>
                <td>
                    <button>receive</button>
                </td>
            </tr>
            <tr>
                <td>
                    <form onSubmit={this.sendCoins}>
                        <input type="hidden" name="private_key" value={keys[key].private_key}></input>
                        <input type="hidden" name="public_key" value={keys[key].public_key}></input>
                        <label htmlFor="which">btc or safex</label>
                        <input type="checkbox" name="which"></input>
                        <label htmlFor="amount">amount</label>
                        <input name="amount"></input>
                        <label htmlFor="fee">fee</label>
                        <input name="fee"></input>
                        <label htmlFor="destination">destination</label>
                        <input name="destination"></input>
                        <button>Send</button>
                    </form>
                </td>
            </tr>
            </tbody>
        });
        return (
            <div>
                <Navigation/>
                <ul>
                    <li>
                        <button onClick={this.createKey}>create key</button>
                    </li>
                    <li>
                        <form onSubmit={this.importKey}>
                            <input name="key"></input>
                            <button type="submit">import key</button>
                        </form>
                    </li>
                    <li>
                        <button>export key</button>
                    </li>
                </ul>
                <table>
                    {table}
                </table>
            </div>
        );
    }
}
