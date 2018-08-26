import React from "react";

export default class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="key-buttons status fadeInUp">
                <div className="container">
                    <div className="status-left-wrap">
                        <span>Status:</span>
                        <span className={this.props.safexSync
                            ? 'status-green'
                            : 'status-red'}>SAFEX</span>
                        <span className={this.props.btcSync
                            ? 'status-green'
                            : 'status-red'}>BTC</span><br />
                        <img src="images/transfer.png" alt="Transfer Icon"/>
                        <span className="sync-span">{this.props.statusText}</span>
                    </div>
                    <div className={this.props.importWrapGlow ? 'import-form-wrap active' :'import-form-wrap'}>
                        <form onChange={this.props.importKeyChange} onSubmit={this.props.openImportModal}>
                            <input name="key" value={this.props.importKey} onFocus={this.props.importGlow} onBlur={this.props.importGlowDeactivate} placeholder="Paste your private key"/>
                            <button type="submit" className="button-shine" title="Import Key">Import</button>
                        </form>
                        <button onClick={this.props.openCreateKey} className="create-btn button-shine" title="Create New Key">
                            <img src="images/plus.png" alt="Plus Logo"/>
                        </button>
                    </div>
                    <div className="right-options">
                        {
                            this.props.affiliateActive
                            ?
                                <button className="aff-btn aff-btn-active button-shine" title="Affiliate System (Under development)" onClick={this.props.closeAffiliateModal}>
                                    <img src="images/world-blue.png" alt="World Logo"/>
                                </button>
                            :
                                <button className="aff-btn button-shine" title="Affiliate System (Under development)" onClick={this.props.openAffiliateModal}>
                                    <img src="images/world.png" alt="World Logo"/>
                                </button>
                        }

                        {
                            this.props.dividendActive
                            ?
                                <button className="dividend-btn dividend-btn-active button-shine" title="Dividend Calculator (Under development)" onClick={this.props.closeDividendModal}>
                                    <img src="images/calculator-blue.png" alt="Calculator Logo"/>
                                </button>
                            :
                                <button className="dividend-btn button-shine" title="Dividend Calculator (Under development)" onClick={this.props.openDividendModal}>
                                    <img src="images/calculator.png" alt="Calculator Logo"/>
                                </button>
                        }

                        {
                            this.props.settingsActive
                            ?
                                <button className="settings button-shine settings-btn-active" onClick={this.props.closeSettingsModal} title="Settings">
                                    <img src="images/settings-blue.png" alt="Mixer Logo"/>
                                </button>
                            :
                                <button className="settings button-shine" onClick={this.props.openSettingsModal} title="Settings">
                                    <img src="images/settings.png" alt="Mixer Logo"/>
                                </button>
                        }

                        {
                            this.props.refreshTimer === 0
                            ?
                                <button className="refresh-btn button-shine"  onClick={this.props.refreshWallet} title="Refresh">
                                    <img src="images/refresh.png" alt="Refresh Logo"/>
                                </button>
                            :
                                <button className="refresh-btn button-shine disabled" title="Refresh">
                                    <img src="images/refresh-blue.png" alt="Refresh Logo"/>
                                    <span><p>{this.props.refreshTimer + 's'}</p></span>
                                </button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}