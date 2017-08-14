import React from 'react';

var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
var bitcoin = window.require('bitcoinjs-lib');
import axios from 'axios';
import {toHexString, encrypt, decrypt} from '../../utils/utils';
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
            receive_amount: 0.0000001.toFixed(7),
            collapse_open: {
                key: '',
                receive_open: false,
                send_open: false
            },
            send_coin: 'safex',
            send_amount: 1,
            send_fee: 0.0001,
            send_total: 1,
            send_overflow_active: false,
            send_to:'',
            send_keys: {
              public_key: '',
              private_key: ''
            }

        }

        this.createKey = this.createKey.bind(this);
        this.importKey = this.importKey.bind(this);
        this.sendCoins = this.sendCoins.bind(this);
        this.prepareDisplay = this.prepareDisplay.bind(this);
        this.openCoinModal = this.openCoinModal.bind(this);
        this.closeCoinModal = this.closeCoinModal.bind(this);
        this.sendAmountOnChange = this.sendAmountOnChange.bind(this);
        this.sendFeeOnChange = this.sendFeeOnChange.bind(this);
        this.sendFeeOnBlur = this.sendFeeOnBlur.bind(this);
        this.sendTotalAdjustCoinChange = this.sendTotalAdjustCoinChange.bind(this);
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
        });
        Promise.all(promises).then(values => {
            var hold_keys = this.state.keys;
            var internal_index = 0;
            for (var x = 0; x < values.length; x++) {
                if (x === 0) {
                    hold_keys[internal_index].safex_bal = values[x].balance;
                } else if (x === 1) {
                    hold_keys[internal_index].btc_bal = values[x] / 100000000;
                    internal_index += 1;
                } else if ((x % 2) === 0) {
                    hold_keys[internal_index].safex_bal = values[x].balance;
                } else {
                    hold_keys[internal_index].btc_bal = values[x] / 100000000;
                    internal_index += 1;
                }
            }
            this.setState({keys: hold_keys});
        });
    }

    sendCoins(e) {
        e.preventDefault();
        if (this.state.send_coin === 'safex') {

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

    formSafexTransaction() {

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

    amountChange(receive_amount) {
        this.setState({
            receive_amount: receive_amount.value
          });
    }

    openSendReceive(key,sendreceive){
        if(sendreceive === 'send'){
                if(!this.state.collapse_open.send_open && this.state.collapse_open.key !== key || this.state.collapse_open.send_open && this.state.collapse_open.key !== key){
                    this.setState({
                        collapse_open: {
                            key: key,
                            send_open: true,
                            receive_open: false
                        },
                        send_public_key: this.state.keys[key].public_key
                    });
                }

                if(this.state.collapse_open.send_open && this.state.collapse_open.key === key){
                    this.setState({
                        collapse_open: {
                            key: key,
                            send_open: false,
                            receive_open: false
                        },
                        send_public_key: ''
                    });
                }

                if(!this.state.collapse_open.send_open && this.state.collapse_open.key === key){
                    this.setState({
                        collapse_open: {
                            key: key,
                            send_open: true,
                            receive_open: false
                        },
                        send_public_key: ''
                    });
                }

            }
        if(sendreceive === 'receive'){
            if(!this.state.collapse_open.receive_open && this.state.collapse_open.key !== key || this.state.collapse_open.receive_open && this.state.collapse_open.key !== key){
                this.setState({
                    collapse_open: {
                        key: key,
                        send_open: false,
                        receive_open: true
                    }
                });
            }
            if(this.state.collapse_open.receive_open && this.state.collapse_open.key === key || !this.state.collapse_open.receive_open && this.state.collapse_open.key === key){
                this.setState({
                    collapse_open: {
                        key: key,
                        send_open: false,
                        receive_open: !this.state.collapse_open.receive_open
                    }
                });
            }
        }
    }

    sendCoinChoose(coin){
        this.setState({
            send_coin: coin
        });
        this.sendTotalAdjustCoinChange(coin);
    }

    openCoinModal(e){
        e.preventDefault();
        if(this.state.send_fee <= 0.0001){
            var send_fee = 0.0001;
        }else{
            var send_fee = this.state.send_fee;
        }
        this.setState({
            send_overflow_active: true,
            send_to: e.target.destination.value,
            send_fee: send_fee,
            send_keys: {
              public_key: e.target.public_key.value,
              private_key: e.target.private_key.value
            }
        })
    }

    sendAmountOnChange(e){
            var send_fee = this.state.send_fee;
            var send_total = 0;
            if(this.state.send_coin === 'safex'){
                send_total = parseInt(e.target.value);
                this.setState({
                    send_amount: parseInt(e.target.value),
                    send_total: send_total
                });
            }else{
                send_total = parseFloat(e.target.value) + parseFloat(send_fee);
                this.setState({
                    send_amount: e.target.value,
                    send_total: send_total
                });
            }


    }

    sendFeeOnChange(e){
            var send_amount = this.state.send_amount;
            var send_fee = parseFloat(e.target.value);

            if(this.state.send_coin === 'safex'){
                var send_total = parseFloat(send_amount);
            }else{
                var send_total = parseFloat(send_fee) + parseFloat(send_amount);
            }
            this.setState({
                send_fee: send_fee,
                send_total: send_total.toFixed(7)
            });
    }

    sendFeeOnBlur(e){
        if(this.state.send_fee <= 0.0001){
            var send_fee = 0.0001;
        }else{
            var send_fee = this.state.send_fee;
        }
        this.setState({
            send_fee: send_fee
        })
    }

    sendTotalAdjustCoinChange(coin){
        var send_amount = this.state.send_amount;
        var send_fee = this.state.send_fee;
        if(coin === 'safex'){
            send_amount = parseFloat(this.state.send_amount).toFixed(0);
            var send_total = parseFloat(send_amount);
            this.setState({
                send_amount: 1,
                send_fee: 0.0001,
                send_total: 1
            });
        }else{
            var send_total = parseFloat(send_fee) + 0.0000001;
            this.setState({
                send_amount: 0.0000001.toFixed(7),
                send_total: send_total.toFixed(7)
            });
        }

    }

    closeCoinModal(){
        this.setState({
            send_overflow_active: false,
            send_to: '',
            send_keys: {
              public_key: '',
              private_key: ''
            }
        })
    }

    render() {
        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {

            return <div className="col-xs-12 single-key" key={key}>
                <div className="col-xs-7">
                    <div className="key">{keys[key].public_key}</div>
                    <div className="amounts">
                        AMOUNT: <span className="amount">Safex: {keys[key].safex_bal}</span> <span className="amount">Bitcoin: {keys[key].btc_bal}</span>
                    </div>
                </div>
                <div className="pull-right">
                    <button onClick={this.openSendReceive.bind(this,key,'send')}>SEND  <img src="/images/send.png" alt="Send" /></button>
                    <button onClick={this.openSendReceive.bind(this,key,'receive')}>RECEIVE <img src="/images/import.png" alt="Receive" /></button>
                    <button><img src="/images/history.png" alt="history" /></button>
                </div>
                <form onSubmit={this.openCoinModal} className={this.state.collapse_open.send_open && this.state.collapse_open.key === key
                ? 'col-xs-12 form-inline form-send active'
                : 'col-xs-12 form-inline form-send'}>
                    <div className="row">
                        <div className="col-xs-8 send-left">
                            <label htmlFor="which">Currency</label>
                            <img className={this.state.send_coin === 'safex'
                            ? 'coin active'
                            : 'coin'} onClick={this.sendCoinChoose.bind(this,'safex')} src="/images/safex-coin.png" alt="Safex Coin" />
                            <img className={this.state.send_coin === 'btc'
                            ? 'coin active'
                            : 'coin'} onClick={this.sendCoinChoose.bind(this,'btc')} src="/images/btc-coin.png" alt="Bitcoin Coin" />
                            <input type="hidden" name="which" value={this.state.send_coin}></input>
                            <input type="hidden" name="private_key" value={keys[key].private_key}></input>
                            <input type="hidden" name="public_key" value={keys[key].public_key}></input>
                            <div className="input-group">
                              <span className="input-group-addon" id="basic-addon1">TO:</span>
                              <input name="destination" type="text" className="form-control" placeholder="Address" aria-describedby="basic-addon1" />
                            </div>
                        </div>
                        <div className="col-xs-4">
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input type="number" name="amount" onChange={this.sendAmountOnChange} value={this.state.send_amount} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">Fee(BTC):</label>
                                <input type="number" name="fee" onChange={this.sendFeeOnChange} onBlur={this.sendFeeOnBlur} value={this.state.send_fee} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="total">Total:</label>
                                <input type="number" name="total" readOnly value={this.state.send_total}></input>
                            </div>
                            <button type="submit">Send</button>
                        </div>
                    </div>
                </form>
                <div className={this.state.collapse_open.receive_open && this.state.collapse_open.key === key
                ? 'col-xs-12 receive active'
                : 'col-xs-12 receive'}>
                    <div className="col-xs-12">
                        <label htmlFor="receive-address">Address:</label>
                        <input name="receive-address" value={keys[key].public_key} />
                    </div>
                    <div className="col-xs-8">
                        <label htmlFor="amount">Amount:</label>
                        <input type="amount" placeholder="1" onChange={this.amountChange.bind(this)} value={this.state.receive_amount} />
                    </div>
                    <div className="col-xs-4">
                        <div className="row">
                            <div className="col-xs-6">
                                <QRCode value={"bitcoin:"+keys[key].public_key+"?amount="+this.state.receive_amount} />
                            </div>
                            <div className="col-xs-6">
                                <button>Print <img src="/images/print.png" alt="Print" /></button>
                                <button>PDF <img src="/images/pdf.png" alt="Pdf" /></button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        });
        return (
            <div>
                <Navigation />
                <div className="container key-buttons">
                        <div className="row">
                            <div className="col-xs-12">
                                <button onClick={this.createKey}>Create key</button>
                                <form onSubmit={this.importKey}>
                                    <input name="key"></input>
                                    <button type="submit">Import key</button>
                                </form>
                                <button>Export key</button>
                            </div>
                        </div>
                </div>
                <div className="container">
                    <div className="col-xs-12">
                        <div className="row">
                            {table}
                        </div>
                    </div>
                </div>
                <div className={this.state.send_overflow_active
                ? 'overflow sendModal active'
                : 'overflow sendModal'}>
                    <form onSubmit={this.sendCoins}>
                        <h3>Sending <span className="close" onClick={this.closeCoinModal}>X</span></h3>
                        <div className="col-xs-12">
                            <div className="currency">
                                Currency: <img className={this.state.send_coin === 'safex'
                                ? 'coin'
                                : 'coin hidden-xs hidden-sm hidden-md hidden-lg'} onClick={this.sendCoinChoose.bind(this,'safex')} src="/images/safex-coin.png" alt="Safex Coin" />
                                <img className={this.state.send_coin === 'btc'
                                ? 'coin'
                                : 'coin hidden-xs hidden-sm hidden-md hidden-lg'} onClick={this.sendCoinChoose.bind(this,'btc')} src="/images/btc-coin.png" alt="Bitcoin Coin" />
                            </div>
                        </div>
                        <div className="input-group">
                          <span className="input-group-addon" id="basic-addon1">FROM:</span>
                          <input name="from" type="text" className="form-control" readOnly value={this.state.send_keys.public_key} placeholder="Address" aria-describedby="basic-addon1" />
                        </div>
                        <div className="input-group">
                          <span className="input-group-addon" id="basic-addon1">TO:</span>
                          <input name="destination" type="text" className="form-control" readOnly value={this.state.send_to} placeholder="Address" aria-describedby="basic-addon1" />
                        </div>
                        <input type="hidden" name="private_key" value={this.state.send_keys.private_key}></input>
                        <input type="hidden" name="public_key" value={this.state.send_keys.public_key}></input>
                        <div className="col-xs-6 col-xs-offset-3">
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input readOnly name="amount" value={this.state.send_amount} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">Fee(BTC):</label>
                                <input readOnly name="fee" value={this.state.send_fee} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="total">Total:</label>
                                <input readOnly name="total" value={this.state.send_total}></input>
                            </div>
                            <button type="submit">CONFIRM</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
