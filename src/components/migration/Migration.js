import React from 'react';

import MigrationAddress from './MigrationAddress';
import Navigation from '../partials/Navigation';
import Footer from "../partials/Footer";

export default class Migration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: "",
            keys: {},
        };

        this.getPrices = this.getPrices.bind(this);
        this.goNext = this.goNext.bind(this);
        this.reloadWallet = this.reloadWallet.bind(this);
        this.wallet = this.wallet.bind(this);
    }

    getPrices() {
        fetch('https://safex.io/api/price/', {method: "POST"})
            .then(resp => resp.json())
            .then((resp) => {
                try {
                    var safex = 0.02;
                    if (resp.price_usd !== null) {
                        safex = parseFloat(resp.price_usd).toFixed(8);
                        this.setState({safex_price: safex});
                    }
                    localStorage.setItem('safex_price', safex);
                } catch (e) {
                    console.log(e);
                }
            });

        fetch('https://api.coinmarketcap.com/v1/ticker/bitcoin/', {method: "GET"})
            .then(resp => resp.json())
            .then((resp) => {
                try {
                    var btc = 0;
                    if (resp[0].symbol === 'BTC') {
                        btc = parseFloat(resp[0].price_usd).toFixed(2);
                        localStorage.setItem('btc_price', btc);
                        this.setState({btc_price: btc});
                    }
                } catch (e) {
                    console.log(e);
                }
            });
    }

    componentDidMount() {
        try {
            const json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            this.setState({
                status_text: 'Failed to parse wallet'
            });
            this.context.router.push('/');
        }
        this.getPrices();
        let setRefreshInterval = setInterval(this.reloadWallet, 600000);
    }

    wallet() {
        this.context.router.push('/wallet');
    }

    reloadWallet() {
        console.log("wallet reloaded");
        try {
            const json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            this.setState({
                status_text: 'Failed to parse wallet'
            });
            this.context.router.push('/');
        }
        this.getPrices();
    }

    goNext(e) {
        e.preventDefault();
        this.context.router.push('/safex')
    }

    render() {
        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {
            var data = {};
            data['label'] = keys[key].label;
            data['address'] = keys[key].public_key;
            data['wif'] = keys[key].private_key;
            data['migration_progress'] = 0;
            data['safex_key'] = {};
            if (keys[key].hasOwnProperty('migration_data')) {
                data['migration_progress'] = keys[key].migration_progress;
                data['safex_key'] = keys[key].migration_data.safex_keys;
            }
            return <MigrationAddress
                reloadWallet={this.reloadWallet}
                key={key}
                data={data}/>;
        });

        return (
            <div>
                <Navigation
                    safexPrice={this.state.safex_price}
                    btcPrice={this.state.btc_price}
                    wallet={this.wallet}
                />

                <div className="container migration-wrap fadeIn">
                    {table}

                    {/*<button className="button-shine" onClick={this.goNext}> To the Real Safex Wallet</button>*/}
                </div>
            </div>
        );
    }
}

Migration.contextTypes = {
    router: React.PropTypes.object.isRequired
};
