import React from 'react';
import {Link} from 'react-router';

export default class Navigation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            safex_price: 0,
            bitcoin_price: 0,
        }
        this.getPrices = this.getPrices.bind(this);

    }

    componentDidMount() {

        this.getPrices();
        this.timerID = setInterval(
            () => this.tick(),
            600000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.getPrices();
    }

    getPrices() {
        fetch('https://api.coinmarketcap.com/v1/ticker/safe-exchange-coin/', {method: "GET"})
        .then(resp => resp.json())
        .then((resp) => {
            try {
                var safex = 0.02; // current price while not defined by coinmarketcap
                if (resp[0].symbol === 'SAFEX' && resp[0].price_usd !== null) {
                    safex = parseFloat(resp[0].price_usd);
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
                    btc = resp[0].price_usd
                    localStorage.setItem('btc_price', btc);
                }
            } catch (e) {
                console.log(e);
            }
        });

        this.setState({bitcoin_price: localStorage.getItem('btc_price'), safex_price: localStorage.getItem('safex_price')});
    }


    render() {

        return (<nav className="navbar navbar-default">
            <div className="container">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                            data-target="#navbar-collapse"
                            aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <span className="navbar-brand" href="#">
                        <img src="images/logo.png" alt="Logo"/>
                        <span>v0.0.3</span>
                    </span>
                </div>

                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Wallet <img
                                src="images/create.png" alt="Create"/></Link>
                        </li>
                    </ul>
                </div>
                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right coin-amounts">
                        <li>SAFEX <span className="amount">${this.state.safex_price}</span></li>
                        <li>BTC <span className="amount">${this.state.bitcoin_price}</span></li>
                    </ul>
                </div>
            </div>
        </nav>);
    }
}
