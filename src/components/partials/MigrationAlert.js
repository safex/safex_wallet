import React from "react";

export default class MigrationAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <div className={this.props.migrationAlert
                    ? 'migrationAlert active'
                    : 'migrationAlert'}>
                    <div className="mainAlertPopupInner">
                        <p>{this.props.migrationAlertText}</p>
                        <span className="close" onClick={this.props.closeMigrationAlert}>X</span>
                    </div>
                </div>

                <div className={this.props.migrationAlert
                    ? 'migrationAlertBackdrop active'
                    : 'migrationAlertBackdrop'} onClick={this.props.closeMigrationAlert}>
                </div>
            </div>
        );
    }
}

