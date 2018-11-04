import React from "react";

export default class ResetMigration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div
          className={
            this.props.resetMigration
              ? "resetMigration active"
              : "resetMigration"
          }
        >
          <div className="resetMigrationInner">
            <span className="close" onClick={this.props.closeResetMigration}>
              X
            </span>
            Are you sure you want to reset your migration?
            <div className="btns-wrap">
              <button
                className="button-shine red-btn"
                onClick={this.props.closeResetMigration}
              >
                Cancel
              </button>
              <button
                className="button-shine green-btn"
                onClick={this.props.confirmReset}
              >
                Ok
              </button>
            </div>
          </div>
        </div>

        <div
          className={
            this.props.resetMigration
              ? "resetMigrationBackdrop active"
              : "resetMigrationBackdrop"
          }
          onClick={this.props.closeResetMigration}
        />
      </div>
    );
  }
}
