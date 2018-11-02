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
