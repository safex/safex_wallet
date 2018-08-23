import React from "react";

export default class DividendModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.dividendActive ? "dividend-wrap active" : "dividend-wrap"}>
                {
                    this.props.dividendActive
                    ?
                        <form className="container" onChange={this.props.safexDividendOnChange}>
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
                                <input type="number" name="total_trade_volume" value={this.props.totalTradeVolume}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Marketplace Fee %
                                </label>
                                <input type="number" name="marketplace_fee" value={this.props.marketplaceFee}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Safex Market Cap $
                                </label>
                                <input type="number" name="safex_market_cap" value={this.props.safexMarketCap}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Number of SAFEX Held
                                </label>
                                <input type="number" name="safex_holdings" value={this.props.safexHolding}/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Cost of Safex Holdings $
                                </label>
                                <input type="number" name="safex_holdings_by_market" value={this.props.holdingsByMarket} readOnly/>
                            </div>
                            <div className="form-group">
                                <label>
                                    Annual Return on Investment %
                                </label>
                                <input type="number" name="safex_dividend_yield" value={isNaN(this.props.safexDividendYield) ? '0' : this.props.safexDividendYield}/>
                            </div>
                        </form>
                    :
                        <div></div>
                }
            </div>
        );
    }
}