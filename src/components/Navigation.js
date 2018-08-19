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
                    btc = parseFloat(resp[0].price_usd).toFixed(2);
                    localStorage.setItem('btc_price', btc);
                    this.setState({bitcoin_price: btc});
                }
            } catch (e) {
                console.log(e);
            }
        });
    }


    render() {
        return (<nav className="navbar navbar-default fadeInDown">
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
                    <ul className="nav navbar-nav wallet-nav fadeIn">
                        <li>
                            <Link activeClassName="activeLink" onlyActiveOnIndex>
                                Wallet &nbsp;v0.0.7
                            </Link>
                        </li>
                    </ul>
                    <div className="wallet-tabs fadeIn">
                        {
                            this.props.archiveActive
                            ?
                                <div>
                                    {
                                        this.props.keyToHome
                                        ?
                                            <div onClick={this.props.setHomeView} className='btn btn-default button-shine glow-active'>
                                                Home
                                            </div>
                                        :
                                            <div onClick={this.props.setHomeView} className='btn btn-default button-shine'>
                                                Home
                                            </div>
                                    }
                                    <div onClick={this.props.setArchiveView} className='btn btn-default button-shine active'>
                                        Archive
                                    </div>
                                </div>
                            :
                                <div>
                                    <div onClick={this.props.setHomeView} className='btn btn-default button-shine active'>
                                        Home
                                    </div>
                                    {
                                        this.props.keyToArchive
                                        ?
                                            <div onClick={this.props.setArchiveView} className='btn btn-default button-shine glow-active'>
                                                Archive
                                            </div>
                                        :
                                            <div onClick={this.props.setArchiveView} className='btn btn-default button-shine'>
                                                Archive
                                            </div>
                                    }
                                </div>
                        }
                    </div>
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
