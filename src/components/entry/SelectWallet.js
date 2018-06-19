import React from 'react';
import {Link} from 'react-router';
import {
    decryptWalletData,
    DEFAULT_WALLET_PATH,
    downloadWallet,
    loadWalletFromFile,
    flashField,
    walletResetModal,
    walletResetModalStep
} from '../../utils/wallet';

const fs = window.require('fs');
const os = window.require('os');
const fileDownload = require('react-file-download');

export default class SelectWallet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoading: true,
            walletExists: false,
            walletResetModal: false,
            walletResetModal1: false,
            walletResetModalText: '',
            walletResetModal2unencrypted: false,
            walletResetModalDone: false,
            walletResetModalDlUnencrypted: false,
            walletResetModalDlEncrypted: false,
            walletResetWarning1: false,
            walletResetWarning2: false,
            walletResetWarning3: false,
            walletResetWarning4: false,
            walletResetWarning5: false,
            walletResetNoWallet: false,
            wrong_password: false
        };
        this.walletResetStart = this.walletResetStart.bind(this);
        this.walletResetWarning1Proceed = this.walletResetWarning1Proceed.bind(this);
        this.walletResetWarning2Proceed = this.walletResetWarning2Proceed.bind(this);
        this.walletResetWarning3Proceed = this.walletResetWarning3Proceed.bind(this);
        this.walletResetWarning4Proceed = this.walletResetWarning4Proceed.bind(this);
        this.walletResetWarning5Proceed = this.walletResetWarning5Proceed.bind(this);
        this.walletResetStep1Skip = this.walletResetStep1Skip.bind(this);
        this.walletResetStep1Proceed = this.walletResetStep1Proceed.bind(this);
        this.walletResetStep2 = this.walletResetStep2.bind(this);
        this.walletResetDlUnencrypted = this.walletResetDlUnencrypted.bind(this);
        this.walletResetDlEncrypted = this.walletResetDlEncrypted.bind(this);
        this.walletResetNoWallet = this.walletResetNoWallet.bind(this);
        this.walletResetClose = this.walletResetClose.bind(this);
        this.wrongPassword = this.wrongPassword.bind(this);
    }

    componentWillMount() {
        this.tryLoadWalletFromDisk();
    }

    tryLoadWalletFromDisk() {
        const walletPath = DEFAULT_WALLET_PATH;

        loadWalletFromFile(walletPath, (err, encrypted) => {
            if (err) {
                console.error(err);
                alert(err.message);
                return;
            }

            if (!encrypted) {
                this.setState({walletExists: false});
                return;
            }

            localStorage.setItem('encrypted_wallet', encrypted);
            localStorage.setItem('wallet_path', walletPath);
            this.setState({walletExists: true});
        });
    }

    openWalletResetModal(step, message) {
        walletResetModal(this, step, message)
    }

    openWalletResetModalStep(step, closedStep, message) {
        walletResetModalStep(this, step, closedStep, message)
    }

    wrongPassword() {
        flashField(this, 'wrong_password');
    }

    //This happens when you click wallet reset on the main screen
    walletResetStart() {
        this.openWalletResetModal('walletResetModal', 'This feature is only if you want to delete a wallet and start over. This is not for upgrading wallet versions.');
        this.openWalletResetModalStep('walletResetWarning1', '', 'This feature is only if you want to delete a wallet and start over. This is not for upgrading wallet versions.');
    }

    walletResetWarning1Proceed() {
        this.openWalletResetModalStep('walletResetWarning2', 'walletResetWarning1', 'This is not necessary for upgrading wallet versions.');
    }

    walletResetWarning2Proceed() {
        this.openWalletResetModalStep('walletResetWarning3', 'walletResetWarning2', 'PROCEED WITH CAUTION THIS PROCESS WILL DELETE YOUR EXISTING WALLET..');
    }

    walletResetWarning3Proceed() {
        this.openWalletResetModalStep('walletResetWarning4', 'walletResetWarning3', 'This procedure will reset the wallet. It will take you through steps to backup the existing wallet. Then the existing wallet will be deleted to make room for a new one. PROCEED WITH CAUTION!!');
    }

    walletResetWarning4Proceed() {
        this.openWalletResetModalStep('walletResetWarning5', 'walletResetWarning4', 'If you pushed this by mistake hit the white "x" to cancel wallet reset.');
    }

    walletResetWarning5Proceed() {
        this.openWalletResetModalStep('walletResetModal1', 'walletResetWarning5', 'You do not need to do this for upgrading wallet versions. If you have your password and want to backup your keys unencrypted press proceed, otherwise press skip.');
    }

    //This happens when you click skip on the first modal
    walletResetStep1Skip() {
        this.openWalletResetModalStep('walletResetModalDlUnencrypted', 'walletResetModal1', 'During this stage you will be able to backup your encrypted wallet file. You may need it in the future and that is why this step exists.');
    }

    //This happens when you click proceed on the first modal
    walletResetStep1Proceed() {
        this.setState({
            walletResetModal1: false,
        })
        this.openWalletResetModalStep('walletResetModal2unencrypted', 'walletResetModalDlUnencrypted', '');
    }

    walletResetNoWallet() {
        this.openWalletResetModal('walletResetModal', '');
        this.openWalletResetModal('walletResetNoWallet', 'There in no wallet.');
    }

    //This happens when you click proceed under the password entry for the unencrypted wallet
    walletResetDlUnencrypted(e) {
        e.preventDefault();

        localStorage.setItem('password', e.target.password.value);

        let wallet;
        try {
            wallet = decryptWalletData();
        }
        catch (err) {
            console.error(err);
            this.wrongPassword();
            return;
        }

        let niceKeys = '';
        const keys = wallet['keys'];
        keys.map((key) => {
            niceKeys += "private key: " + key.private_key + '\n';
            niceKeys += "public key: " + key.public_key + '\n';
            niceKeys += '\n';
        });
        const date = Date.now();
        fileDownload(niceKeys, date + '_unsafex.txt');

        this.setState({
            walletResetModal1: false,
            walletResetModal2unencrypted: false
        });
        this.openWalletResetModal('walletResetModalDlUnencrypted', 'During this stage you will be able to backup your encrypted wallet file. You may need it in the future and that is why this step exists.');
    }

    //This is the step2 of the encrypted and step3 of the unencrypted route
    walletResetDlEncrypted(e) {
        e.preventDefault();
        if (e.target.checkbox.checked) {
            this.setState({
                walletResetModal1: false,
                walletResetModalDlUnencrypted: false,
                walletResetModal2unencrypted: false
            })
            this.openWalletResetModal('walletResetModalDlEncrypted', "This is second confirmation. When you check the box and proceed you will be able to backup your encrypted wallet. After this there is no turning back your wallet will be deleted so that you can make a new one. In this step you\'ll backup your encrypted wallet that was already in the wallet. During this stage you will be able to backup your encrypted wallet file. You may need it in the future that is why this step exists. AFTER THIS THERE IS NO TURNING BACK, YOUR WALLET WILL BE DELETED HIT THE 'X' TO GET OUT OF THIS");
        }
    }

    //This leads to Done page in both routes
    walletResetStep2(e) {
        e.preventDefault();

        if (e.target.checkbox.checked) {
            const walletPath = DEFAULT_WALLET_PATH;
            downloadWallet(walletPath, (err) => {
                if (err) {
                    alert(err.message);
                } else {
                    fs.unlink(DEFAULT_WALLET_PATH, (err) => {
                        if (err) {
                            alert('There was an issue resetting the wallet');
                            console.error(err);
                        } else {
                            this.setState({
                                walletResetModal1: false,
                                walletResetModalDlUnencrypted: false,
                                walletResetModal2unencrypted: false,
                                walletResetModalDlEncrypted: false,
                                walletExists: false
                            });
                            this.openWalletResetModal('walletResetModalDone', 'Your wallet reset is done. Now you can make a new wallet.');
                        }
                    });
                }
            });
        }
    }

    //This closes every modal
    walletResetClose() {
        this.setState({
            walletResetModal: false,
            walletResetWarning1: false,
            walletResetWarning2: false,
            walletResetWarning3: false,
            walletResetWarning4: false,
            walletResetWarning5: false,
            walletResetModal1: false,
            walletResetModal2: false,
            walletResetModal2unencrypted: false,
            walletResetModalDone: false,
            walletResetModalDlEncrypted: false,
            walletResetModalDlUnencrypted: false,
            walletResetNoWallet: false,
        })
    }

    render() {
        const wallet_exists = this.state.walletExists;
        let show_options;

        if (wallet_exists) {
            show_options = (
                <div className="container">
                    <div className="col-xs-12 Login-logo">
                        <h2>Safex</h2>
                        <h3>Wallet</h3>
                        <p>v0.0.7</p>
                        <button className="back-button wallet-reset-button" onClick={this.state.walletResetModal ? this.walletResetClose : this.walletResetStart}>Wallet Reset</button>
                    </div>
                    <div className="col-xs-8 col-xs-offset-2 App-intro">
                        <div className="row text-center">
                            <div className="col-xs-6 login-wrap fadeInDown">
                                <Link to="/login">
                                    <div className="col-xs-12">
                                        <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-blue">Login</button>
                                        <p>Enter your password</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-xs-6 importwallet-wrap fadeInDown">
                                <Link to="/importwallet">
                                    <div className="col-xs-12">
                                        <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-green">Import</button>
                                        <p>Import your wallet or recover from backup file</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 text-center Intro-footer">
                        <img src="images/footer-logo.png" alt="Safex Icon Footer"/>
                        <p className="text-center">2014-2018 All Rights Reserved Safe Exchange Developers &copy;</p>
                    </div>
                </div>
            );
        } else {
            show_options = (
                <div className="container">
                    <div className="col-xs-12 Login-logo">
                        <h2>Safex</h2>
                        <h3>Wallet</h3>
                        <p>v0.0.7</p>
                        <button className="back-button wallet-reset-button" onClick={this.state.walletResetModal ? this.walletResetClose : this.walletResetNoWallet}>Wallet
                            Reset
                        </button>
                    </div>
                    <div className="col-xs-8 col-xs-offset-2 App-intro">
                        <div className="row text-center">
                            <div className="col-xs-6 login-wrap fadeInDown">
                                <Link to="/createwallet">
                                    <div className="col-xs-12">
                                        <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-blue">New Wallet</button>
                                        <p>Create a new Wallet</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-xs-6 importwallet-wrap fadeInDown">
                                <Link to="/importwallet">
                                    <div className="col-xs-12">
                                        <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-green">Import</button>
                                        <p>Import a safexwallet .dat file</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 text-center Intro-footer">
                        <img src="images/footer-logo.png" alt="Safex Icon Footer"/>
                        <p className="text-center">2014-2018 All Rights Reserved Safe Exchange Developers &copy;</p>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {show_options}
                <div className={this.state.walletResetModal
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        {
                            this.state.walletResetWarning1
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetWarning1Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetWarning2
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetWarning2Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetWarning3
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetWarning3Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetWarning4
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetWarning4Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetWarning5
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetWarning5Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetModal1
                            ?
                                <div>
                                    <h3>Back Up Unencrypted Keys
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetStep1Skip}>Skip</button>
                                    <button className="keys-btn button-shine" onClick={this.walletResetStep1Proceed}>Proceed
                                    </button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetModal2unencrypted
                            ?
                                <div>
                                    <h3>Wallet Reset Step 2
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <form className="form-group text-center" onSubmit={this.walletResetDlUnencrypted}>
                                        <input className={this.state.wrong_password ? 'form-control password-btn shake' : 'form-control password-btn'} type="password" name="password" placeholder="Enter Password"/>
                                        <button className="keys-btn button-shine" type="submit">Proceed</button>
                                    </form>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetModalDlUnencrypted
                            ?
                                <div>
                                    <h3>Download Encrypted Wallet
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <form onSubmit={this.walletResetDlEncrypted}>
                                        <label>
                                            <input name="checkbox" type="checkbox"/>I understand that this is my last chance to
                                            backup my wallet file after this it will be deleted
                                        </label>
                                        <button type="submit" className="submit-btn button-shine">Proceed</button>
                                    </form>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetModalDlEncrypted
                            ?
                                <div>
                                    <h3>Downloading Encrypted Wallet
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <form onSubmit={this.walletResetStep2}>
                                        <label><input name="checkbox" type="checkbox"/> I understand that this is my last chance to
                                            backup my wallet file after this it will be deleted</label>
                                        <button type="submit" className="submit-btn button-shine">Proceed</button>
                                    </form>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetModalDone
                            ?
                                <div>
                                    <h3>Wallet Reset Done
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                    <button className="keys-btn button-shine" onClick={this.walletResetClose}>Done</button>
                                </div>
                            :
                                <div></div>
                        }
                        {
                            this.state.walletResetNoWallet
                            ?
                                <div>
                                    <h3>Wallet Reset
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>{this.state.walletResetModalText}</p>
                                </div>
                            :
                                <div></div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

SelectWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
};

//if wallet is found main image is new wallet found
