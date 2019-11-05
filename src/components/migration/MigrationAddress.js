import React from "react";

import Migrate1 from "./Migrate1";
import Migrate2 from "./Migrate2";
import Migrate3 from "./Migrate3";
import Migrate4 from "./Migrate4";
import Migrate5 from "./Migrate5";

import {getFee} from "../../utils/migration";
import {encrypt} from "../../utils/utils";

const fs = window.require("fs");

import {
    openMigrationAlert,
    closeMigrationAlert,
    openResetMigration,
    closeResetMigration,
    confirmReset
} from "../../utils/modals";
import MigrationAlert from "../migration/partials/MigrationAlert";
import ResetMigration from "../migration/partials/ResetMigration";

export default class MigrationAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            label: "",
            address: this.props.data.address,
            wif: "",
            safex_bal: 0,
            pending_safex_bal: 0,
            btc_bal: 0,
            pending_btc_bal: 0,
            safex_price: 0,
            btc_price: 0,
            status_text: "",
            migration_progress: 0,
            migrated_balance: 0,
            show_migration: false,
            safex_key: {},
            migration_alert: false,
            migration_alert_text: "",
            fee: 0,
            refreshTimer: 0,
            refreshInterval: "",
            table_expanded: false,
            reset_migration: false,
            safex_addresses: [],
        };
        this.refresh = this.refresh.bind(this);
        this.setMigrationVisible = this.setMigrationVisible.bind(this);
        this.setMigrationProgress = this.setMigrationProgress.bind(this);
        this.setOpenMigrationAlert = this.setOpenMigrationAlert.bind(this);
        this.setCloseMigrationAlert = this.setCloseMigrationAlert.bind(this);
        this.toggleAddress = this.toggleAddress.bind(this);
        this.setOpenResetMigration = this.setOpenResetMigration.bind(this);
        this.setCloseResetMigration = this.setCloseResetMigration.bind(this);
        this.confirmReset = this.confirmReset.bind(this);
        this.getUnconfirmed = this.getUnconfirmed.bind(this);
    }

    componentDidMount() {
        this.setState({
            label: this.props.data.label,
            wif: this.props.data.wif,
            migration_progress: this.props.data.migration_progress,
            loading: false,
            safex_key: this.props.data.safex_key,
            fee: this.props.data.fee
        });
        this.getBalances(this.props.data.address);
        this.getMigrationBalance();
    }

    getBalances(address) {
        this.setState({loading: true});
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
        promises.push(
            fetch(
                "http://bitcoin.safex.io:3001/insight-api/addr/" + address + "/balance"
            )
                .then(resp => resp.text())
                .then(resp => {
                    return resp;
                })
        );
        promises.push(
            fetch(
                "http://bitcoin.safex.io:3001/insight-api/addr/" +
                address +
                "/unconfirmedBalance"
            )
                .then(resp => resp.text())
                .then(resp => {
                    return resp;
                })
        );
        promises.push(
            fetch("http://omni.safex.io:3001/unconfirmed", {
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
                    safex_bal: values[0].balance,
                    btc_bal: (values[1] / 100000000).toFixed(8),
                    pending_btc_bal: (values[2] / 100000000).toFixed(8),
                    pending_safex_bal: values[3],
                    btc_sync: true,
                    safex_sync: true,
                    status_text: "Synchronized",
                    loading: false
                });
            })
            .catch(e => {
                console.log(e);
                this.setState({
                    status_text: "Sync error, please refresh",
                    loading: false
                });
            });
    }

    getMigrationBalance() {
        this.setState({loading: true});
        var promises = [];
        promises.push(
            fetch("http://omni.safex.io:3010/api/" + this.state.address, {
                method: "POST"
            })
                .then(resp => resp.json())
                .then(resp => {
                    return resp;
                })
        );

        Promise.all(promises)
            .then(values => {
                console.log(values)
                var address_array = [];
                if (values[0].hasOwnProperty('safex_addresses')) {
                    console.log("addresses length " + values[0].safex_addresses.length);
                    for (var i = 0; i < values[0].safex_addresses.length; i++) {
                        address_array.push(values[0].safex_addresses[i]);
                    }
                    console.log(address_array)
                }

                this.setState({
                    migrated_balance: values[0].migrated_balance,
                    safex_addresses: address_array,
                    loading: false
                });
            })
            .catch(e => {
                console.log(e);
                this.setState({
                    status_text: "Sync error, please refresh",
                    loading: false
                });
            });
    }

    getUnconfirmed(address) {
        this.setState({loading: true});
        var promises = [];
        var json = {};
        promises.push(
            fetch(
                "http://bitcoin.safex.io:3001/insight-api/addr/" +
                address +
                "/unconfirmedBalance"
            )
                .then(resp => resp.text())
                .then(resp => {
                    return resp;
                })
        );
        Promise.all(promises)
            .then(values => {
                this.setState({
                    pending_btc_bal: (values[0] / 100000000).toFixed(8),
                    loading: false
                });
            })
            .catch(e => {
                console.log(e);
                this.setState({
                    status_text: "Sync error, please refresh",
                    loading: false
                });
            });

    }

    refresh() {
        if (this.state.refreshTimer === 0) {
            let interval = setInterval(this.refreshPageTimer, 1000);
            this.setState({
                refreshTimer: 23,
                refreshInterval: interval
            });
            this.getBalances(this.state.address);
            this.getMigrationBalance();
            console.log("Page refreshed");
        }
    }

    refreshPageTimer = () => {
        if (this.state.refreshTimer > 0) {
            this.setState({refreshTimer: this.state.refreshTimer - 1});
        } else {
            clearInterval(this.state.refreshInterval);
        }
    };

    setMigrationVisible() {
        if (this.state.show_migration == true) {
            this.setState({show_migration: false});
        } else {
            this.setState({show_migration: true});
        }
    }

    setMigrationProgress(step) {
        this.setState({loading: true});

        try {
            var json_lswallet = JSON.parse(localStorage.getItem("wallet"));
            var index = -1;

            json_lswallet.keys.find((item, i) => {
                if (item.public_key === this.state.address) {
                    index = i;
                }
            });

            let modded_json;
            modded_json = json_lswallet.keys[index];
            modded_json.migration_progress = step;
            json_lswallet.keys[index] = modded_json;

            var algorithm = "aes-256-ctr";
            var password = localStorage.getItem("password");
            var cipher_text = encrypt(
                JSON.stringify(json_lswallet),
                algorithm,
                password
            );

            fs.writeFile(localStorage.getItem("wallet_path"), cipher_text, err => {
                if (err) {
                    alert("Problem communicating to the wallet file.");
                } else {
                    localStorage.setItem("wallet", JSON.stringify(json_lswallet));
                    if (json_lswallet.keys[index].hasOwnProperty("migration_data")) {
                        this.setState({
                            safex_key: json_lswallet.keys[index].migration_data.safex_keys,
                            migration_progress: step,
                            loading: false
                        });
                    } else {
                        this.setState({
                            migration_progress: step,
                            loading: false
                        });
                    }
                }
            });
        } catch (e) {
            console.log(e);
            alert("Error parsing the wallet data");
        }
    }

    setOpenMigrationAlert(message) {
        openMigrationAlert(this, message);
    }

    setCloseMigrationAlert() {
        closeMigrationAlert(this);
    }

    toggleAddress(index) {
        this.setOpenMigrationAlert(index);
    }

    setOpenResetMigration() {
        openResetMigration(this);
    }

    setCloseResetMigration() {
        closeResetMigration(this);
    }

    confirmReset() {
        this.setCloseResetMigration();
        this.setMigrationProgress(0);
        this.setMigrationVisible();
    }

    render() {
        let {
            migration_progress,
            address,
            wif,
            safex_key,
            fee,
            pending_btc_bal,
            pending_safex_bal,
            migrated_balance
        } = this.state;
        let migration_shot;

        switch (migration_progress) {
            case 0:
                var data = {};
                migration_shot = (
                    <Migrate1
                        setMigrationVisible={this.setMigrationVisible}
                        setMigrationProgress={this.setMigrationProgress}
                        key={address}
                        data={data}
                    />
                );
                break;
            case 1:
                var data = {};
                data["address"] = address;
                migration_shot = (
                    <Migrate2
                        setMigrationVisible={this.setMigrationVisible}
                        setMigrationProgress={this.setMigrationProgress}
                        key={address}
                        data={data}
                    />
                );
                break;
            case 2:
                var data = {};
                data["address"] = address;
                data["wif"] = wif;
                data["safex_key"] = safex_key;
                data["fee"] = fee;
                data["pending_bal"] = pending_btc_bal;
                //set first half of key
                migration_shot = (
                    <Migrate3
                        getUnconfirmed={this.getUnconfirmed}
                        setMigrationVisible={this.setMigrationVisible}
                        setMigrationProgress={this.setMigrationProgress}
                        key={address}
                        data={data}
                    />
                );
                break;
            case 3:
                var data = {};
                data["address"] = address;
                data["wif"] = wif;
                data["safex_key"] = safex_key;
                data["fee"] = fee;
                data["pending_bal"] = pending_btc_bal;
                //set second half of key
                migration_shot = (
                    <Migrate4
                        getUnconfirmed={this.getUnconfirmed}
                        setMigrationVisible={this.setMigrationVisible}
                        setMigrationProgress={this.setMigrationProgress}
                        key={address}
                        data={data}
                    />
                );
                break;
            case 4:
                var data = {};
                data["address"] = address;
                data["wif"] = wif;
                data["safex_key"] = safex_key;
                data["fee"] = fee;
                data["pending_bal"] = pending_btc_bal;
                data["pending_safex_bal"] = pending_safex_bal;
                //send to burn address
                migration_shot = (
                    <Migrate5
                        getUnconfirmed={this.getUnconfirmed}
                        setMigrationVisible={this.setMigrationVisible}
                        setMigrationProgress={this.setMigrationProgress}
                        key={address}
                        data={data}
                        refresh={this.refresh}
                    />
                );
                break;
        }

        const safex_address = this.state.safex_addresses.map((address, index) => (
            <tr key={index}>
                <td
                    className="address"
                    id="address"
                >
                  <span>
                    {address.safex_address.slice(0, 6) + "..." + address.safex_address.slice(address.safex_address.length - 4)}
                  </span>
                  <button
                      onClick={() => this.toggleAddress(address.safex_address)}
                      className="button-shine"
                  >
                  expand
                  </button>
                </td>
                <td>{address.balance}</td>
                <td>
                    {(address.balance * 0.00232830643).toFixed(10)}
                </td>
            </tr>
        ));

        return (
            <div className="address-wrap">
                <div className="row">
                    <div className="head col-xs-12">
                        <table>
                            <tbody>
                                <tr>
                                    <td className="border">Address</td>
                                    <td>{this.state.address}</td>
                                </tr>
                            </tbody>
                        </table>

                        {this.state.refreshTimer === 0 ? (
                            <button
                                className="button-shine refresh-btn"
                                onClick={this.refresh}
                            >
                                Refresh
                            </button>
                        ) : (
                            <button
                                className="button-shine refresh-btn disabled"
                                onClick={this.refresh}
                            >
                                {this.state.refreshTimer + " s"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="row address-wrap-inner">
                    <div className="col-xs-4 address-wrap-inner-left">
                        <table>
                            <tbody>
                                <tr>
                                    <td className="blue-border">Safex</td>
                                    <td>{this.state.safex_bal}</td>
                                </tr>

                                <tr>
                                    <td className="blue-border">Pending safex</td>
                                    <td>{this.state.pending_safex_bal}</td>
                                </tr>
                                <tr className="row-clearfix"/>

                                <tr>
                                    <td className="orange-border">BTC</td>
                                    <td>{this.state.btc_bal}</td>
                                </tr>

                                <tr>
                                    <td className="orange-border">Pending BTC</td>
                                    <td>{this.state.pending_btc_bal}</td>
                                </tr>
                                <tr className="row-clearfix last"/>

                                <tr>
                                    <td className="green-border">
                                        Migrated Balance
                                    </td>
                                    <td className="green-text">
                                        {migrated_balance}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="col-xs-8 keys-table-wrap">
                        <h3>Migrations Table</h3>
                        <div
                            className={
                                this.state.table_expanded ? "table-wrap expanded" : "table-wrap"
                            }
                        >
                            <table>
                                <thead>
                                    <tr>
                                        <th>Safex Address</th>
                                        <th>Tokens (SFT)</th>
                                        <th>Cash (SFX)</th>
                                    </tr>
                                </thead>

                                <tbody>{safex_address}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* <button
                        className="button-shine"
                        onClick={() => {
                            this.setMigrationProgress(0);
                        }}
                    >
                    show 1
                </button>
                <button
                        className="button-shine"
                        onClick={() => {
                            this.setMigrationProgress(1);
                        }}
                    >
                    show 2
                </button>
                <button
                        className="button-shine"
                        onClick={() => {
                            this.setMigrationProgress(2);
                        }}
                    >
                    show 3
                </button>
                <button
                        className="button-shine"
                        onClick={() => {
                            this.setMigrationProgress(3);
                        }}
                    >
                    show 4
                </button>
                <button
                        className="button-shine"
                        onClick={() => {
                            this.setMigrationProgress(4);
                        }}
                    >
                    show 5
                </button> */}

                <button className="button-shine" onClick={this.setMigrationVisible}>
                    {this.state.show_migration ? "Hide Migration" : "Migrate"}
                </button>

                <button
                    className={
                        this.state.show_migration ? "button-shine red-btn" : "hidden"
                    }
                    onClick={this.setOpenResetMigration}
                >
                    Reset
                </button>

                {this.state.show_migration ? (
                    <div className="migration-step-wrap">{migration_shot}</div>
                ) : null}

                <MigrationAlert
                    migrationAlert={this.state.migration_alert}
                    migrationAlertText={this.state.migration_alert_text}
                    closeMigrationAlert={this.setCloseMigrationAlert}
                />

                <ResetMigration
                    resetMigration={this.state.reset_migration}
                    confirmReset={this.confirmReset}
                    openResetMigration={this.setOpenResetMigration}
                    closeResetMigration={this.setCloseResetMigration}
                />
            </div>
        );
    }
}
