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
            walletResetModalDlEncrypted: false
        };
        this.walletResetStart = this.walletResetStart.bind(this);
        this.walletResetStep1Skip = this.walletResetStep1Skip.bind(this);
        this.walletResetStep1Proceed = this.walletResetStep1Proceed.bind(this);
        this.walletResetStep2 = this.walletResetStep2.bind(this);
        this.walletResetDlUnencrypted = this.walletResetDlUnencrypted.bind(this);
        this.walletResetDlEncrypted = this.walletResetDlEncrypted.bind(this);
        this.walletResetClose = this.walletResetClose.bind(this);
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

    //This happens when you click wallet reset on the main screen
    walletResetStart() {
        alert('This feature is only if you want to delete a wallet and start over. This is not for upgrading ' +
            'wallet versions.');
        alert('This is not necessary for upgrading wallet versions.');
        alert('PROCEED WITH CAUTION THIS PROCESS WILL DELETE YOUR EXISTING WALLET');
        alert('This procedure will reset the wallet. It will take you through steps to backup the existing wallet.' +
            'Then the existing wallet will be deleted to make room for a new one. PROCEED WITH CAUTION!!');
        alert('If you pushed this by mistake you will see a white "x" in the top right in a following screen.');
        this.setState({
            walletResetModal1: true
        })
    }

    //This happens when you click skip on the first modal
    walletResetStep1Skip() {
        this.setState({
            walletResetModalDlUnencrypted: true
        })
    }

    //This happens when you click proceed on the first modal
    walletResetStep1Proceed() {
        this.setState({
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
                    walletResetModalDlUnencrypted: true
                })
            } else {

                console.log('wrong password');
            }

        } catch (e) {
            alert('wrong password');
            console.log('error parsing wallet');
        }
    }

    //This is the step2 of the encrypted and step3 of the unencrypted route
    walletResetDlEncrypted(e) {
        e.preventDefault();
        if (e.target.checkbox.checked) {
            this.setState({
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
                        <button className="back-button wallet-reset-button" onClick={this.walletResetStart}>Wallet Reset</button>
                    </div>
                    <div className="col-xs-8 col-xs-offset-2 App-intro">
                        <div className="row text-center">
                            <div className="col-xs-6 login-wrap">
                                <Link to="/login">
                                    <div className="col-xs-12">
                                        <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-shine">Login</button>
                                        <p>Enter your password</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-xs-6 importwallet-wrap">
                                <Link to="/importwallet">
                                    <div className="col-xs-12">
                                        <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-shine">Import</button>
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
                            <div className="col-xs-6 login-wrap">
                                <Link to="/createwallet">
                                    <div className="col-xs-12">
                                        <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-shine">New Wallet </button>
                                        <p>Create a new Wallet</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-xs-6 importwallet-wrap">
                                <Link to="/importwallet">
                                    <div className="col-xs-12">
                                        <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                        <button className="btn btn-default button-shine">Import </button>
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
                <div className={this.state.walletResetModal1
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <div className="col-xs-12">
                            <h3>Wallet Reset Back Up Unencrypted Keys
                                <span onClick={this.walletResetClose} className="close">X</span>
                            </h3>
                            <p>You do not need to do this for upgrading wallet versions.
                                If you have your password and want to backup your keys unencrypted press proceed, otherwise press skip</p>
                            <div className="col-xs-12 text-center">
                                <button onClick={this.walletResetStep1Skip}>Skip</button>
                                <button onClick={this.walletResetStep1Proceed}>Proceed</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={this.state.walletResetModal2unencrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <div className="col-xs-12">
                            <h3>Wallet Reset Step 2
                                <span onClick={this.walletResetClose} className="close">X</span>
                            </h3>
                            <div className="col-xs-4 col-xs-offset-4 text-center">
                                <form className="form-group" onSubmit={this.walletResetDlUnencrypted}>
                                   <input className="form-control text-center" type="password" name="password" placeholder="Enter Password" />
                                   <button className="btn btn-default" type="submit">Proceed</button>
                               </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={this.state.walletResetModalDlUnencrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <div className="col-xs-12">
                            <h3>Download Encrypted Wallet
                                <span onClick={this.walletResetClose} className="close">X</span>
                            </h3>
                            <p>During this stage you will be able to backup your encrypted wallet file. You may need it in the future that is why this step exists.</p>
                            <form className="row" onSubmit={this.walletResetDlEncrypted}>
                                <div className="col-xs-12 text-center">
                                    <label><input name="checkbox" type="checkbox" /> I understand that this is my last chance to backup my wallet file after this it will be deleted</label>
                                </div>
                                <div className="col-xs-12 text-center">
                                    <button type="submit">Proceed</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className={this.state.walletResetModalDlEncrypted
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <div className="col-xs-12">
                            <h3>Downloading Encrypted Wallet
                                <span onClick={this.walletResetClose} className="close">X</span>
                            </h3>
                            <p>This is second confirmation. When you check the box and proceed you will be able to backup your encrypted wallet. After this there is no turning back
                                your wallet will be deleted so that you can make a new one. In this step you'll backup your encrypted wallet that was already in the wallet.
                                During this stage you will be able to backup your encrypted wallet file. You may need it in the future that is why this step exists.
                            AFTER THIS THERE IS NO TURNING BACK, YOUR WALLET WILL BE DELETED HIT THE "X" TO GET OUT OF THIS</p>
                            <form className="row" onSubmit={this.walletResetStep2}>
                                <div className="col-xs-12 text-center">
                                    <label><input name="checkbox" type="checkbox" /> I understand that this is my last chance to backup my wallet file after this it will be deleted</label>
                                </div>
                                <div className="col-xs-12 text-center">
                                    <button type="submit">Proceed</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className={this.state.walletResetModalDone
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <div className="col-xs-12">
                            <h3>Wallet Reset Done
                                <span onClick={this.walletResetClose} className="close">X</span>
                            </h3>
                            <p>Your wallet reset is done. Now you can make a new wallet.</p>
                            <div className="col-xs-12 text-center">
                                <button onClick={this.walletResetClose}>Done</button>
                            </div>
                        </div>
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
