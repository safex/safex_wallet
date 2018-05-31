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
                    btc = resp[0].price_usd
                    localStorage.setItem('btc_price', btc);
                    this.setState({bitcoin_price: btc});
                }
            } catch (e) {
                console.log(e);
            }
        });
    }


    render() {
        return (<nav className="navbar navbar-default bounceInDown">
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

                    </span>
                </div>

                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right wallet-nav">
                        <li>
                            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Wallet</Link>
                        </li>
                    </ul>
                    {/*<div onClick={this.setHomeView}*/}
                         {/*className={archive_active === false ? 'btn btn-default active' : 'btn btn-default'}>*/}
                        {/*Home*/}
                    {/*</div>*/}
                    {/*<div onClick={this.setArchiveView}*/}
                         {/*className={archive_active === true ? 'btn btn-default active' : 'btn btn-default'}>*/}
                        {/*Archive*/}
                    {/*</div>*/}
                </div>
                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right coin-amounts">
                        <li><span className="currency">SAFEX</span> <span className="amount">${this.state.safex_price}</span></li>
                        <li><span className="currency">BTC</span> <span className="amount">${this.state.bitcoin_price}</span></li>
                    </ul>
                </div>
            </div>
        </nav>);
    }
}
