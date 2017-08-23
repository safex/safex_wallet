import React from 'react';
var fileDownload = require('react-file-download');
var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
var bitcoin = window.require('bitcoinjs-lib');
var bitcore = window.require('bitcore-lib');
import {toHexString, encrypt, safexPayload} from '../../utils/utils';
import QRCode from 'qrcode.react';

//todo settings icon with export encrypted and unencrypted, also change password feature

import Navigation from '../Navigation';


export default class Wallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //wallet state
            keys: [],
            wallet: {},
            import_key: '',

            //transaction
            send_coin: 'safex',
            send_amount: 1,
            send_fee: 0.0001,
            send_total: 1,
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },
            transaction_being_sent: false,
            transaction_sent: false,
            txid: "",
            average_fee: 0,
            active_fee: 'fast',

            //UI state
            btc_sync: false,
            safex_sync: false,
            is_loading: false,
            receive_amount: 0.00000001.toFixed(8),
            collapse_open: {
                key: '',
                receive_open: false,
                send_open: false
            },
            refreshTimer: 0,
            refreshInterval: '',
            status_text: 'Loading...'
        }

        this.createKey = this.createKey.bind(this);
        this.importKey = this.importKey.bind(this);
        this.importKeyChange = this.importKeyChange.bind(this);
        this.sendCoins = this.sendCoins.bind(this);
        this.prepareDisplay = this.prepareDisplay.bind(this);
        this.openCoinModal = this.openCoinModal.bind(this);
        this.closeCoinModal = this.closeCoinModal.bind(this);
        this.sendAmountOnChange = this.sendAmountOnChange.bind(this);
        this.sendFeeOnChange = this.sendFeeOnChange.bind(this);
        this.sendFeeOnBlur = this.sendFeeOnBlur.bind(this);
        this.sendTotalAdjustCoinChange = this.sendTotalAdjustCoinChange.bind(this);
        this.closeSuccessModal = this.closeSuccessModal.bind(this);
        this.exportWallet = this.exportWallet.bind(this);
        this.getFee = this.getFee.bind(this);
        this.refreshWallet = this.refreshWallet.bind(this);
        this.feeChange = this.feeChange.bind(this);
    }



    refreshWallet(){
        if(this.state.refreshTimer === 0){
            this.prepareDisplay();
            let interval = setInterval(this.refreshWalletTimer, 1000);
            this.setState({
                refreshTimer: 180,
                refreshInterval: interval
            });
        }
    }
    refreshWalletTimer = () => {
        if (this.state.refreshTimer > 0){
            this.setState({ refreshTimer: this.state.refreshTimer -1 });
        }
        else {
            clearInterval(this.state.refreshInterval);
        }
    }

    componentWillMount() {
        //todo documentation and refactor
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            console.log(e);
        }


    }

    componentDidMount() {
        this.refreshWallet();
        this.getFee();
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }


    getFee() {
        fetch('http://omni.safex.io:3001/getfee')
            .then(resp => resp.text())
            .then((resp) => {
                    this.setState({average_fee: resp, send_fee: resp});
            });
    }

    prepareDisplay() {
        var promises = [];
        console.log(this.state.keys);

        this.state.keys.forEach((key) => {
            var json = {};
            json['address'] = key.public_key;
            promises.push(fetch('http://omni.safex.io:3001/balance', {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + key.public_key + '/balance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + key.public_key + '/unconfirmedBalance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://omni.safex.io:3001/unconfirmed', {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
        });
        console.log(promises.length);


        Promise.all(promises).then(values => {
            var hold_keys = this.state.keys;
            var internal_index = 0;
            var iteration = 0;
            for (var x = 0; x < values.length; x++) {
                if (iteration === 0) {
                    hold_keys[internal_index].safex_bal = values[x].balance;
                    iteration += 1;
                } else if (iteration === 1) {
                    hold_keys[internal_index].btc_bal = (values[x] / 100000000).toFixed(8);
                    iteration += 1;
                } else if (iteration === 2) {
                    hold_keys[internal_index].pending_btc_bal = (values[x] / 100000000).toFixed(8);
                    iteration += 1;
                } else if (iteration === 3) {
                    hold_keys[internal_index].pending_safex_bal = values[x];
                    iteration = 0;
                    internal_index += 1;
                }

            }
            this.setState({keys: hold_keys, btc_sync: true, safex_sync: true, status_text: 'Synchronized'});
        }).catch(e => {
            this.setState({btc_sync: false, safex_sync: false, status_text: 'Synchronization error, try refreshing later'});
        });
    }


    sendCoins(e) {
        e.preventDefault();
        this.setState({
          transaction_being_sent: true,
        });
        if (this.state.send_coin === 'safex') {
            var keys = bitcoin.ECPair.fromWIF(e.target.private_key.value);
            var source = e.target.public_key.value;
            var amount = e.target.amount.value;
            var fee = e.target.fee.value;
            console.log('the fee ' + e.target.fee.value)
            var destination = e.target.destination.value;

            try {
                var address = bitcore.Address.fromString(destination);
                var address2 = bitcore.Address.fromString(source);
                try {
                    fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                        .then(resp => resp.json())
                        .then((resp) => {
                            console.log(resp)
                            this.formSafexTransaction(resp, amount, parseFloat((fee * 100000000).toFixed(0)), destination, keys, source);
                        });
                } catch (e) {
                    alert('network communication error, please try again later');
                }
            } catch (e) {
                alert('invalid destination address');
            }
            //send safex

        } else {
            var keys = bitcoin.ECPair.fromWIF(e.target.private_key.value);
            var source = e.target.public_key.value;
            var amount = e.target.amount.value;
            var fee = e.target.fee.value;
            var destination = e.target.destination.value;
            try {
               var address = bitcore.Address.fromString(destination);
                var address2 = bitcore.Address.fromString(source);
                try {
            fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                .then(resp => resp.json())
                .then((resp) => {
                    this.formBitcoinTransaction(resp, parseFloat((amount * 100000000).toFixed(0)), parseFloat((fee * 100000000).toFixed(0)), destination, keys, source);
                });
                } catch (e) {
                    alert('network communication error, please try again later');
                }
            } catch (e) {
                alert('invalid destination address');
            }

        }
    }

    formBitcoinTransaction(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;
        utxos.forEach(txn => {
            console.log(txn.confirmations > 0);
            if (!txn.confirmations > 0) {
                console.log(false)
            } else {
                console.log(true)
                if (running_total < (amount + fee)) {
                    running_total += txn.satoshis;
                    tx.addInput(txn.txid, txn.vout);
                    inputs_num += 1;
                }
            }
        });
        tx.addOutput(destination, amount);

        if ((running_total - (amount + fee)) > 0) {
            tx.addOutput(source, (running_total - (amount + fee)));
        }
        console.log(tx);
        for (var i = 0; i < inputs_num; i++) {
            tx.sign(i, key);
        }

        var json = {};
        json['rawtx'] = tx.build().toHex();
        fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
            .then(resp => resp.text())
            .then((resp) => {
                console.log(resp);
                this.setState({
                    transaction_sent: true,
                    transaction_being_sent: false,
                    txid: resp
                });
            });
    }

    formSafexTransaction(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;
        utxos.forEach(txn => {
            console.log(txn);
            if (running_total < (2730 + fee)) {
                running_total += txn.satoshis;
                tx.addInput(txn.txid, txn.vout);
                inputs_num += 1;
            }
        });
        tx.addOutput(destination, 2730);

        if ((running_total - (2730 + fee)) > 0) {
            tx.addOutput(source, (running_total - (2730 + fee)));
        }
        console.log(tx.buildIncomplete().toHex())
        var SafexTransaction = {};
        SafexTransaction['incomplete_tx'] = tx.buildIncomplete().toHex();
        SafexTransaction['amount'] = amount;
        fetch('http://omni.safex.io:3001/getsafextxn', {method: "POST", body: JSON.stringify(SafexTransaction)})
            .then(resp => resp.text())
            .then((resp) => {
                var decoded_txn = bitcoin.Transaction.fromHex(resp);
                var txn = bitcoin.TransactionBuilder.fromTransaction(decoded_txn);
                var check = 0;
                console.log(txn.tx.outs);
                txn.tx.outs.forEach(out => {
                    if (check === 0) {
                        var pubkey = bitcoin.address.fromOutputScript(out.script, bitcoin.networks.livenet);
                        if (pubkey === destination) {
                            check += 1;
                        }
                    } else if (check === 1) {
                        var pubkey = bitcoin.address.fromOutputScript(out.script, bitcoin.networks.livenet);
                        if (pubkey === source) {
                            check += 1;
                        }
                    }
                });

            if (check === 2) {
                for (var i = 0; i < inputs_num; i++) {
                    txn.sign(i, key);
                }
                console.log(txn.build().toHex())

                var json = {};
                json['rawtx'] = txn.build().toHex();

                fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
                     .then(resp => resp.text())
                     .then((resp) => {

                         this.setState({
                             transaction_sent: true,
                             transaction_being_sent: false,
                             txid: resp
                         });
                     });
            } else {
                alert("error with transaction")
            }

            });

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


        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = localStorage.getItem('password');

        var cipher_text = encrypt(JSON.stringify(json), algorithm, password);


        fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
            if (err) {
                console.log(err)
            } else {
                localStorage.setItem('wallet', JSON.stringify(json));
                try {
                    var json2 = JSON.parse(localStorage.getItem('wallet'));
                    this.setState({wallet: json2, keys: json2['keys'], is_loading: false});
                    this.prepareDisplay();
                    alert('key added to wallet')
                } catch (e) {
                    console.log(e);
                }

            }
        });
    }

    importKeyChange(e){
        this.setState({
            import_key: e.target.value
        })
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


                    fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            localStorage.setItem('wallet', JSON.stringify(json));
                            this.setState({
                                import_key: ''
                            })
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
            alert('invalid private key')
            console.log(e);
        }


    }

    exportWallet() {
        alert("This will create a file where you can see your private keys. It is a very sensitive file Be responsible with it." +
            "You can use this file to Import the Private Keys into another wallet.")
        var wallet_data = localStorage.getItem('wallet');
        fileDownload(wallet_data, 'safex.txt');

    }

    amountChange(receive_amount) {
        this.setState({
            receive_amount: receive_amount.value
        });
    }



    //This function is connected to Send expansion button and receive expansion button
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



    //Activates send_overflow_active state which opens Modal screen displaying transaction pre-confirmation information
    openCoinModal(e){
        e.preventDefault();

        //todo add error message and validation for public keys (address) here as valid destination
        if (e.target.destination.value === '') {

        } else {
            this.setState({
                send_overflow_active: true,
                send_to: e.target.destination.value,
                send_keys: {
                    public_key: e.target.public_key.value,
                    private_key: e.target.private_key.value
                }
            })
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

    closeSuccessModal(e) {
        e.preventDefault();
        this.setState({
            transaction_sent: false,
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            }
        });
        this.prepareDisplay();
        setTimeout(() => {
            this.prepareDisplay();
        },35000)
    }

    //This is fired when amount is changed
    sendAmountOnChange(e){
            var send_fee = this.state.send_fee;
            var send_total = 0;
            if (this.state.send_coin === 'safex') {
                send_total = parseInt(e.target.value);
                this.setState({
                    send_amount: parseInt(e.target.value),
                    send_total: send_total
                });
            } else {
                send_total = parseFloat(e.target.value) + parseFloat(send_fee);
                this.setState({
                    send_amount: e.target.value,
                    send_total: send_total
                });
            }
    }

    //This is fired when fee is changed
    sendFeeOnChange(e){
            var send_amount = this.state.send_amount;
            var send_fee = parseFloat(e.target.value);

            if (this.state.send_coin === 'safex') {
                var send_total = parseFloat(send_amount);
            } else {
                var send_total = parseFloat(send_fee) + parseFloat(send_amount);
            }
            this.setState({
                send_fee: send_fee,
                send_total: send_total.toFixed(8)
            });
    }

    //This is protection against way too small fees
    sendFeeOnBlur(e){
        if(this.state.send_fee <= 0.00005){
            var send_fee = 0.00005;
        }else{
            var send_fee = this.state.send_fee;
        }
        this.setState({
            send_fee: send_fee
        })
    }

    //This fires the currency selection method and sets the currency state
    sendCoinChoose(coin){
        this.setState({
            send_coin: coin
        });
        this.sendTotalAdjustCoinChange(coin);
    }

    //This is fired when change of currency is selected BTC SAFEX
    sendTotalAdjustCoinChange(coin){
        var send_amount = this.state.send_amount;
        if(this.state.average_fee > 0){
            var send_fee = this.state.average_fee;
        }else{
            var send_fee = this.state.send_fee;
        }

        //if this.state.average_fee > 0 send_fee == fast. Set active fee selection fastest.
        if(coin === 'safex'){
            send_amount = parseFloat(this.state.send_amount).toFixed(0);
            var send_total = parseFloat(send_amount);
            this.setState({
                send_amount: 1,
                send_fee: parseFloat(this.state.average_fee).toFixed(8),
                send_total: 1,
                active_fee: 'fast'
            });
        }else{
            var send_total = parseFloat(this.state.average_fee) + 0.00001;
            this.setState({
                send_amount: 0.00001.toFixed(8),
                send_fee: parseFloat(parseFloat(this.state.average_fee)/2).toFixed(8),
                send_total: send_total.toFixed(8),
                active_fee: 'fast'
            });
        }

    }

    feeChange(speed){
        var coin = this.state.send_coin;
        if (coin === 'safex'){
            if(speed === 'fast'){
                this.setState({
                    send_fee: parseFloat(this.state.average_fee).toFixed(8),
                    active_fee: speed
                });
            }
            if(speed === 'med'){
                this.setState({
                    send_fee: parseFloat(parseFloat(this.state.average_fee)/2).toFixed(8),
                    active_fee: speed
                });
            }
            if(speed === 'slow'){
                this.setState({
                    send_fee: parseFloat(parseFloat(this.state.average_fee)/3).toFixed(8),
                    active_fee: speed
                });
            }
        }
        if (coin === 'btc'){
            if(speed === 'fast'){
                this.setState({
                    send_fee: parseFloat(parseFloat(this.state.average_fee)/2).toFixed(8),
                    send_total: parseFloat(parseFloat(this.state.send_amount)+parseFloat(this.state.average_fee)/2).toFixed(8),
                    active_fee: speed
                });
            }
            if(speed === 'med'){
                this.setState({
                    send_fee: parseFloat(parseFloat(this.state.average_fee)/4).toFixed(8),
                    send_total: parseFloat(parseFloat(this.state.send_amount)+parseFloat(this.state.average_fee)/4).toFixed(8),
                    active_fee: speed
                });
            }
            if(speed === 'slow'){
                this.setState({
                    send_fee: parseFloat(parseFloat(this.state.average_fee)/8).toFixed(8),
                    send_total: parseFloat(parseFloat(this.state.send_amount)+parseFloat(this.state.average_fee)/8).toFixed(8),
                    active_fee: speed
                });
            }
        }
    }

    render() {
        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {

            return <div className="col-xs-12 single-key" key={key}>
                <div className="col-xs-7">
                    <div className="key">{keys[key].public_key}</div>
                </div>
                <div className="pull-right">
                    <button disabled={keys[key].pending_btc_bal >= 0 && this.state.average_fee !== 0
                        ? ''
                        : 'disabled'} onClick={this.openSendReceive.bind(this, key, 'send')}>SEND <img src="images/send.png"
                                                                                             alt="Send"/></button>
                    <button onClick={this.openSendReceive.bind(this, key, 'receive')}>RECEIVE <img
                        src="images/import.png" alt="Receive"/></button>
                </div>
                <div className="col-xs-12">
                    <div className="row amounts">
                        <span
                            className="col-xs-6 amount">Safex: <span>{keys[key].pending_safex_bal < 0 ? (parseFloat(keys[key].safex_bal) + parseFloat(keys[key].pending_safex_bal)) : keys[key].safex_bal}
                            {keys[key].pending_safex_bal > 0 | keys[key].pending_safex_bal < 0 ? '(pending ' + keys[key].pending_safex_bal + ')' : ''}</span></span>
                        <span
                            className="col-xs-6 amount">Bitcoin: <span>{keys[key].pending_btc_bal < 0 ? (parseFloat(keys[key].btc_bal) + parseFloat(keys[key].pending_btc_bal)).toFixed(8) : keys[key].btc_bal}
                            {keys[key].pending_btc_bal > 0 | keys[key].pending_btc_bal < 0 ? '(pending ' + keys[key].pending_btc_bal + ')' : ''}</span></span>
                    </div>
                </div>
                <form onSubmit={this.openCoinModal}
                      className={this.state.collapse_open.send_open && this.state.collapse_open.key === key
                          ? 'col-xs-12 form-inline form-send active'
                          : 'col-xs-12 form-inline form-send'}>
                    <div className="row">
                        <div className="col-xs-8 send-left">
                            <label htmlFor="which">Currency</label>
                            <img className={this.state.send_coin === 'safex'
                                ? 'coin active'
                                : 'coin'} onClick={this.sendCoinChoose.bind(this, 'safex')} src="images/safex-coin.png"
                                 alt="Safex Coin"/>
                            <img className={this.state.send_coin === 'btc'
                                ? 'coin active'
                                : 'coin'} onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png"
                                 alt="Bitcoin Coin"/>
                            <input type="hidden" name="which" readOnly value={this.state.send_coin}></input>
                            <input type="hidden" name="private_key" readOnly value={keys[key].private_key}></input>
                            <input type="hidden" name="public_key" readOnly value={keys[key].public_key}></input>
                            <div className="input-group">
                                <span className="input-group-addon" id="basic-addon1">TO:</span>
                                <input name="destination" type="text" className="form-control" placeholder="Address"
                                       aria-describedby="basic-addon1"/>
                            </div>
                        </div>
                        <div className="col-xs-4">
                            <div className="form-group">
                                <label htmlFor="amount">Amount<span className={this.state.send_coin === "safex"
                                    ? ''
                                    : 'hidden-xs hidden-sm hidden-md hidden-lg'}>(Safex)</span>:</label>
                                <input type="number" name="amount" onChange={this.sendAmountOnChange}
                                       value={this.state.send_amount}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">Fee(BTC):</label>
                                <input type="number" name="fee" onChange={this.sendFeeOnChange}
                                       onBlur={this.sendFeeOnBlur} value={this.state.send_fee}/>
                            </div>
                            <div className="form-group">
                                <p>Insufficient BTC for Safex transaction</p>
                            </div>
                            <div className="form-group fee-buttons">
                                <button className={this.state.active_fee === 'slow'
                                    ? 'active'
                                    : ''} onClick={this.feeChange.bind(this, 'slow')}>Slow</button>
                                <button className={this.state.active_fee === 'med'
                                    ? 'active'
                                    : ''} onClick={this.feeChange.bind(this, 'med')}>Med</button>
                                <button className={this.state.active_fee === 'fast'
                                    ? 'active'
                                    : ''} onClick={this.feeChange.bind(this, 'fast')}>Fast</button>
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
                        <input name="receive-address" value={keys[key].public_key}/>
                    </div>
                    <div className="col-xs-8">
                        <label htmlFor="amount">Amount:</label>
                        <input type="amount" placeholder="1" onChange={this.amountChange.bind(this)}
                               value={this.state.receive_amount}/>
                    </div>
                    <div className="col-xs-4">
                        <div className="row">
                            <div className="col-xs-6">
                                <QRCode
                                    value={"bitcoin:" + keys[key].public_key + "?amount=" + this.state.receive_amount}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });

        return (
            <div className="wallet-page">
                <Navigation/>
                <div className="container key-buttons status">
                    <button disabled>Status:
                        <span className={this.state.btc_sync
                            ? 'status-green'
                            : 'status-red'}>BTC</span>
                        <span className={this.state.safex_sync
                            ? 'status-green'
                            : 'status-red'}>SAFEX</span>
                    </button>
                    <button disabled>
                        {this.state.status_text}
                    </button>
                </div>
                <div className="container key-buttons">
                    <div className="row">
                        <div className="col-xs-12">
                            <button onClick={this.createKey}>Create key</button>
                            <form onChange={this.importKeyChange} onSubmit={this.importKey}>
                                <input name="key" value={this.state.import_key}></input>
                                <button type="submit">Import key</button>
                            </form>
                            <button onClick={this.exportWallet}>Export Wallet</button>
                            <button className={this.state.refreshTimer === 0
                                ? 'refresh-button'
                                : 'refresh-button disabled'} onClick={this.refreshWallet}><img src="images/refresh.png" /><span>{this.state.refreshTimer+'s'}</span></button>
                        </div>
                    </div>
                </div>
                <div className="container keys-container">
                    <div className="col-xs-12">
                        <div className="row">
                            {table}
                        </div>
                    </div>
                </div>
                <div className={this.state.send_overflow_active
                    ? 'overflow sendModal active'
                    : 'overflow sendModal'}>
                    <form className="container" onSubmit={this.sendCoins}>
                        <div className="col-xs-12">
                            <h3>Sending <span className="close" onClick={this.closeCoinModal}>X</span></h3>
                            <div className="col-xs-10 col-xs-offset-1">
                                <div className="col-xs-12">
                                    <div className="currency">
                                        Currency: <img className={this.state.send_coin === 'safex'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                                       onClick={this.sendCoinChoose.bind(this, 'safex')}
                                                       src="images/safex-coin.png" alt="Safex Coin"/>
                                        <img className={this.state.send_coin === 'btc'
                                            ? 'coin'
                                            : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                             onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png"
                                             alt="Bitcoin Coin"/>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-addon" id="basic-addon1">FROM:</span>
                                    <input name="from" type="text" className="form-control" readOnly
                                           value={this.state.send_keys.public_key} placeholder="Address"
                                           aria-describedby="basic-addon1"/>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-addon" id="basic-addon1">TO:</span>
                                    <input name="destination" type="text" className="form-control" readOnly
                                           value={this.state.send_to} placeholder="Address"
                                           aria-describedby="basic-addon1"/>
                                </div>
                                <input type="hidden" readOnly name="private_key"
                                       value={this.state.send_keys.private_key}></input>
                                <input type="hidden" readOnly name="public_key"
                                       value={this.state.send_keys.public_key}></input>
                                <div className="col-xs-6 col-xs-offset-3">
                                    <div className="form-group">
                                        <label htmlFor="amount">Amount:</label>
                                        <input readOnly name="amount" value={this.state.send_amount}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fee">Fee(BTC):</label>
                                        <input readOnly name="fee" value={this.state.send_fee}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="total">Total:</label>
                                        <input readOnly name="total" value={this.state.send_total}></input>
                                    </div>
                                    <button className='' type="submit">CONFIRM</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className={this.state.transaction_sent
                    ? 'overflow sendModal active'
                    : 'overflow sendModal'}>
                    <form className="container" onSubmit={this.closeSuccessModal}>
                        <div className="col-xs-12">
                            <h3>Sent <span className="close" onClick={this.closeSuccessModal}>X</span></h3>
                            <div className="col-xs-10 col-xs-offset-1">
                                <div className="col-xs-12">
                                    <div className="currency">
                                        Currency: <img className={this.state.send_coin === 'safex'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                                       onClick={this.sendCoinChoose.bind(this, 'safex')}
                                                       src="images/safex-coin.png" alt="Safex Coin"/>
                                        <img className={this.state.send_coin === 'btc'
                                            ? 'coin'
                                            : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                             onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png"
                                             alt="Bitcoin Coin"/>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-addon" id="basic-addon1">FROM:</span>
                                    <input name="from" type="text" className="form-control" readOnly
                                           value={this.state.send_keys.public_key} placeholder="Address"
                                           aria-describedby="basic-addon1"/>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-addon" id="basic-addon1">TO:</span>
                                    <input name="destination" type="text" className="form-control" readOnly
                                           value={this.state.send_to} placeholder="Address"
                                           aria-describedby="basic-addon1"/>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-addon" id="basic-addon1">TX ID:</span>
                                    <input name="destination" type="text" className="form-control" readOnly
                                           value={this.state.txid} placeholder="Address"
                                           aria-describedby="basic-addon1"/>
                                </div>
                                <input type="hidden" readOnly name="private_key"
                                       value={this.state.send_keys.private_key}></input>
                                <input type="hidden" readOnly name="public_key"
                                       value={this.state.send_keys.public_key}></input>
                                <div className="col-xs-6 col-xs-offset-3">
                                    <div className="form-group">
                                        <label htmlFor="amount">Amount:</label>
                                        <input readOnly name="amount" value={this.state.send_amount}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fee">Fee(BTC):</label>
                                        <input readOnly name="fee" value={this.state.send_fee}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="total">Total:</label>
                                        <input readOnly name="total" value={this.state.send_total}></input>
                                    </div>
                                    <button type="submit">Close X</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
