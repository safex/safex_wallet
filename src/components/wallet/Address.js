import React from "react";

export default class Address extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      wif: "",
      safex_bal: 0,
      pending_safex_bal: 0,
      btc_bal: 0,
      pending_btc_bal: 0,
      safex_price: 0,
      btc_price: 0,
      status_text: ""
    };
  }

  componentDidMount() {
    this.setState({
      address: this.props.data.address,
      wif: this.props.data.wif
    });

    this.getBalances(this.props.data.address, this.props.data.wif);
  }

  getBalances = address => {
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
          btc_price: localStorage.getItem("btc_price")
        });
      })
      .catch(e => {
        console.log(e);
        this.setState({
          status_text: "Sync error, please refresh"
        });
      });
  };

  refresh = e => {
    e.preventDefault();
    this.getBalances(this.state.address);
  };

  //create safex blockchain key set

  render() {
    return (
      <div>
        address {this.state.address}
        <br />
        wif {this.state.wif}
        <br />
        safex {this.state.safex_bal}
        <br />
        pending safex {this.state.pending_safex_bal}
        <br />
        btc {this.state.btc_bal}
        <br />
        pending btc {this.state.pending_btc_bal}
        <br />
        <button onClick={this.refresh}>refresh</button>
      </div>
    );
  }
}
