import React from "react";
import axios from "axios";

export default class DividendModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            totalTradeVolume: 500000000,
            marketplaceFee: 5,
            marketplaceEarnings: 0,
            safexMarketCap: 0,
            safexDividendYield: 0,
            safexDividendInfo: false,
            safexHoldingsInfo: false,
            safexHolding: 100000,
            holdingsByMarket: 0,
            holdingsYield: 0,
            safexPrice: 0,
            selectedAmount: 0,
            safexQuantity: 0,
        };
    }

    componentWillMount() {
        axios({method: 'post', url: 'https://safex.io/api/price/'}).then(res => {

            var safex_price = parseFloat(res.data.price_usd);
            var safex_dividend = (parseFloat(this.state.totalTradeVolume) *
                (parseFloat(this.state.marketplaceFee) / 100) /
                parseFloat(safex_price * 2147483647)) * 100;

            var dividend_yield = (safex_price * 100000 * (safex_dividend / 100)).toFixed(2);
            var holdings_market = safex_price * 100000;

            this.setState({
                holdingsYield: dividend_yield,
                holdingsByMarket: holdings_market.toFixed(2),
                safexPrice: safex_price,
                safexMarketCap: (safex_price * 2147483647).toFixed(0),
                safexDividendYield: safex_dividend.toFixed(2)
            });
        }).catch(function (error) {
            console.log(error);
        });

        axios({method: 'get', url: 'https://api.coinmarketcap.com/v1/ticker/safe-exchange-coin/'}).then(res => {
            var total_supply = res.data[0].total_supply;

            this.setState({
                safexQuantity: total_supply
            });
        }).catch(function(error) {
            console.log(error);
        });
    }

    safexDividendOnChange(e) {
        e.preventDefault();
        var safexDividendYield = 0;

        if (e.target.name === "total_trade_volume") {
            safexDividendYield = parseFloat(e.target.value) * (parseFloat(this.state.marketplaceFee) / 100) / parseFloat(this.state.safexMarketCap);
            this.setState({
                totalTradeVolume: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "marketplace_fee") {
            safexDividendYield = (parseFloat(e.target.value) / 100) * parseFloat(this.state.totalTradeVolume) / parseFloat(this.state.safexMarketCap);
            this.setState({
                marketplaceFee: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "safex_market_cap") {
            safexDividendYield = (parseFloat(this.state.marketplaceFee) / 100) * parseFloat(this.state.totalTradeVolume) / parseFloat(e.target.value);
            this.setState({
                safexMarketCap: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "safex_holdings") {
            safexDividendYield = ((parseFloat(this.state.marketplaceFee) / 100) * parseFloat(this.state.totalTradeVolume) / 2147483647) * parseFloat(e.target.value) * (100 / (parseFloat(this.state.holdingsByMarket)));
            this.setState({
                safexHolding: e.target.value,
                safexDividendYield: safexDividendYield.toFixed(2)
            })
        }
    }

    render() {
        return (
            <div className={this.props.dividendActive ? "dividend-wrap active" : "dividend-wrap"}>
                {
                    this.props.dividendActive
                    ?
                        <form className="container" onChange={this.safexDividendOnChange.bind(this)}>
                            <div className="head">
                                <img src="images/dividend-logo.png" alt="Transfer Icon"/>
                                <h3>
                                    Dividend<br />
                                    Calculator
                                </h3>
                                <span className="close" onClick={this.props.closeDividendModal}>X</span>
                            </div>

                            <div className="form-group">
                                <label>
                                    Projected Marketplace Volume $
                                </label>
                                <input type="number" name="total_trade_volume" value={this.state.totalTradeVolume}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Marketplace Fee %
                                </label>
                                <input type="number" name="marketplace_fee" value={this.state.marketplaceFee}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Safex Market Cap $
                                </label>
                                <input type="number" name="safex_market_cap" value={this.state.safexMarketCap}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Number of SAFEX Held
                                </label>
                                <input type="number" name="safex_holdings" value={this.state.safexHolding}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Cost of Safex Holdings $
                                </label>
                                <input type="number" name="safex_holdings_by_market" value={this.state.holdingsByMarket} readOnly/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Annual Return on Investment %
                                </label>
                                <input type="number" name="safex_dividend_yield" value={isNaN(this.state.safexDividendYield) ? '0' : this.state.safexDividendYield}/>
                            </div>
                        </form>
                    :
                        <div></div>
                }
            </div>
        );
    }
}