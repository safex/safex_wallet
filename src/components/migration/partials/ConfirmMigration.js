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
                            ? "resetMigration active"
                            : "resetMigration"
                    }
                >
                    <div className="resetMigrationInner">
            <span className="close" onClick={this.props.closeConfirmMigration}>
              X
            </span>
                        Are you sure you want to proceed with your transaction?

                        You will receive {this.props.data.amount} Safex Tokens (SFT)
                        and in addition {this.props.data.amount * 0.00232830643} Safex Cash (SFX)
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
