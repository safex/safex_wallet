import React from 'react';

import {get_utxos, broadcastTransaction, setSafexMigrationAddress, getFee, BURN_ADDRESS} from '../../utils/migration';
import {openMigrationAlert, closeMigrationAlert, openResetMigration, closeResetMigration, confirmReset} from '../../utils/modals';
import MigrationAlert from "../partials/MigrationAlert";
import ResetMigration from "../partials/ResetMigration";

//Set First Half of the Safex Address
export default class Migrate3 extends React.Component {
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
            txn_fee: 0,
            migration_alert: false,
            migration_alert_text: '',
            fee: 0,
            reset_migration: false
        };

        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.getTxnFee = this.getTxnFee.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
        this.setOpenResetMigration = this.setOpenResetMigration.bind(this);
        this.setCloseResetMigration = this.setCloseResetMigration.bind(this);
        this.setConfirmReset = this.setConfirmReset.bind(this);
    }

    componentDidMount() {
        this.getBalances(this.props.data.address);
        this.getTxnFee();

        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            safex_key: this.props.data.safex_key,
            fee: this.props.data.fee,
            loading: false
        });
        console.log(this.state.address)
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

    refresh() {
        this.getBalances(this.state.address);
    }

    getTxnFee() {
        //public spend key is first half
        get_utxos(this.props.data.address)
            .then(utxos => {
                const payload = '536166657831' +
                    this.props.data.safex_key.spend.pub +
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
                this.setOpenMigrationAlert("Either you do not have enough Bitcoins to complete the transaction " +
                    "or the connection to the Bitcoin Blockchain is interrupted");
            });
    }

    setSafexAddress(e) {
        e.preventDefault();
        console.log(this.state.safex_key)
        //public spend key is first half

        get_utxos(this.state.address)
            .then(utxos => {
                const payload = '536166657831' +
                    this.props.data.safex_key.spend.pub +
                    this.props.data.safex_key.checksum;

                const rawtx = setSafexMigrationAddress(
                    utxos,
                    BURN_ADDRESS,
                    this.state.wif,
                    payload,
                    this.props.data.fee
                );

                return rawtx;
                console.log(rawtx)

            })
            .then(rawtx => broadcastTransaction(rawtx))
            .then(result => {
                this.props.setMigrationProgress(3);
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

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    setOpenResetMigration() {
        openResetMigration(this);
    }

    setCloseResetMigration() {
        closeResetMigration(this);
    }

    setConfirmReset() {
        confirmReset(this);
    }

    //take firsthalf and send transaction
    render() {
        return (
            <div>
                <p>Step 3/4</p>

                <p>
                    Setting your Safex Address for Migration requires two steps. In this step we will set
                    the First Half of the Safex Address. This will require a bitcoin fee.
                    The next step will also require a bitcoin fee.
                </p>

                <p>
                    <span className="span-200">You target migration address:</span><br />
                    {this.state.safex_key.public_addr}
                </p>

                <p><span>You will need</span> {this.state.txn_fee} btc </p>
                <p><span>Your btc balance</span> {this.state.btc_bal} btc</p>

                <button className="button-shine" onClick={this.setSafexAddress}>Set the first half</button>
                <button className="button-shine red-btn" onClick={this.setOpenResetMigration}>Reset</button>

                <MigrationAlert
                    migrationAlert={this.state.migration_alert}
                    migrationAlertText={this.state.migration_alert_text}
                    closeMigrationAlert={this.setCloseMigrationAlert}
                />

                <ResetMigration
                    resetMigration={this.state.reset_migration}
                    confirmReset={this.setConfirmReset}
                    openResetMigration={this.setOpenResetMigration}
                    closeResetMigration={this.setCloseResetMigration}
                />
            </div>
        )
    }
}