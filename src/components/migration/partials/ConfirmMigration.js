import React from "react";

export default class ConfirmMigration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                <div
                    className={
                        this.props.confirmMigraton
                            ? "confirmMigration active"
                            : "confirmMigration"
                    }
                >
                    <div className="resetMigrationInner">
                        <span className="close" onClick={this.props.closeConfirmMigration}>X</span>

                        <p><span>You are burning</span>  <input type="text" className="red-input" value={this.props.data.amount} readOnly />  Safe Exchange Coin(s) in the migration process.</p>
                        <p><span>You will receive</span> <input type="text" value={this.props.data.amount} readOnly /> Safex Tokens (SFT)</p>
                        <p><span>And in addition</span>  <input type="text" value={this.props.data.amount * 0.00232830643} readOnly />  Safex Cash (SFX)<br/></p>
                        <p>Your SFT and SFX will appear on the Safex Blockchain</p>
                        <p>They are being sent to:</p>
                        
                        <textarea readOnly value={this.props.data.address}></textarea>
                        <p>Are you sure you want to proceed with your transaction?</p>
                    
                        <p>
                            This is an irreversible transaction. From here there is no chance of customer support for take backs.
                            The transaction gets written into the bitcoin blockchain and will be processed by the Safex migration system.
                            Proceed only if you understand what are the effects of sending this transaction by clicking OK.
                        </p>
                        
                        <p>Otherwise click cancel.</p>
                        
                        <div className="btns-wrap">
                            <button
                                className="button-shine red-btn"
                                onClick={this.props.closeConfirmMigration}
                            >
                                Cancel
                            </button>
                            <button
                                className="button-shine green-btn"
                                onClick={this.props.burnSafex}
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        this.props.confirmMigraton
                            ? "confirmMigrationBackdrop active"
                            : "confirmMigrationBackdrop"
                    }
                    onClick={this.props.closeConfirmMigration}
                />
            </div>
        );
    }
}
