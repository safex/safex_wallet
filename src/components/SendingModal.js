import React from "react";

export default class SendingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.overflowActive && this.props.transactionSent === false ? "sending-wrap active" : "sending-wrap"}>
                {
                    this.props.overflowActive && this.props.transactionSent === false
                        ?
                        <form className="container transactionBeingSent" onSubmit={this.props.sendCoins}>
                            <div className="head">
                                <h3>Sending </h3>
                                <span className={this.props.transactionBeingSent ? 'close disabled' : 'close'} onClick={this.props.closeCoinModal}>X</span>
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
                                <textarea name="from" className="form-control" readOnly aria-describedby="basic-addon1" value={this.props.publicKey}>
                                    </textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="destination">To:</label>
                                <textarea name="destination" className="form-control" readOnly aria-describedby="basic-addon1" value={this.props.receiveAddress}>
                                    </textarea>
                            </div>
                            <input type="hidden" readOnly name="private_key"
                                   value={this.props.privateKey} />
                            <input type="hidden" readOnly name="public_key"
                                   value={this.props.publicKey} />
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input readOnly name="amount" value={this.props.sendAmount}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">Fee(BTC):</label>
                                <input readOnly name="fee" value={parseFloat(this.props.sendFee).toFixed(8)}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="total">Total:</label>
                                <input readOnly name="total" value={this.props.sendTotal} />
                            </div>
                            <button className={this.props.transactionBeingSent ? 'confirm-btn button-shine-green disabled' : 'confirm-btn button-shine-green'} type="submit">
                                {this.props.transactionBeingSent ? 'Pending' : 'CONFIRM'}
                            </button>
                        </form>
                        :
                        <div></div>
                }
            </div>
        );
    }
}