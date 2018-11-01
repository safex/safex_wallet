import React from "react";

import Migrate1 from "./Migrate1";
import Migrate2 from "./Migrate2";
import Migrate3 from "./Migrate3";
import Migrate4 from "./Migrate4";
import Migrate5 from "./Migrate5";

import { getFee } from "../../utils/migration";
import { encrypt } from "../../utils/utils";

const fs = window.require("fs");

import {
    openMigrationAlert,
    closeMigrationAlert,
    openResetMigration,
    closeResetMigration,
    confirmReset
} from "../../utils/modals";
import MigrationAlert from "../partials/MigrationAlert";
import ResetMigration from "../partials/ResetMigration";

export default class MigrationAddress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      label: "",
      address: "",
      wif: "",
      safex_bal: 0,
      pending_safex_bal: 0,
      btc_bal: 0,
      pending_btc_bal: 0,
      safex_price: 0,
      btc_price: 0,
      status_text: "",
      migration_progress: 0,
      show_migration: false,
      safex_key: {},
      migration_alert: false,
      migration_alert_text: "",
      fee: 0,
      refreshTimer: 0,
      refreshInterval: "",
      table_expanded: false,
      reset_migration: false,
      safex_address_meta: {
        Safex5ztDMv5nM3y1ycT4vKNyeRE4MQFW8pHVaTDFzP5TsofLJ86SpbAtbB6nEtkMJ1xkDjfuEcKwe78wrwvXEsEVKuU3azLUo61Y: {
          hidden: false
        },
        Safex61AUGG1vFWiket69ocRxVf5nRgvMF3Yq7nSA1mYCDkRYZnDoJ3P4FF3w8EdLp5fbZeWHJxc6ZRAxV8T2yo1GyJtRstQLHP3D: {
          hidden: false
        },
        Safex5zuPyx8QToo1eYF6rfvkVxinWHJmHogYXUJTKQAfEsXaVnVpgdAEmMaTnBLREiYtpWPTqDwNDcYhEN4F2XBWnTJohcpLbz29: {
          hidden: false
        },
        Safex5zNzaB8xVZoGhKaPBPKreTacF9FE19UT2WZ84GoUwqDAgL3GzfS8y19dXSM6ETi1m8bkkjuRSdBHQf87DijePpfzBTGzgS2p: {
          hidden: false
        }
      },
      safex_addresses: [
        {
          address:
            "Safex5ztDMv5nM3y1ycT4vKNyeRE4MQFW8pHVaTDFzP5TsofLJ86SpbAtbB6nEtkMJ1xkDjfuEcKwe78wrwvXEsEVKuU3azLUo61Y",
          checksum: "83f0651f",
          blockheight1: 544899,
          blockheight2: 544899,
          balance: 0,
          burns: []
        },
        {
          address:
            "Safex61AUGG1vFWiket69ocRxVf5nRgvMF3Yq7nSA1mYCDkRYZnDoJ3P4FF3w8EdLp5fbZeWHJxc6ZRAxV8T2yo1GyJtRstQLHP3D",
          checksum: "eff4ea80",
          blockheight1: 544900,
          blockheight2: 544900,
          balance: 1,
          burns: [Array]
        },
        {
          address:
            "Safex5zuPyx8QToo1eYF6rfvkVxinWHJmHogYXUJTKQAfEsXaVnVpgdAEmMaTnBLREiYtpWPTqDwNDcYhEN4F2XBWnTJohcpLbz29",
          checksum: "968b2142",
          blockheight1: 544995,
          blockheight2: 544995,
          balance: 1,
          burns: [Array]
        },
        {
          address:
            "Safex5zNzaB8xVZoGhKaPBPKreTacF9FE19UT2WZ84GoUwqDAgL3GzfS8y19dXSM6ETi1m8bkkjuRSdBHQf87DijePpfzBTGzgS2p",
          checksum: "05dc6b69",
          blockheight1: 546475,
          blockheight2: 546475,
          balance: 128,
          burns: [Array]
        }
      ]
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
  }

  componentDidMount() {
    this.setState({
      label: this.props.data.label,
      address: this.props.data.address,
      wif: this.props.data.wif,
      migration_progress: this.props.data.migration_progress,
      loading: false,
      safex_key: this.props.data.safex_key,
      fee: this.props.data.fee
    });
    this.getBalances(this.props.data.address);
  }

  getBalances(address) {
    this.setState({ loading: true });
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
          safex_price: localStorage.getItem("safex_price"),
          btc_price: localStorage.getItem("btc_price"),
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
      console.log("Page refreshed");
    }
  }

  refreshPageTimer = () => {
    if (this.state.refreshTimer > 0) {
      this.setState({ refreshTimer: this.state.refreshTimer - 1 });
    } else {
      clearInterval(this.state.refreshInterval);
    }
  };

  setMigrationVisible() {
    if (this.state.show_migration == true) {
      this.setState({ show_migration: false });
    } else {
      this.setState({ show_migration: true });
    }
  }

  setMigrationProgress(step) {
    this.setState({ loading: true });

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
      alert("Error parsing the wallet data");
    }
  }

  setOpenMigrationAlert(message) {
    openMigrationAlert(this, message);
  }

  setCloseMigrationAlert() {
    closeMigrationAlert(this);
  }

  toggleAddress(address) {
    this.setState(() => ({
      safex_address_meta: {
        ...this.state.safex_address_meta,
        [address]: { hidden: !this.state.safex_address_meta[address].hidden }
      }
    }));
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
      if (this.state.show_migration) {
          this.setMigrationVisible();
      }
  }

  render() {
    let { migration_progress, address, wif, safex_key, fee } = this.state;
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
        //set first half of key
        migration_shot = (
          <Migrate3
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
        //set second half of key
        migration_shot = (
          <Migrate4
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
        //send to burn address
        migration_shot = (
          <Migrate5
            setMigrationVisible={this.setMigrationVisible}
            setMigrationProgress={this.setMigrationProgress}
            key={address}
            data={data}
            refresh={this.refresh}
          />
        );
        break;
    }

    const safex_address = this.state.safex_addresses.map(address => (
      <tr key={address.address}>
        <td
          className={
            this.state.safex_address_meta[address.address].hidden
              ? "address expanded"
              : "address"
          }
          id="address"
        >
          <span>
            {this.state.safex_address_meta[address.address].hidden
              ? address.address
              : address.address.slice(0, 6) +
                "..." +
                address.address.slice(address.address.length - 4)}
          </span>
          <button
            onClick={() => this.toggleAddress(address.address)}
            className="button-shine"
          >
            {this.state.safex_address_meta[address.address].hidden
              ? "collapse"
              : "expand"}
          </button>
        </td>
        <td className="col-80">{address.balance}</td>
        <td className="col-80">{address.balance}</td>
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
                <tr className="row-clearfix" />

                <tr>
                  <td className="orange-border">BTC</td>
                  <td>{this.state.btc_bal}</td>
                </tr>

                <tr>
                  <td className="orange-border">Pending BTC</td>
                  <td>{this.state.pending_btc_bal}</td>
                </tr>
                <tr className="row-clearfix last" />

                <tr>
                  <td
                    className={
                      this.state.pending_btc_bal >= 0
                        ? "green-border"
                        : "red-border"
                    }
                  >
                    Migrated Balance
                  </td>
                  <td
                    className={
                      this.state.pending_btc_bal >= 0
                        ? "green-text"
                        : "red-text"
                    }
                  >
                    {this.state.pending_btc_bal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-xs-8 keys-table-wrap">
            <h3>Safex addresses</h3>
            <div
              className={
                this.state.table_expanded ? "table-wrap expanded" : "table-wrap"
              }
            >
              <table>
                <thead>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Cash</th>
                </thead>

                <tbody>{safex_address}</tbody>
              </table>
            </div>
          </div>
        </div>

        {/*<button*/}
          {/*onClick={() => {*/}
            {/*this.setMigrationProgress(0);*/}
          {/*}}*/}
        {/*>*/}
          {/*show 1*/}
        {/*</button>*/}
        {/*<button*/}
          {/*onClick={() => {*/}
            {/*this.setMigrationProgress(1);*/}
          {/*}}*/}
        {/*>*/}
          {/*show 2*/}
        {/*</button>*/}
        {/*<button*/}
          {/*onClick={() => {*/}
            {/*this.setMigrationProgress(2);*/}
          {/*}}*/}
        {/*>*/}
          {/*show 3*/}
        {/*</button>*/}
        {/*<button*/}
          {/*onClick={() => {*/}
            {/*this.setMigrationProgress(3);*/}
          {/*}}*/}
        {/*>*/}
          {/*show 4*/}
        {/*</button>*/}
        {/*<button*/}
          {/*onClick={() => {*/}
            {/*this.setMigrationProgress(4);*/}
          {/*}}*/}
        {/*>*/}
          {/*show 5*/}
        {/*</button>*/}

        <button className="button-shine red-btn" onClick={this.setOpenResetMigration}>
          Reset
        </button>

        <button className="button-shine" onClick={this.setMigrationVisible}>
          {this.state.show_migration ? "Hide Migration" : "Migrate"}
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
