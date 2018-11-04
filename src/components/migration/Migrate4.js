import React from "react";

import {
    get_utxos,
    broadcastTransaction,
    setSafexMigrationAddress,
    BURN_ADDRESS,
} from "../../utils/migration";
import {
    openMigrationAlert,
    closeMigrationAlert,
    confirmReset
} from "../../utils/modals";
import MigrationAlert from "../migration//partials/MigrationAlert";

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
            migration_alert_text: "",
            fee: 0
        };

        this.setSafexAddress = this.setSafexAddress.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
    }

    getTxnFee() {
        console.log(this.state.safex_key);
        //public view key is second half
        get_utxos(this.props.data.address)
            .then(utxos => {
                const payload =
                    "536166657832" +
                    this.props.data.safex_key.view.pub +
                    this.props.data.safex_key.checksum;

                const rawtx = setSafexMigrationAddress(
                    utxos,
                    BURN_ADDRESS,
                    this.state.wif,
                    payload,
                    this.props.data.fee
                );

                var btc_bal = 0;
                utxos.forEach(txn => {

                    btc_bal += txn.satoshis;
                });
                this.setState({txn_fee: rawtx.fee / 100000000, btc_bal: btc_bal / 100000000});
            })
            .catch(err => {
                console.log("error getting UTXOs " + err);
                this.setOpenMigrationAlert("error getting UTXOs " + err);
            });
    }

    componentDidMount() {
        this.getTxnFee();

        this.props.getUnconfirmed(this.props.data.address);

        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            safex_key: this.props.data.safex_key,
            fee: this.props.data.fee,
            loading: false,
            safex_price: localStorage.getItem("safex_price"),
            btc_price: localStorage.getItem("btc_price")
        });
    }

    setSafexAddress(e) {
        e.preventDefault();
        console.log(this.state.safex_key);
        //public spend key is first half
        if (this.props.data.pending_bal != 0) {
            this.setOpenMigrationAlert("warning you have unconfirmed transactions, please wait until they are confirmed");

        } else {
            get_utxos(this.state.address)
                .then(utxos => {
                    const payload =
                        "536166657832" +
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
                    setTimeout(() => {
                        this.props.setMigrationProgress(4);}, 5000)
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
                <p>Step 4/4 - Setting the Second Half</p>

                <p>
                    Setting your Safex Address for Migration requires two steps. In this
                    step we will set the Second Half of the Safex Address. This will
                    require a bitcoin fee. The next step will also require a bitcoin fee.
                </p>

                <p>
                    <span className="span-200">Your target migration address:</span>
                    <br/>
                    <input
                        className="target-address"
                        value={this.state.safex_key.public_addr}
                    />
                </p>

                <p>
                    <span>You will need</span> {this.state.txn_fee} btc{" "}
                </p>
                <p>
                    <span>Your btc balance</span> {this.state.btc_bal} btc
                </p>

                <button
                    className="button-shine green-btn"
                    onClick={this.setSafexAddress}
                >
                    Set the second half
                </button>

                <MigrationAlert
                    migrationAlert={this.state.migration_alert}
                    migrationAlertText={this.state.migration_alert_text}
                    closeMigrationAlert={this.setCloseMigrationAlert}
                />
            </div>
        );
    }
}
