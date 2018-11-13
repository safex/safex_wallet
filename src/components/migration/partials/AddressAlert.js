import React from "react";

export default class AddressAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <div className={this.props.addressAlert
                    ? 'migrationAlert addressAlert active'
                    : 'migrationAlert addressAlert'}>
                    <div className="mainAlertPopupInner">
                        <p>{this.props.addressAlertText}</p>
                        <span className="close" onClick={this.props.closeAddressAlert}>X</span>
                    </div>
                </div>

                <div className={this.props.addressAlert
                    ? 'migrationAlertBackdrop active'
                    : 'migrationAlertBackdrop'} onClick={this.props.closeAddressAlert}>
                </div>
            </div>
        );
    }
}

