import React from 'react';

import {createSafexAddress, verify_safex_address, structureSafexKeys} from '../../utils/migration';
import {openMigrationAlert, closeMigrationAlert} from '../../utils/modals';

const fs = window.require('fs');
import {encrypt} from "../../utils/utils";
import MigrationAlert from "../partials/MigrationAlert";

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
                migration_alert: false,
                migration_alert_text: '',
            };

        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.createSafexKey = this.createSafexKey.bind(this);
        this.saveSafexKeys = this.saveSafexKeys.bind(this);
        this.setYourKeys = this.setYourKeys.bind(this);
        this.selectKey = this.selectKey.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
        this.startOver = this.startOver.bind(this);
        this.goBack = this.goBack.bind(this);
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

    //generates a new random safex key set
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

    //use this after safex keys were generated
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
                console.log('Problem communicating to the wallet file.');
                this.setOpenMigrationAlert('Problem communicating to the wallet file.');
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

    //use this if the keys are provided by the user
    setYourKeys(e) {
        e.preventDefault();
        if (verify_safex_address(e.target.spend_key.value,
            e.target.view_key.value,
            e.target.safex_address.value)) {
            const safex_keys = structureSafexKeys(e.target.spend_key.value, e.target.view_key.value);

            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
            } catch (e) {
                console.log('Error parsing the wallet data.');
                this.setOpenMigrationAlert('Error parsing the wallet data.');
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
                        console.log('Problem communicating to the wallet file.');
                        this.setOpenMigrationAlert('Problem communicating to the wallet file.');
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
                            this.setOpenMigrationAlert('An error adding a key to the wallet. Please contact team@safex.io');
                        }
                    }
                }
            );
        } else {
            console.log('Incorrect keys');
            this.setOpenMigrationAlert('Incorrect keys');
        }
    }

    //use this for selected key from dropdown menu
    selectKey(e) {
        e.preventDefault();
        if (e.target.address_selection.value.length > 0) {
            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
            } catch (e) {
                console.log('Error parsing the wallet data.');
                this.setOpenMigrationAlert('Error parsing the wallet data.');
            }

            var key_index = -1;

            var x_index = -1;

            for (var key in json.keys) {
                if (json.keys[key].public_key == this.props.data.address) {
                    key_index = key;
                    for (var x_key in json.safex_keys) {
                        if (json.safex_keys[key].public_addr == e.target.address_selection.value) {
                            x_index = x_key;
                            json.keys[key_index]['migration_data'] = {};
                            json.keys[key_index]['migration_data'].safex_keys = json.safex_keys[x_index];
                            json.keys[key_index].migration_progress = 2;
                        }
                    }
                }
            }

            if (x_index != -1 && key_index != 1) {
                var algorithm = 'aes-256-ctr';
                var password = localStorage.getItem('password');
                var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

                fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                    if (err) {
                        this.setOpenMigrationAlert('Problem communicating to the wallet file.');
                    } else {
                        try {
                            localStorage.setItem('wallet', JSON.stringify(json));
                            var json2 = JSON.parse(localStorage.getItem('wallet'));
                            this.setState({
                                safex_key: json2.safex_keys[x_index],
                                safex_address: json2.safex_keys[x_index].public_addr,
                                safex_spend_pub: json2.safex_keys[x_index].spend.pub,
                                safex_spend_sec: json2.safex_keys[x_index].spend.sec,
                                safex_view_pub: json2.safex_keys[x_index].view.pub,
                                safex_view_sec: json2.safex_keys[x_index].view.sec,
                                loading: false,
                            });
                            this.props.setMigrationProgress(2);
                        } catch (e) {
                            console.log(e);
                            this.setOpenMigrationAlert('An error adding a key to the wallet. Please contact team@safex.io');
                        }
                    }
                });
            } else {
                console.log('Key does not exist');
                this.setOpenMigrationAlert('Key does not exist');
            }
        } else {
            console.log('No key from your list has been selected');
            this.setOpenMigrationAlert('No key from your list has been selected');
        }
    }

    startOver() {
        this.setState({
            create_address: false
        })
    }

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    goBack() {
        this.props.setMigrationProgress(0);
    }

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
                {
                    this.state.create_address
                    ?
                        <div>
                            <p className="red-text">
                                The following wallet information is to control your coins, do not share it. <br />
                                Abusing these informations can and will result in total loss of your Safex Tokens and Safex Cash.<br />
                                Keep this information safe at all times!
                            </p>
                            <p>Wallet Address</p>
                            <p>{this.state.safex_address}</p>
                            <p>Spend Key</p>
                            <p>public: {this.state.safex_spend_pub}</p>
                            <p>secret: {this.state.safex_spend_sec}</p>
                            <p>View key</p>
                            <p>public: {this.state.safex_view_pub}</p>
                            <p>secret: {this.state.safex_view_sec}</p>

                            <button className="button-shine green-btn" onClick={this.saveSafexKeys}>I have backed up my Safex Key Information</button>
                            <button className="button-shine" onClick={this.createSafexKey}>Create new key</button>
                            <button className="button-shine" onClick={this.startOver}>Go back</button>
                        </div>
                    :
                        <div>
                            <button className="button-shine green-btn" onClick={this.createSafexKey}>create new key</button>

                            <form onSubmit={this.selectKey}>
                                <select name="address_selection">
                                    {options}
                                </select>
                                <button className="button-shine">Set Selected Key</button>
                            </form>

                            <form onSubmit={this.setYourKeys}>
                                <input name="safex_address" placeholder="Safex address" />
                                <input name="spend_key"     placeholder="Secret spend key" />
                                <input name="view_key"      placeholder="Secret view key" />

                                <button className="button-shine">Set your key</button>
                            </form>
                            <button className="button-shine" onClick={this.goBack}>Go Back</button>
                        </div>
                }

                <MigrationAlert
                    migrationAlert={this.state.migration_alert}
                    migrationAlertText={this.state.migration_alert_text}
                    closeMigrationAlert={this.setCloseMigrationAlert}
                />
            </div>
        )
    }
}