import React from "react";

export default class SettingsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.settingsActive && this.props.sendOverflowActive === false ? "settings-wrap active" : "settings-wrap"}>
                {
                    this.props.settingsActive && this.props.sendOverflowActive === false
                    ?
                        <div className="container form-wrap settingsModal">
                            <div className="head">
                                <img src="images/mixer.png" alt="Transfer Icon"/>
                                <h3>
                                    User<br />
                                    Settings
                                </h3>
                                <span className="close" onClick={this.props.closeSettingsModal}>X</span>
                            </div>

                            <form onSubmit={this.props.changePassword} onChange={this.props.closeSettingsInfoPopup}>
                                <div className="form-group">
                                    <label htmlFor="old_pass">Old Password:</label>
                                    <input type="password" className={this.props.wrongOldPassword ? 'form-control shake password-input' : 'form-control password-input'} id="old_pass" name="old_pass" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new_pass">New Password:</label>
                                    <input type="password" className={this.props.wrongNewPassword ? 'form-control shake password-input' : 'form-control password-input'} id="new_pass" name="new_pass" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="repeat_pass">Repeat Password:</label>
                                    <input type="password" className={this.props.wrongRepeatPassword ? 'form-control shake password-input' : 'form-control password-input'} id="repeat_pass" name="repeat_pass" />
                                </div>
                                <div className="col-xs-12 submit-wrap">
                                    <div className="row">
                                        <button className="reset-btn button-shine" type="reset" onClick={this.props.resetSettingsForm}>Reset</button>
                                        <button className="submit-btn button-shine-green" type="submit">Submit</button>
                                    </div>
                                    <div className="info-wrap">
                                        <div className={this.props.infoPopup
                                            ? 'info-text active'
                                            : 'info-text'}>
                                            <p>{this.props.infoText}</p>
                                            <span className="close" onClick={this.props.closeSettingsInfoPopup}>X</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <button className="keys-btn button-shine" onClick={this.props.openExportEncryptedWallet}>Export Encrypted Wallet <span className="blue-text">(.dat)</span></button>
                            <button className="keys-btn button-shine" onClick={this.props.openExportUnencryptedWalletPopup}>Export Unencrypted Keys</button>
                            <button className="logout-btn button-shine-red" onClick={this.props.logout}>Logout</button>
                        </div>
                    :
                        <div></div>
                }
            </div>
        );
    }
}