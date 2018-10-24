import React from 'react';

import {get_utxos, broadcastTransaction, setSafexMigrationAddress, BURN_ADDRESS, getFee} from '../../utils/migration';
import {openMigrationAlert, closeMigrationAlert} from '../../utils/modals';
import MigrationAlert from "../partials/MigrationAlert";

//Set Second Half of the Safex Address
export default class Migrate4 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            address: "",
            wif: "",
            safex_bal: 0,
            pending_safex_bal: 0,
            btc_bal: 0,
            pending_btc_bal: 0,
            safex_price: 0,
            btc_price: 0,
            status_text: "",
            safex_key: {},
            migration_alert: false,
            migration_alert_text: '',
            fee: 0,
        };

        this.refresh = this.refresh.bind(this);
        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
    }

    getTxnFee() {
        console.log(this.state.safex_key);
        //public view key is second half
        get_utxos(this.props.data.address)
            .then(utxos => {
                const payload = '536166657832' +
                    this.props.data.safex_key.view.pub +
                    this.props.data.safex_key.checksum;

                const rawtx = setSafexMigrationAddress(
                    utxos,
                    BURN_ADDRESS,
                    this.state.wif,
                    payload,
                    this.props.data.fee
                );

                this.setState({txn_fee: rawtx.fee / 100000000});
            })
            .catch(err => {
                console.log("error getting UTXOs " + err);
                this.setOpenMigrationAlert("error getting UTXOs " + err);
            });
    }

    componentDidMount() {
        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            safex_key: this.props.data.safex_key,
            fee: this.props.data.fee,
        });

        this.getBalances(this.props.data.address);
        this.getTxnFee();
        this.setState({loading: false});
    }

    getBalances(address) {
        var promises = [];
        var json = {};
        json['address'] = address;
        promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/balance')
            .then(resp => resp.text())
            .then((resp) => {
                return resp
            }));

        Promise.all(promises).then(values => {
            this.setState({
                btc_bal: (values[0] / 100000000).toFixed(8),
                safex_price: localStorage.getItem('safex_price'),
                btc_price: localStorage.getItem('btc_price'),
            });
        }).catch(e => {
            console.log(e)
            this.setState({
                status_text: 'Sync error, please refresh'
            });
        });
    }

    refresh(e) {
        e.preventDefault();
        this.getBalances(this.state.address);
    }

    setSafexAddress(e) {
        e.preventDefault();
        console.log(this.state.safex_key)
        //public view key is second half
        window.require('dns').resolve('omni.safex.io', function (err) {
            if (err) {
                console.log(" error broadcasting transaction " + err);
                this.setOpenMigrationAlert(" transaction not sent, connectivity issue " + err);
            } else {
                get_utxos(this.state.address)
                    .then(utxos => {
                        const payload = '536166657832' +
                            this.props.data.safex_key.view.pub +
                            this.props.data.safex_key.checksum;

                        const rawtx = setSafexMigrationAddress(
                            utxos,
                            BURN_ADDRESS,
                            this.state.wif,
                            payload,
                            this.props.data.fee
                        );

                        return rawtx;

                    })
                    .then(rawtx => broadcastTransaction(rawtx))
                    .then(result => {
                        this.props.setMigrationProgress(4);
                        console.log(result);
                    })
                    .catch(err => {
                        console.log("error broadcasting transaction " + err);
                        this.setOpenMigrationAlert("error broadcasting transaction " + err);
                    })
                    .catch(err => {
                        console.log("error getting UTXOs " + err);
                        this.setOpenMigrationAlert("error getting UTXOs " + err);
                    });
            }
        });
    }

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    //take second half and send transaction
    render() {
        return (
            <div>
                <p>Step 3/4</p>

                <p>
                    Setting your Safex Address for Migration requires two steps. In this step we will set
                    the Second Half of the Safex Address. This will require a bitcoin fee.
                    The next step will also require a bitcoin fee.
                </p>

                <p><span className="span-200">You target migration address:</span> {this.state.safex_key.public_addr}
                </p>
                <p><span>You will need</span> {this.state.txn_fee} btc </p>
                <p><span>Your btc balance</span> {this.state.btc_bal} btc</p>

                <button className="button-shine" onClick={this.setSafexAddress}>Set the second half</button>

                <MigrationAlert
                    migrationAlert={this.state.migration_alert}
                    migrationAlertText={this.state.migration_alert_text}
                    closeMigrationAlert={this.setCloseMigrationAlert}
                />
            </div>
        )
    }
}