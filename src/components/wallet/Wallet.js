import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
var bitcoin = window.require('bitcoinjs-lib');

import Navigation from '../Navigation';


export default class Wallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keys: [],
            wallet: {},
            is_loading: false,
        }

        this.createKey = this.createKey.bind(this);
    }


    componentDidMount() {

        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            console.log(e);
        }
    }

    sendBitcoin() {

    }

    sendSafex() {

    }

    getBitcoinHistory() {

    }

    getSafexHistory() {

    }

    createKey() {
        this.setState({is_loading: true});

        var random_array = new Uint8Array(32);
        window.crypto.getRandomValues(random_array);
        var priv_key_bytes = [];

        for (var i = 0; i < random_array.length; ++i) {
            priv_key_bytes[i] = random_array[i];
        }

        var hex_string = this.toHexString(priv_key_bytes).toUpperCase();

        var priv_key_and_version = "80" + hex_string;
        var first_bytes = Buffer.from(priv_key_and_version, 'hex');
        var first_sha = bitcoin.crypto.sha256(first_bytes);
        var second_sha = bitcoin.crypto.sha256(first_sha);
        var checksum = this.toHexString(second_sha).substr(0, 8).toUpperCase();
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

        var cipher_text = this.encrypt(JSON.stringify(json), algorithm, password);


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

    importKey() {

    }

    exportKey() {

    }

    encrypt(text, algorithm, password) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    decrypt(text, algorithm, password) {
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    }

    toHexString(byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

    render() {

        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {
            return <tbody key={key}>
            <tr>
                <td>{keys[key].public_key}</td>
                <td>safex: 00.00</td>
                <td>bitcoin: 00.00</td>
                <td>
                    <button>send</button>
                </td>
                <td>
                    <button>receive</button>
                </td>
                <td>
                    <button>clipboard</button>
                </td>
            </tr>
            <tr>
                <td>
                    <form>
                        <input name="source" value={keys[key].public_key}></input>
                        <input name="amount"></input>
                        <input name="fee"></input>
                        <input name="destination"></input>
                        <button>Send</button>
                    </form>
                </td>
            </tr>
            </tbody>
        });

        return (
            <div>
                <Navigation />
                <ul>
                    <li>
                        <button onClick={this.createKey}>create key</button>
                    </li>
                    <li>
                        <button>import key</button>
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