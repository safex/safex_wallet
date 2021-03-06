import React from "react";

import {
    get_utxos,
    generateSafexBtcTransaction,
    broadcastTransaction,
    BURN_ADDRESS,
} from "../../utils/migration";

import {
    openMigrationAlert,
    closeMigrationAlert,
    confirmReset
} from "../../utils/modals";

import MigrationAlert from "../migration/partials/MigrationAlert";
import ConfirmMigration from "../migration/partials/ConfirmMigration";

//Burn Safe Exchange Coins
export default class Migrate5 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            safex_key: this.props.data.safex_key,
            loading: true,
            address: this.props.data.address,
            wif: this.props.data.wif,
            safex_bal: 0,
            pending_safex_bal: 0,
            btc_bal: 0,
            pending_btc_bal: 0,
            safex_price: 0,
            btc_price: 0,
            status_text: "",
            txn_fee: 0,
            migration_alert: false,
            migration_alert_text: "",
            migration_complete: false,
            fee: this.props.data.fee,
            confirm_migration: false,
            amount: 0
        };

        this.burnSafex = this.burnSafex.bind(this);
        this.validateAmount = this.validateAmount.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
        this.toggleConfirmMigration = this.toggleConfirmMigration.bind(this);
    }

    componentDidMount() {
        this.getBalances(this.props.data.address);
        this.getTxnFee();
        this.props.getUnconfirmed(this.props.data.address);
        this.setState({loading: false});
    }

    getTxnFee() {
        //public spend key is first half
        get_utxos(this.props.data.address)
            .then(utxos => {
                const rawtx = generateSafexBtcTransaction(
                    utxos,
                    BURN_ADDRESS,
                    this.state.wif,
                    1,
                    this.props.data.fee
                );
                var btc_bal = 0;
                utxos.forEach(txn => {

                    btc_bal += txn.satoshis;
                });
                this.setState({txn_fee: ((rawtx.fee / 100000000) + 0.00000700).toFixed(8), btc_bal: btc_bal / 100000000});
            })
            .catch(err => console.log(err));
    }

    getBalances(address) {
        var promises = [];
        var json = {};
        json["address"] = address;
        promises.push(
            fetch("http://omni.safex.io:3001/balance", {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then(resp => {
                    return resp;
                })
        );

        Promise.all(promises)
            .then(values => {
                this.setState({
                    safex_bal: values[0].balance
                });
            })
            .catch(e => {
                console.log(e);
                this.setState({
                    status_text: "Sync error, please refresh"
                });
            });
    }

    burnSafex(e) {
        e.preventDefault();
            const amount_value = document.getElementById("amount").value;
            const amount = parseInt(amount_value);
            this.setState({loading: true, amount: amount});
            get_utxos(this.state.address)
                .then(utxos => {
                    const rawtx = generateSafexBtcTransaction(
                        utxos,
                        BURN_ADDRESS,
                        this.state.wif,
                        amount,
                        this.props.data.fee
                    );
                    return rawtx;
                })
                .then(rawtx => broadcastTransaction(rawtx))
                .then(() => {
                    this.setState({
                        loading: false,
                    });
                    this.props.refresh();
                    this.toggleConfirmMigration(e);
                })
                .catch(err => {
                    console.log("error broadcasting transaction " + err);
                    this.setOpenMigrationAlert("error broadcasting transaction " + err);
                });

    }

    validateAmount(e) {
        let amount = e.target.value;
        if  (this.state.migration_alert) {
            if (isNaN(e.target.value)) {
                amount = e.target.value.slice(0, e.target.value.length - 1);
            } else {
                this.setState(() => ({
                    migration_alert: false
                }));
            }
            } else {
            if (parseInt(amount) > this.state.safex_bal) {
                console.log(
                    "Not enough safex balance for that transaction, max is " +
                    this.state.safex_bal
                );
                this.setOpenMigrationAlert(
                    "Not enough safex balance for that transaction, max is " +
                    this.state.safex_bal
                );
                e.target.value = this.state.safex_bal;
            } else if (isNaN(e.target.value)) {
                this.setOpenMigrationAlert("Please enter a valid Safex amount");
            }
        }
    }

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    toggleConfirmMigration(e) {
        e.preventDefault();
        if (parseFloat(this.props.data.pending_bal) !== 0 || parseFloat(this.props.data.pending_safex_bal) !== 0) {
            this.setOpenMigrationAlert("Warning: You have unconfirmed transactions, please wait until they are confirmed");
        } else {
            const amount_value = document.getElementById("amount").value;
            const amount = parseInt(amount_value);

            if (amount === "" || isNaN(amount)) {
                this.setOpenMigrationAlert("Please enter a valid Safex amount");
            } else if (this.state.btc_bal < this.state.txn_fee) {
                this.setOpenMigrationAlert("Not enough btc to complete this transaction, you need " + this.state.txn_fee);
            } else {
                this.setState({
                    amount: amount,
                    confirm_migration: !this.state.confirm_migration
                });
            }
        }
    }

    //create safex blockchain key set
    render() {
        var data = {};
        data["amount"] = this.state.amount;
        data["address"] = this.state.safex_key.public_addr;

        console.log(data)

        return (
            <div className="final-step">
                <div>
                    <p>Final Step - Burning your Safe Exchange Coins</p>
                    <p>
                        <span>You will need</span> {this.state.txn_fee} btc{" "}
                    </p>

                    <form
                        className="final-step-form"
                        onSubmit={this.toggleConfirmMigration}
                    >
                        <input
                            onChange={this.validateAmount}
                            name="amount"
                            placeholder="Amount"
                            id="amount"
                        />
                        <button className="button-shine green-btn">
                            {this.state.loading ? "Loading" : "Send"}</button>
                    </form>

                    <p>
                        <span className="span-200">Your target migration address:</span>
                        <br/>
                        <input
                            className="target-address"
                            value={this.state.safex_key.public_addr}
                        />
                    </p>
                    <p>
                        <span className="span-200">The burn address:</span>
                        <br/>
                        <input className="target-address" value={BURN_ADDRESS}/>
                    </p>

                    <MigrationAlert
                        migrationAlert={this.state.migration_alert}
                        migrationAlertText={this.state.migration_alert_text}
                        closeMigrationAlert={this.setCloseMigrationAlert}
                    />

                    <ConfirmMigration
                        confirmMigraton={this.state.confirm_migration}
                        burnSafex={this.burnSafex}
                        closeConfirmMigration={this.toggleConfirmMigration}
                        data={data}
                    />
                </div>
            </div>
        );
    }
}
