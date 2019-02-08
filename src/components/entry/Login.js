import React from "react";
import { Link } from "react-router";
import { decryptWalletData, flashField } from "../../utils/wallet";
import { walletImportAlert } from "../../utils/modals";
import IntroFooter from "./partials/IntroFooter";

const remote = window.require("electron").remote;

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      wrongPassword: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.walletImportAlertsClose = this.walletImportAlertsClose.bind(this);
  }

  wrongPassword() {
    flashField(this, "wrongPassword");
  }

  openWalletImportAlert(message, duration) {
    walletImportAlert(this, message, duration);
  }

  walletImportAlertsClose() {
    this.setState({
      walletImportAlerts: false,
      walletImportAlertsText: ""
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    localStorage.setItem("password", e.target.password.value);

    let wallet;
    try {
      wallet = decryptWalletData();
    } catch (err) {
      console.error(err);
      this.wrongPassword();
      this.openWalletImportAlert("Wrong password", 5000);
      return;
    }

    localStorage.setItem("wallet", JSON.stringify(wallet));
    this.context.router.push("/wallet");
  }

  //here we load up the wallet into the local storage and move on with life.
  render() {
    return (
      <div className="container">
        <div className="col-xs-12 Login-logo">
          <h2>Safex</h2>
          <h3>Wallet</h3>
          <p>{remote.app.getVersion()}</p>
          <Link className="back-button" to="/">
            <img src="images/back.png" alt="back button" /> Back
          </Link>
        </div>
        <div className="col-xs-12 Login-form">
          <form className="form-group" onSubmit={this.handleSubmit}>
            <input
              className={
                this.state.wrongPassword ? "form-control shake" : "form-control"
              }
              type="password"
              name="password"
              placeholder="Enter Password"
              autoFocus
            />
            <button className="btn btn-default button-neon-blue" type="submit">
              Proceed{" "}
            </button>
          </form>
        </div>

        <IntroFooter />

        <div
          className={
            this.state.walletImportAlerts
              ? "overflow sendModal walletResetModal active"
              : "overflow sendModal walletResetModal"
          }
        >
          <div className="container">
            <h3>
              Wallet Login
              <span onClick={this.walletImportAlertsClose} className="close">
                X
              </span>
            </h3>
            <p>{this.state.walletImportAlertsText}</p>
          </div>
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  router: React.PropTypes.object.isRequired
};
