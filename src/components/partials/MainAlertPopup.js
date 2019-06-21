import React from "react";

export default class MainAlertPopup extends React.Component {
    render() {
        return (
            <div>
                <div className={this.props.mainAlertPopup
                    ? 'mainAlertPopup active'
                    : 'mainAlertPopup'}>
                    <div className="mainAlertPopupInner">
                        <p>{this.props.mainAlertPopupText}</p>
                        {
                            this.props.exportUnencryptedWalletState === false && this.props.exportEncryptedWalletState
                            ?
                                <div className="mainAlertProceedWrap">
                                    <button className="button-shine mainAlertProceed active" onClick={this.props.exportEncryptedWallet}>
                                        Ok
                                    </button>
                                </div>
                            :
                                <div className="mainAlertProceedWrap">
                                    {
                                        this.props.exportUnencryptedWalletState && this.props.exportEncryptedWalletState === false
                                        ?
                                            <button className="button-shine mainAlertProceed active" onClick={this.props.exportUnencryptedWallet}>
                                                Ok
                                            </button>
                                        :
                                            <button className="button-shine mainAlertProceed">
                                                Ok
                                            </button>
                                    }
                                    <button className="button-shine mainAlertProceed">
                                        Ok
                                    </button>
                                </div>
                        }
                        {
                            this.props.transactionBeingSent
                            ?
                                <span className="close disabled" onClick={this.props.closeMainAlertPopup}>X</span>
                            :
                                <span className="close" onClick={this.props.closeMainAlertPopup}>X</span>
                        }
                    </div>
                </div>

                {
                    this.props.transactionBeingSent
                    ?
                        <div className={this.props.mainAlertPopup || this.props.importModalActive || this.props.createKeyActive
                            ? 'mainAlertBackdrop active disabled'
                            : 'mainAlertBackdrop'} onClick={this.props.mainAlertPopup ? this.props.closeMainAlertPopup : this.props.closeImportModal}>
                        </div>
                    :
                        <div className={this.props.mainAlertPopup || this.props.importModalActive || this.props.createKeyActive
                            ? 'mainAlertBackdrop active'
                            : 'mainAlertBackdrop'} onClick={this.props.mainAlertPopup ? this.props.closeMainAlertPopup : this.props.closeImportModal}>
                        </div>
                }
            </div>
        );
    }
}

