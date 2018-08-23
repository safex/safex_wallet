import React from "react";

export default class TransactionSentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.transactionSent ? "transaction-sent-wrap active" : "transaction-sent-wrap"}>
                {
                    this.props.transactionSent
                    ?
                        <form className="container transactionSent" onSubmit={this.props.closeSuccessModal}>
                            <div className="head">
                                <h3>Sent </h3>
                                <span className="close" onClick={this.props.closeSuccessModal}>X</span>
                            </div>
                            <div className="currency">
                                <span>Currency:</span>
                                <img className={this.props.sendCoin === 'safex'
                                    ? 'coin'
                                    : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                     onClick={this.props.sendCoinSafex}
                                     src="images/coin-white.png" alt="Safex Coin"/>
                                <img className={this.props.sendCoin === 'btc'
                                    ? 'coin'
                                    : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                     onClick={this.props.sendCoinBtc} src="images/btc-coin.png"
                                     alt="Bitcoin Coin"/>
                            </div>
                            <div className="input-group">
                                <label htmlFor="from">From:</label>
                                <textarea name="from" className="form-control" readOnly
                                    value={this.props.publicKey} placeholder="Address"
                                    aria-describedby="basic-addon1">
                                </textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="destination">To:</label>
                                <textarea name="destination" className="form-control" readOnly
                                    value={this.props.receiveAddress} placeholder="Address"
                                    aria-describedby="basic-addon1">
                                </textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="txid">TX ID:</label>
                                <textarea name="txid" className="form-control" readOnly
                                    value={this.props.txid}  placeholder="Address"
                                    aria-describedby="basic-addon1" rows="3">
                                </textarea>
                            </div>
                            <input type="hidden" readOnly name="private_key"
                                value={this.props.privateKey} />
                            <input type="hidden" readOnly name="public_key"
                                value={this.props.publicKey} />
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input readOnly name="amount" value={this.props.sendAmount} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">Fee(BTC):</label>
                                <input readOnly name="fee" value={this.props.sendFee} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="total">Total:</label>
                                <input readOnly name="total" value={this.props.sendTotal} />
                            </div>
                            <button type="submit" className="sent-close button-shine">
                                Close
                            </button>
                        </form>
                    :
                        <div></div>
                }
            </div>
        );
    }
}