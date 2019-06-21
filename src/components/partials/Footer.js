import React from "react";
import ReactTooltip from "react-tooltip";

export default class Footer extends React.Component {
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
                            <input name="key" value={this.props.importKey} onFocus={this.props.importGlow} onBlur={this.props.importGlowDeactivate} placeholder="Enter your private key"/>
                            <button type="submit" className="button-shine" title="Import Key">Import</button>
                        </form>
                        <button 
                            onClick={this.props.openCreateKey} 
                            className="create-btn button-shine" 
                            title=""
                            data-tip 
                            data-for="new-key-tooltip"
                        >
                            <img src="images/plus.png" alt="Plus Logo"/>
                        </button>
                        <ReactTooltip id="new-key-tooltip">
                            <p>Create New Key</p>
                        </ReactTooltip>
                    </div>
                    <div className="right-options">
                        <button
                            className={this.props.affiliateActive ? "aff-btn aff-btn-active button-shine" : "aff-btn button-shine"}
                            onClick={this.props.affiliateActive ? this.props.closeAffiliateModal : this.props.openAffiliateModal}
                            disabled
                        >
                            <img src={this.props.affiliateActive ? "images/world-blue.png" : "images/world.png"} alt="World Logo" />
                            <span data-tip data-for="affiliate-tooltip"></span>
                        </button>
                        <ReactTooltip id="affiliate-tooltip">
                            <p className="text-center">Affiliate System</p>
                            <p>(Under development)</p>
                        </ReactTooltip>
                        
                        <button 
                            className={this.props.dividendActive ? "dividend-btn dividend-btn-active button-shine" : "dividend-btn button-shine"}
                            onClick={this.props.dividendActive ? this.props.closeDividendModal : this.props.openDividendModal}
                            // disabled
                        >
                            <img src={this.props.dividendActive ? "images/calculator-blue.png" : "images/calculator.png"} alt="Calculator Logo" />
                            <span data-tip data-for="dividend-tooltip"></span>
                        </button>
                        <ReactTooltip id="dividend-tooltip">
                            <p className="text-center">Dividend Calculator</p>
                            {/* <p>(Under development)</p> */}
                        </ReactTooltip>

                        <button 
                            className={this.props.settingsActive ? "settings button-shine settings-btn-active" : "settings button-shine"} 
                            onClick={this.props.settingsActive ? this.props.closeSettingsModal : this.props.openSettingsModal}
                        >
                            <img src={this.props.settingsActive ? "images/settings-blue.png" : "images/settings.png"} alt="Mixer Logo" />
                            <span data-tip data-for="setting-tooltip"></span>
                        </button>
                        <ReactTooltip id="setting-tooltip">
                            <p>Settings</p>
                        </ReactTooltip>

                        <button
                            onClick={this.props.refreshTimer === 0 ? this.props.refreshWallet : ""}
                            className={this.props.refreshTimer === 0 ? "refresh-btn button-shine" : "refresh-btn button-shine disabled"}
                        >
                            <img src={this.props.refreshTimer === 0 ? "images/refresh.png" : "images/refresh-blue.png"} alt="Refresh Logo" />
                            <span data-tip data-for="refresh-tooltip"></span>
                            <span data-tip data-for="refresh-tooltip" id="timer"><p>{this.props.refreshTimer + 's'}</p></span>
                        </button>
                        <ReactTooltip id="refresh-tooltip">
                            <p>Refresh</p>
                        </ReactTooltip>
                    </div>
                </div>
            </div>
        );
    }
}