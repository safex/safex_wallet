import React from 'react';
import {Link} from 'react-router';
import axios from 'axios';

export default class Navigation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            safex_price: 0,
            bitcoin_price: 0,
        }
        this.getSafexPrice = this.getSafexPrice.bind(this);
        this.getBitcoinPrice = this.getBitcoinPrice.bind(this);

    }

    componentDidMount() {

        this.getSafexPrice();
        this.getBitcoinPrice();
    }


    getSafexPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            console.log(res);
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'SAFEX') {
                        console.log(res.data[i].price_usd)
                        this.setState({safex_price: res.data[i].price_usd});
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get latest price of safex
    }

    getBitcoinPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            console.log(res);
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'BTC') {
                        console.log(res.data[i].price_usd)
                        this.setState({bitcoin_price: res.data[i].price_usd});
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get the current price of bitcoin
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
                    <a className="navbar-brand" href="#">
                        <Link to="/wallet"><img src="/images/logo.png"/></Link>
                    </a>
                </div>

                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Wallet <img
                                src="/images/create.png"/></Link>
                        </li>
                        <li>
                            <Link to="/explorer" activeClassName="activeLink">Explorer <img src="/images/explorer.png"/></Link>
                        </li>
                        <li>
                            <Link to="/chat" activeClassName="activeLink">Chat <img src="/images/history.png"/></Link>
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
