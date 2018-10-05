import React from 'react';

import {
    get_utxos,
    generateSafexBtcTransaction,
    broadcastTransaction,
    BURN_ADDRESS,
    setSafexMigrationAddress,
    getFee
} from '../../utils/migration';


//Burn Safe Exchange Coins
export default class Migrate5 extends React.Component {
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
            txn_fee: 0,
        };

        this.refresh = this.refresh.bind(this);
        this.burnSafex = this.burnSafex.bind(this);
        this.validateAmount = this.validateAmount.bind(this);
    }


    componentDidMount() {
        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            loading: false
        });
        this.getBalances(this.props.data.address);
        this.getTxnFee();
        this.setState({loading: false});

    }


    getTxnFee() {
        //public spend key is first half
        get_utxos(this.props.data.address)
            .then(utxos => {
                getFee()
                    .then((fee) => {
                        const rawtx = generateSafexBtcTransaction(
                            utxos,
                            BURN_ADDRESS,
                            this.state.wif,
                            1,
                            fee * 100000000
                        );
                        this.setState({txn_fee: rawtx.fee / 100000000});
                    }).catch(err => {
                    console.log(err)
                })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }

    getBalances(address) {
        var promises = [];
        var json = {};
        json['address'] = address;
        promises.push(fetch('http://omni.safex.io:3001/balance', {
            method: "POST",
            body: JSON.stringify(json)
        }).then(resp => resp.json())
            .then((resp) => {
                return resp
            }));
        promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/balance')
            .then(resp => resp.text())
            .then((resp) => {
                return resp
            }));


        Promise.all(promises).then(values => {
            this.setState({
                safex_bal: values[0].balance,
                btc_bal: (values[1] / 100000000).toFixed(8),
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

    burnSafex(e) {
        e.preventDefault();
        const amount = e.target.amount.value;
        this.setState({loading: true});
        get_utxos(this.state.address)
            .then(utxos => {
                getFee()
                    .then((fee) => {
                        const rawtx = generateSafexBtcTransaction(
                            utxos,
                            BURN_ADDRESS,
                            this.state.wif,
                            amount,
                            fee * 100000000
                        );
                        return rawtx;
                    }).then(rawtx => broadcastTransaction(rawtx))
                    .then(() => this.setState({loading: false}))
                    .catch(err => alert("error broadcasting transaction " + err));
            })
            .catch(err => alert("error getting UTXOs " + err));
    }

    validateAmount(e) {
        if (parseInt(e.target.value) > this.state.safex_bal) {
            alert("not enough safex balance for that transaction, max is " + this.state.safex_bal);
            e.target.value = this.state.safex_bal;
        }
    }

    //create safex blockchain key set

    render() {
        return (
            <div>
                <p>Final Step</p>

                <p>Setting your Safex Address for Migration requires two steps. In this step we will set
                    the First Half of the Safex Address This will require a bitcoin fee.
                    The next step will also require a bitcoin fee.</p>
                <p>yo</p>
                <form onSubmit={this.burnSafex}>
                    <p>You will need {this.state.txn_fee} btc </p>

                    <input onChange={this.validateAmount} name="amount"/>
                    <button>send</button>
                    <p>the burn address: {BURN_ADDRESS} </p>
                </form>
            </div>
        )
    }
}