import React from 'react';

import {createSafexAddress, verify_safex_address, structureSafexKeys} from '../../utils/migration';
import {openMigrationAlert, closeMigrationAlert} from '../../utils/modals';

const fs = window.require('fs');
import {encrypt} from "../../utils/utils";
import MigrationAlert from "../migration//partials/MigrationAlert";

var swg = window.require('safex-addressjs');
const fileDownload = require('react-file-download');

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
                all_field_filled: false,
                used_addresses: false,
                existing_addresses: false,
            };

        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.createSafexKey = this.createSafexKey.bind(this);
        this.saveSafexKeys = this.saveSafexKeys.bind(this);
        this.setYourKeys = this.setYourKeys.bind(this);
        this.selectKey = this.selectKey.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
        this.startOver = this.startOver.bind(this);
        this.checkFields = this.checkFields.bind(this);
        this.usedAddresses = this.usedAddresses.bind(this);
        this.existingAddresses = this.existingAddresses.bind(this);
        this.exportNewWalletAddress = this.exportNewWalletAddress.bind(this);
    }

    componentDidMount() {
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            this.setOpenMigrationAlert('Error parsing the wallet data.');
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
        localStorage.setItem('new_wallet_address', JSON.stringify(safex_keys));

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
            this.setOpenMigrationAlert('Error parsing the wallet data.');
        }

        if (json.hasOwnProperty('safex_keys')) {
            json['safex_keys'].push(this.state.safex_key);
        } else {
            json['safex_keys'] = [];
            json['safex_keys'].push(this.state.safex_key);
        }

        var index = -1;

        for (var key in json.keys) {
            if (json.keys[key].public_key === this.props.data.address) {
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
                    this.exportNewWalletAddress();
                    this.props.setMigrationProgress(2);
                } catch (e) {
                    console.log(e);
                    this.setOpenMigrationAlert('An error adding a key to the wallet. Please contact team@safex.io');
                }
            }
        });
    }

    //use this if the keys are provided by the user
    setYourKeys(e) {
        e.preventDefault();
        if (e.target.spend_key.value === '' || e.target.view_key.value === '' || e.target.safex_address.value === '') {
            this.setOpenMigrationAlert('Fill out all the fields');
        } else {

            let duplicate = false;

            //here check for duplicates
            for (var key in this.state.safex_keys) {
                console.log(this.state.safex_keys[key].spend.sec)
                if (this.state.safex_keys[key].spend.sec === e.target.spend_key.value &&
                    this.state.safex_keys[key].view.sec === e.target.view_key.value &&
                    this.state.safex_keys[key].public_addr === e.target.safex_address.value) {
                    duplicate = true;
                    console.log("duplicate detected")
                }
            }



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
                if (json.hasOwnProperty('safex_keys') && duplicate === false) {
                    json['safex_keys'].push(safex_keys);
                } else if (duplicate === false) {
                    json['safex_keys'] = [];
                    json['safex_keys'].push(safex_keys);
                }

                var index = -1;

                for (var key in json.keys) {
                    if (json.keys[key].public_key === this.props.data.address) {
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
                });
            } else {
                console.log('Incorrect keys');
                this.setOpenMigrationAlert('Incorrect keys or duplicate');
            }
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
                if (json.keys[key].public_key === this.props.data.address) {
                    key_index = key;
                    for (var x_key in json.safex_keys) {
                        if (json.safex_keys[x_key].public_addr === e.target.address_selection.value) {
                            x_index = x_key;
                            json.keys[key_index]['migration_data'] = {};
                            json.keys[key_index]['migration_data'].safex_keys = json.safex_keys[x_index];
                            json.keys[key_index].migration_progress = 2;
                        }
                    }
                }
            }

            if (x_index != -1 && key_index != -1) {
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
            create_address: false,
            used_addresses: false,
            existing_addresses: false,
            all_field_filled: false,
        })
    }

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    checkFields() {
        var safex_address = document.getElementById('safex_address').value;
        var spend_key = document.getElementById('spend_key').value;
        var view_key = document.getElementById('view_key').value;

        if (safex_address !== '' && spend_key !== '' && view_key !== '') {
            this.setState({
                all_field_filled: true
            })
        } else {
            this.setState({
                all_field_filled: false
            })
        }
    }

    usedAddresses() {
        this.setState({
            used_addresses: true
        })
    }

    existingAddresses() {
        this.setState({
            existing_addresses: true
        })
    }

    exportNewWalletAddress() {
        var wallet_data = JSON.parse(localStorage.getItem('new_wallet_address'));
        var new_wallet = "";

        new_wallet += "Public address: " + wallet_data.public_addr + '\n';
        new_wallet += "Spendkey " + '\n';
        new_wallet += "pub: " + wallet_data.spend.pub + '\n';
        new_wallet += "sec: " + wallet_data.spend.sec + '\n';
        new_wallet += "Viewkey " + '\n';
        new_wallet += "pub: " + wallet_data.view.pub + '\n';
        new_wallet += "sec: " + wallet_data.view.sec + '\n';
        var date = Date.now();

        fileDownload(new_wallet, date + 'new_wallet_address.txt');
    }

    render() {
        var options = [];
        if (this.state.safex_keys) {
            Object.keys(this.state.safex_keys).map(key => {
                options.push(
                    <option
                        key={key}
                        value={this.state.safex_keys[key].public_addr}>
                        {this.state.safex_keys[key].public_addr}
                    </option>)
            });
        }

        return (
            <div>
                <p>Step 2/4 - Selecting The Safex Key</p>
                {
                    this.state.create_address
                        ?
                        <div>
                            <div className="set-your-key-head">
                                <div className="set-your-key-left">
                                    <img src="images/migration/cube.png" alt="New Key"/>
                                </div>
                                <div className="set-your-key-right">
                                    <h3 className="green-text">Migrate to new Safex address</h3>
                                </div>
                            </div>
                            <p className="red-text">
                                The following wallet information is to control your coins, do not share it. <br/>
                                Sharing this information can and will result in total loss of your Safex Tokens and
                                Safex Cash.<br/>
                                Keep this information safe at all times!
                            </p>
                            <p>Wallet Address</p>
                            <input type="text" className="new-address-input" defaultValue={this.state.safex_address} />
                            {/* <p>{this.state.safex_address}</p> */}
                            <p>Spend Key</p>
                            <p>public: {this.state.safex_spend_pub}</p>
                            <p>secret: {this.state.safex_spend_sec}</p>
                            <p>View key</p>
                            <p>public: {this.state.safex_view_pub}</p>
                            <p>secret: {this.state.safex_view_sec}</p>

                            <button className="button-shine" onClick={this.startOver}>Go back</button>
                            <button className="button-shine green-btn" onClick={this.saveSafexKeys}>Back up my Safex
                                Keys and continue
                            </button>
                        </div>
                        :
                        <div>
                            {
                                this.state.used_addresses
                                    ?
                                    <div>
                                        <div className="set-your-key-head">
                                            <div className="set-your-key-left">
                                                <img src="images/migration/my-keys.png" alt="My Keys"/>
                                            </div>
                                            <div className="set-your-key-right">
                                                <h3 className="purple-text">Your previously used Safex addresses</h3>
                                            </div>
                                        </div>
                                        <form className="previuously-used-form" onSubmit={this.selectKey}>
                                            <select name="address_selection">
                                                {options}
                                            </select>
                                            <button className="button-shine green-btn">Set address</button>
                                        </form>
                                        <button className="button-shine" onClick={this.startOver}>Go back</button>
                                    </div>
                                    :
                                    <div>
                                        {
                                            this.state.existing_addresses
                                                ?
                                                <div>
                                                    <div className="set-your-key-head">
                                                        <div className="set-your-key-left">
                                                            <img src="images/migration/enter-key.png" alt="Enter Key"/>
                                                        </div>
                                                        <div className="set-your-key-right">
                                                            <h3 className="blue-text">Migration using my existing Safex
                                                                address</h3>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={this.setYourKeys}>
                                                        <div className="form-group">
                                                            <input className="col-xs-8" name="safex_address"
                                                                   placeholder="Safex address" id="safex_address"
                                                                   onChange={this.checkFields}/>
                                                            <label className="col-xs-4 col-form-label"
                                                                   htmlFor="safex_address">If you already have Safex
                                                                address, enter it here</label>
                                                        </div>
                                                        <div className="form-group">
                                                            <input className="col-xs-8" name="spend_key"
                                                                   placeholder="Secret spend key" id="spend_key"
                                                                   onChange={this.checkFields}/>
                                                            <label className="col-xs-4 col-form-label"
                                                                   htmlFor="spend_key">Enter your Safex address secret
                                                                spend key here</label>
                                                        </div>
                                                        <div className="form-group">
                                                            <input className="col-xs-8" name="view_key"
                                                                   placeholder="Secret view key" id="view_key"
                                                                   onChange={this.checkFields}/>
                                                            <label className="col-xs-4 col-form-label"
                                                                   htmlFor="view_key">Enter your Safex address secret
                                                                view key here</label>
                                                        </div>

                                                        <button
                                                            className={this.state.all_field_filled ? "button-shine green-btn" : "button-shine"}>Set
                                                            your address
                                                        </button>
                                                    </form>
                                                    <button className="button-shine" onClick={this.startOver}>Go back
                                                    </button>
                                                </div>
                                                :
                                                <div className="address-wrap-inner">
                                                    <div className="migrate-btns-wrap">
                                                        <div className="col-xs-4 btn-wrap">
                                                            <button
                                                                className={this.state.create_address ? "active" : ""}
                                                                onClick={this.createSafexKey}>
                                                                <img src="images/migration/cube.png" alt="Cube"/>
                                                                <span>New Address</span>
                                                            </button>
                                                            <p>Create new address</p>
                                                        </div>
                                                        <div className="col-xs-4 btn-wrap">
                                                            <button className={this.state.my_address ? "active" : ""}
                                                                    onClick={this.usedAddresses}>
                                                                <img src="images/migration/my-keys.png" alt="My Keys"/>
                                                                <span>Previously Used</span>
                                                            </button>
                                                            <p>Previously used address</p>
                                                        </div>
                                                        <div className="col-xs-4 btn-wrap">
                                                            <button className={this.state.enter_address ? "active" : ""}
                                                                    onClick={this.existingAddresses}>
                                                                <img src="images/migration/enter-key.png"
                                                                     alt="Enter Key"/>
                                                                <span>My Address</span>
                                                            </button>
                                                            <p>Use My Safex address</p>
                                                        </div>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                            }
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