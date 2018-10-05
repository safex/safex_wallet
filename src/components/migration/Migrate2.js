import React from 'react';

import {createSafexAddress, verify_safex_address, structureSafexKeys} from '../../utils/migration';

const fs = window.require('fs');
import {encrypt} from "../../utils/utils";

var swg = window.require('safex-addressjs');


//Set the Safex Address
export default class Migrate2 extends React.Component {
    constructor(props) {
        super(props);
        this.state =
            {
                loading: true,
                status_text: "",
                create_address: false,
                safex_address: "",
                safex_spend_pub: "",
                safex_spend_sec: "",
                safex_view_pub: "",
                safex_view_sec: "",
                safex_checksum: "",
                safex_key: {},
                safex_keys: {},
            };

        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.createSafexKey = this.createSafexKey.bind(this);
        this.saveSafexKeys = this.saveSafexKeys.bind(this);
        this.setYourKeys = this.setYourKeys.bind(this);
        this.selectKey = this.selectKey.bind(this);
    }


    componentDidMount() {
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            alert('Error parsing the wallet data.');
        }
        this.setState({
            safex_keys: json.safex_keys,
            loading: false
        })
    }


    setSafexAddress(e) {
        e.preventDefault();


    }

    createSafexKey() {
        this.setState({create_address: true, loading: true});

        const safex_keys = createSafexAddress();
        console.log(safex_keys);

        this.setState({
            safex_key: safex_keys,
            safex_address: safex_keys.public_addr,
            safex_spend_pub: safex_keys.spend.pub,
            safex_spend_sec: safex_keys.spend.sec,
            safex_view_pub: safex_keys.view.pub,
            safex_view_sec: safex_keys.view.sec,
            loading: false,
        });
    }

    saveSafexKeys() {
        //in here do the logic for modifying the wallet file data info
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            alert('Error parsing the wallet data.');
        }
        console.log(json)
        if (json.hasOwnProperty('safex_keys')) {
            json['safex_keys'].push(this.state.safex_key);
        } else {
            json['safex_keys'] = [];
            json['safex_keys'].push(this.state.safex_key);
        }

        var index = -1;

        for (var key in json.keys) {
            if (json.keys[key].public_key == this.props.data.address) {
                index = key;
                json.keys[key]['migration_data'] = {};
                json.keys[key]['migration_data'].safex_keys = this.state.safex_key;
                json.keys[key].migration_progress = 2;
            }
        }

        var algorithm = 'aes-256-ctr';
        var password = localStorage.getItem('password');
        var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

        fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
            if (err) {
                alert('Problem communicating to the wallet file.');
            } else {
                try {
                    localStorage.setItem('wallet', JSON.stringify(json));
                    var json2 = JSON.parse(localStorage.getItem('wallet'));
                    console.log(json2.keys[index].migration_data);
                    this.props.setMigrationProgress(2);
                } catch (e) {
                    console.log(e);
                    alert('An error adding a key to the wallet. Please contact team@safex.io');
                }
            }
        });
    }

    setYourKeys(e) {
        e.preventDefault();
        if (verify_safex_address(e.target.spend_key.value,
            e.target.view_key.value,
            e.target.safex_address.value)) {
            const safex_keys = structureSafexKeys(e.target.spend_key.value, e.target.view_key.value);
            console.log(safex_keys)

            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
            } catch (e) {
                alert('Error parsing the wallet data.');
            }
            console.log(json)
            if (json.hasOwnProperty('safex_keys')) {
                json['safex_keys'].push(safex_keys);
            } else {
                json['safex_keys'] = [];
                json['safex_keys'].push(safex_keys);
            }

            var index = -1;

            for (var key in json.keys) {
                if (json.keys[key].public_key == this.props.data.address) {
                    index = key;
                    json.keys[key]['migration_data'] = {};
                    json.keys[key]['migration_data'].safex_keys = safex_keys;
                    json.keys[key].migration_progress = 2;
                }
            }

            var algorithm = 'aes-256-ctr';
            var password = localStorage.getItem('password');
            var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

            fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                    if (err) {
                        alert('Problem communicating to the wallet file.');
                    } else {
                        try {
                            localStorage.setItem('wallet', JSON.stringify(json));
                            this.setState({
                                safex_key: safex_keys,
                                safex_address: safex_keys.public_addr,
                                safex_spend_pub: safex_keys.spend.pub,
                                safex_spend_sec: safex_keys.spend.sec,
                                safex_view_pub: safex_keys.view.pub,
                                safex_view_sec: safex_keys.view.sec,
                                loading: false,
                            });
                            this.props.setMigrationProgress(2);
                        } catch (e) {
                            console.log(e);
                            alert('An error adding a key to the wallet. Please contact team@safex.io');
                        }
                    }
                }
            );
        } else {
            alert("incorrect keys")
        }
    }


    selectSafexKeys() {
        //in here do the logic for modifying the wallet file data info
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            alert('Error parsing the wallet data.');
        }
        console.log(json)
        if (json.hasOwnProperty('safex_keys')) {
            json['safex_keys'].push(this.state.safex_key);
        } else {
            json['safex_keys'] = [];
            json['safex_keys'].push(this.state.safex_key);
        }

        var index = -1;

        for (var key in json.keys) {
            if (json.keys[key].public_key == this.props.data.address) {
                index = key;
                json.keys[key]['migration_data'] = {};
                json.keys[key]['migration_data'].safex_keys = this.state.safex_key;
                json.keys[key].migration_progress = 2;
            }
        }

        var algorithm = 'aes-256-ctr';
        var password = localStorage.getItem('password');
        var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

        fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
            if (err) {
                alert('Problem communicating to the wallet file.');
            } else {
                try {
                    localStorage.setItem('wallet', JSON.stringify(json));
                    var json2 = JSON.parse(localStorage.getItem('wallet'));
                    console.log(json2.keys[index].migration_data);
                    this.props.setMigrationProgress(2);
                } catch (e) {
                    console.log(e);
                    alert('An error adding a key to the wallet. Please contact team@safex.io');
                }
            }
        });
    }

    selectKey(e) {
        e.preventDefault()
        console.log(e.target.address_selection.value);
    }
    //create safex blockchain key set
    //also load the possible keys from other uses

    render() {

        var options = [];
        if (this.state.safex_keys) {
            Object.keys(this.state.safex_keys).map(key => {
                console.log(this.state.safex_keys[key].public_addr)
                options.push(
                    <option
                        key={key}
                        value={this.state.safex_keys[key].public_addr}>
                        {this.state.safex_keys[key].public_addr}
                    </option>)
            });
        }
        console.log(options)

        return (
            <div>

                <p>Step 2/4</p>

                {this.state.create_address ?
                    <div>
                        <p>These are the components</p>
                        <p>{this.state.safex_address}</p>
                        <p>{this.state.safex_spend_pub}</p>
                        <p>{this.state.safex_spend_sec}</p>
                        <p>{this.state.safex_view_pub}</p>
                        <p>{this.state.safex_view_sec}</p>

                        <button onClick={this.saveSafexKeys}>I have backed up my Safex Key Information</button>
                        <button>start over</button>
                    </div>
                    : <div>
                        <button onClick={this.createSafexKey}>create new key (green)</button>

                        <form onSubmit={this.selectKey}>

                            <select name="address_selection">
                                {options}
                            </select>
                            <button>Set Selected Key</button>

                        </form>

                        <form onSubmit={this.setYourKeys}>
                            <input
                                value="Safex5zWwY4Y6jeotfp7WbeyYsBB2TC5HEEpCvvNGy8wgxSsnU8mezWiwGLfMqMJq4TEfYMGeGDPZY7xaa3tkwPiDkS53ezKt7J3K"
                                name="safex_address"/>
                            <input value="c3396a3231a66f547d1422fe0941fc8c9fcf4fa31898f1d283ade4a355854b06"
                                   name="spend_key"/>
                            <input value="771c41938d2dbc893dd5973f4188e308fec3002198f56344472694f2ca5ed40b"
                                   name="view_key"/>

                            <button>set your key</button>
                        </form>
                    </div>}
            </div>

        )
    }
}