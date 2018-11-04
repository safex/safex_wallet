import React from "react";

export default class ConfirmMigration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        console.log(this.props.data)
        return (
            <div>
                <div
                    className={
                        this.props.confirmMigraton
                            ? "resetMigration active"
                            : "resetMigration"
                    }
                >
                    <div className="resetMigrationInner">
            <span className="close" onClick={this.props.closeConfirmMigration}>
              X
            </span>
                        You are burning {this.props.data.amount} Safe Exchange Coins in the migration process.
                        <br/>

                        You will receive {this.props.data.amount} Safex Tokens (SFT)<br/>
                        and in addition {this.props.data.amount * 0.00232830643} Safex Cash (SFX)<br/>


                        <br/>
                        Your SFT and SFX will appear on the Safex Blockchain
                        <br/>
                        They are being sent to:
                        <p>{this.props.data.address}
                        </p>
                        <br/>
                        Are you sure you want to proceed with your transaction?
                        <br/>
                        <br/>
                        <p>
                        This is an irreversible transaction. From here there is no chance of customer support for take backs.
                        The transaction gets written into the bitcoin blockchain and will be processed by the safex migration system.
                        Proceed only if you Understand what are the effects of sending this transaction by clicking OK.
                        </p>
                            <br/>
                        Otherwise click cancel.
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
