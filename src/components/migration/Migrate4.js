import React from 'react';

import {get_utxos, broadcastTransaction, setSafexMigrationAddress, BURN_ADDRESS, getFee} from '../../utils/migration';


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
        };

        this.refresh = this.refresh.bind(this);
        this.setSafexAddress = this.setSafexAddress.bind(this);
    }


    getTxnFee() {
        console.log(this.state.safex_key)
        //public spend key is first half
        get_utxos(this.props.data.address)
            .then(utxos => {
                getFee()
                    .then((fee) => {
                        const payload = '536166657832' + this.props.data.safex_key.view.pub + this.props.data.safex_key.checksum;
                        console.log(payload)
                        const rawtx = setSafexMigrationAddress(
                            utxos,
                            BURN_ADDRESS,
                            this.state.wif,
                            payload,
                            fee * 100000000
                        );
                        this.setState({txn_fee: rawtx.fee / 100000000});
                    }).catch(err => {
                    console.log(err)
                })
                    .catch(err => console.log(err));
                /**/
            })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            safex_key: this.props.data.safex_key
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
        //public spend key is first half
        get_utxos(this.state.address)
            .then(utxos => {
                getFee()
                    .then((fee) => {
                        const payload = '536166657832' + this.props.data.safex_key.view.pub + this.props.data.safex_key.checksum;

                        const rawtx = setSafexMigrationAddress(
                            utxos,
                            BURN_ADDRESS,
                            this.state.wif,
                            payload,
                            fee * 100000000
                        );

                        return rawtx;

                    }).then(rawtx => broadcastTransaction(rawtx))
                    .then(result => {
                        this.props.setMigrationProgress(3);
                        console.log(result);
                    })
                    .catch(err => alert("error broadcasting transaction " + err));
            })
            .catch(err => alert("error getting UTXOs " + err));

    }


//take firsthalf and send transaction

    render() {
        return (
            <div>
                <p>Step 3/4</p>

                <p>Setting your Safex Address for Migration requires two steps. In this step we will set
                    the First Half of the Safex Address This will require a bitcoin fee.
                    The next step will also require a bitcoin fee.</p>
                <p>You will need {this.state.txn_fee} btc </p>

                <p>Your bitcoin balance {this.state.btc_bal}</p>
                <button onClick={this.setSafexAddress}>Set the second half</button>
            </div>
        )
    }
}