import React from 'react';
import {Link} from 'react-router';

var fs = window.require('fs');
var os = window.require('os');
var fileDownload = require('react-file-download');
import { decrypt } from '../../utils/utils';

export default class SelectWallet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoading: true,
            walletExists: false,
            walletResetModal1: false,
            walletResetModal2unencrypted: false,
            walletResetModalDone: false,
            walletResetModalDlUnencrypted: false,
            walletResetModalDlEncrypted: false,
            walletResetWarning1: false,
            walletResetWarning2: false,
            walletResetWarning3: false,
            walletResetWarning4: false,
            walletResetWarning5: false,
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
        this.walletResetClose = this.walletResetClose.bind(this);
        this.wrongPassword = this.wrongPassword.bind(this);
    }

    //check the filesystem for default location of the safexwallet.dat file
    //if not make it
    componentDidMount() {

    }

    componentWillMount() {
        var home_dir = os.homedir();
        fs.readFile(home_dir + '/safexwallet.dat', (err, fd) => {
            if (err) {
                //if the error is that No File exists, let's step through and make the file
                if (err.code === 'ENOENT') {
                    console.log('error');
                    this.setState({walletExists: false});

                }
            } else {
                localStorage.setItem('encrypted_wallet', fd);
                localStorage.setItem('wallet_path', home_dir + '/safexwallet.dat');
                this.setState({walletExists: true});
            }

        });
    }

    wrongPassword() {
        this.setState({
            wrong_password: true
        });
        setTimeout(() => {
            this.setState({
                wrong_password: false
            });
        }, 1000)
    }

    //This happens when you click wallet reset on the main screen
    walletResetStart() {
        this.setState({
            walletResetWarning1: true
        })
    }

    walletResetWarning1Proceed() {
        this.setState({
            walletResetWarning1: false,
            walletResetWarning2: true
        })
    }

    walletResetWarning2Proceed() {
        this.setState({
            walletResetWarning2: false,
            walletResetWarning3: true
        })
    }

    walletResetWarning3Proceed() {
        this.setState({
            walletResetWarning3: false,
            walletResetWarning4: true
        })
    }

    walletResetWarning4Proceed() {
        this.setState({
            walletResetWarning4: false,
            walletResetWarning5: true
        })
    }

    walletResetWarning5Proceed() {
        this.setState({
            walletResetWarning5: false,
            walletResetModal1: true
        })
    }

    //This happens when you click skip on the first modal
    walletResetStep1Skip() {
        this.setState({
            walletResetModal1: false,
            walletResetModalDlUnencrypted: true
        })
    }

    //This happens when you click proceed on the first modal
    walletResetStep1Proceed() {
        this.setState({
            walletResetModal1: false,
            walletResetModalDlUnencrypted: false,
            walletResetModal2unencrypted: true
        })
    }

    //This happens when you click proceed under the password entry for the unencrypted wallet
    walletResetDlUnencrypted(e) {
        e.preventDefault();

        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = e.target.password.value;

        localStorage.setItem('password', e.target.password.value);

        var cipher_text = localStorage.getItem('encrypted_wallet');


        var decrypted_wallet = decrypt(cipher_text, algorithm, password);

        try {
            var parse_wallet = JSON.parse(decrypted_wallet);

            if (parse_wallet['version'] === '1') {
                localStorage.setItem('wallet', decrypted_wallet);

                var wallet_data = JSON.parse(localStorage.getItem('wallet'));
                var nice_keys = "";
                var keys = wallet_data['keys'];
                keys.map((key) => {
                    nice_keys += "private key: " + key.private_key + '\n';
                    nice_keys += "public key: " + key.public_key + '\n';
                    nice_keys += '\n';
                });
                var date = Date.now();
                fileDownload(nice_keys, date + 'unsafex.txt');

                this.setState({
                    walletResetModal1: false,
                    walletResetModal2unencrypted: false,
                    walletResetModalDlUnencrypted: true
                })
            } else {
                this.wrongPassword();
                console.log('wrong password');
            }

        } catch (e) {
            this.wrongPassword();
            console.log('error parsing wallet');
        }
    }

    //This is the step2 of the encrypted and step3 of the unencrypted route
    walletResetDlEncrypted(e) {
        e.preventDefault();
        if (e.target.checkbox.checked) {
            this.setState({
                walletResetModal1: false,
                walletResetModalDlUnencrypted: false,
                walletResetModal2unencrypted: false,
                walletResetModalDlEncrypted: true
            })
        }
    }

    //This leads to Done page in both routes
    walletResetStep2(e) {
        e.preventDefault();
        if (e.target.checkbox.checked) {
            var home_dir = os.homedir();
            fs.readFile(home_dir + '/safexwallet.dat', (err, fd) => {
                if (err) {
                    //if the error is that No File exists, let's step through and make the file
                    if (err.code === 'ENOENT') {
                        console.log('error');
                    }
                } else {
                    var date = Date.now();
                    fileDownload(fd, date + 'safexwallet.dat');
                    fs.unlink(home_dir + '/safexwallet.dat', (err) => {
                        if (err) {
                            alert('there was an issue resetting the wallet')
                        } else {
                            this.setState({
                                walletResetModal1: false,
                                walletResetModalDlUnencrypted: false,
                                walletResetModal2unencrypted: false,
                                walletResetModalDlEncrypted: false,
                                walletResetModalDone: true,
                                walletExists: false
                            })
                        }
                    })
                }

            });
        }
    }

    //This closes every modal
    walletResetClose() {
        this.setState({
            walletResetModal1: false,
            walletResetModal2: false,
            walletResetModal2unencrypted: false,
            walletResetModalDone: false,
            walletResetModalDlEncrypted: false,
            walletResetModalDlUnencrypted: false,
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
                        {
                            this.state.walletResetModal1 ||
                            this.state.walletResetModal2 ||
                            this.state.walletResetModal2unencrypted ||
                            this.state.walletResetModalDone ||
                            this.state.walletResetModalDlEncrypted ||
                            this.state.walletResetModalDlUnencrypted
                            ?
                                <button className="back-button wallet-reset-button" onClick={this.walletResetClose}>Wallet Reset</button>
                            :
                                <button className="back-button wallet-reset-button" onClick={this.walletResetStart}>Wallet Reset</button>
                        }
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
                        <button className="back-button wallet-reset-button" onClick={this.walletResetStart}>Wallet Reset</button>
                    </div>
                    <div className="col-xs-8 col-xs-offset-2 App-intro">
                        <div className="row text-center">
                            <div className="col-xs-6 login-wrap fadeInDown">
                                <Link to="/createwallet">
                                    <div className="col-xs-12">
                                        <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-blue">New Wallet </button>
                                        <p>Create a new Wallet</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-xs-6 importwallet-wrap fadeInDown">
                                <Link to="/importwallet">
                                    <div className="col-xs-12">
                                        <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-neon-green">Import </button>
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
                <div className={this.state.walletResetWarning1
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            This feature is only if you want to delete a wallet and start over. This is not for upgrading wallet versions.
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetWarning1Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetWarning2
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            This is not necessary for upgrading wallet versions
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetWarning2Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetWarning3
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            PROCEED WITH CAUTION THIS PROCESS WILL DELETE YOUR EXISTING WALLET.
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetWarning3Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetWarning4
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            This procedure will reset the wallet. It will take you through steps to backup the existing wallet.
                            Then the existing wallet will be deleted to make room for a new one. PROCEED WITH CAUTION!!
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetWarning4Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetWarning5
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            If you pushed this by mistake hit the white "x" to cancel wallet reset.
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetWarning5Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetModal1
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Back Up Unencrypted Keys
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>
                            You do not need to do this for upgrading wallet versions.
                            If you have your password and want to backup your keys unencrypted press proceed, otherwise press skip.
                        </p>
                        <button className="keys-btn button-shine" onClick={this.walletResetStep1Skip}>Skip</button>
                        <button className="keys-btn button-shine" onClick={this.walletResetStep1Proceed}>Proceed</button>
                    </div>
                </div>
                <div className={this.state.walletResetModal2unencrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset Step 2
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <form className="form-group text-center" onSubmit={this.walletResetDlUnencrypted}>
                            {
                                this.state.wrong_password
                                ?
                                    <input className="form-control password-btn shake" type="password" name="password" placeholder="Enter Password" />
                                :
                                    <input className="form-control password-btn text-center" type="password" name="password" placeholder="Enter Password" />
                            }
                            <button className="keys-btn button-shine" type="submit">Proceed</button>
                        </form>
                    </div>
                </div>
                <div className={this.state.walletResetModalDlUnencrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Download Encrypted Wallet
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>During this stage you will be able to backup your encrypted wallet file. You may need it in the future and that is why this step exists.</p>
                        <form onSubmit={this.walletResetDlEncrypted}>
                            <label><input name="checkbox" type="checkbox" /> I understand that this is my last chance to backup my wallet file after this it will be deleted</label>
                            <button type="submit" className="submit-btn button-shine">Proceed</button>
                        </form>
                    </div>
                </div>
                <div className={this.state.walletResetModalDlEncrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Downloading Encrypted Wallet
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>This is second confirmation. When you check the box and proceed you will be able to backup your encrypted wallet. After this there is no turning back
                            your wallet will be deleted so that you can make a new one. In this step you'll backup your encrypted wallet that was already in the wallet.
                            During this stage you will be able to backup your encrypted wallet file. You may need it in the future that is why this step exists.
                            AFTER THIS THERE IS NO TURNING BACK, YOUR WALLET WILL BE DELETED HIT THE "X" TO GET OUT OF THIS</p>
                        <form onSubmit={this.walletResetStep2}>
                            <label><input name="checkbox" type="checkbox" /> I understand that this is my last chance to backup my wallet file after this it will be deleted</label>
                            <button type="submit" className="submit-btn button-shine">Proceed</button>
                        </form>
                    </div>
                </div>
                <div className={this.state.walletResetModalDone
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Reset Done
                            <span onClick={this.walletResetClose} className="close">X</span>
                        </h3>
                        <p>Your wallet reset is done. Now you can make a new wallet.</p>
                        <button className="keys-btn button-shine" onClick={this.walletResetClose}>Done</button>
                    </div>
                </div>
            </div>
        );
    }
}


SelectWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}


//if wallet is found main image is new wallet found
