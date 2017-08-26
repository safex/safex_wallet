import React from 'react';
import {Link} from 'react-router';

var fs = window.require('fs');
var os = window.require('os');


export default class SelectWallet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoading: true,
            walletExists: false,
            walletResetModal1: false,
            walletResetModal2: false,
            walletResetModal2un: false,
            walletResetModal3: false
        };
        this.walletResetStep0 = this.walletResetStep0.bind(this);
        this.walletResetStep1 = this.walletResetStep1.bind(this);
        this.walletResetStep1un = this.walletResetStep1un.bind(this);
        this.walletResetStep2 = this.walletResetStep2.bind(this);
        this.walletResetStep2un = this.walletResetStep2un.bind(this);
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
    walletResetStep0() {
        alert('Blah blah blah');
        this.setState({
            walletResetModal1: true
        })
    }
    //This happens when you click skip on the first modal
    walletResetStep1() {
        this.setState({
            walletResetModal2: true
        })
    }
    //This happens when you click proceed on the first modal
    walletResetStep1un() {
        this.setState({
            walletResetModal2un: true
        })
    }
    //This is the step 2 for the encrypted wallet
    walletResetStep2() {
        this.setState({
            walletResetModal3: true
        })
    }
    //This is the step 2 for the encrypted wallet(password entered here)
    walletResetStep2un(e) {
        e.preventDefault();
        this.setState({
            walletResetModal3: true
        })
    }
    //This closes every modal
    walletResetClose() {
        this.setState({
            walletResetModal1: false,
            walletResetModal2: false,
            walletResetModal2un: false,
            walletResetModal3: false
        })
    }

    render() {
        const wallet_exists = this.state.walletExists;
        let show_options;

        if (wallet_exists) {
            show_options = (
              <div className="container">
                  <div className="col-xs-12 Login-logo">
                      <img src="images/logo.png" alt="Logo"/>
                      <span className="pul-right back-button wallet-reset-button" onClick={this.walletResetStep0}>Wallet Reset</span>
                  </div>
                  <div className="col-xs-12 App-intro">
                    <div className="row text-center">
                        <div className="col-xs-6">
                            <Link to="/login">
                                <div className="col-xs-12">
                                    <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                    <span className="btn btn-default">Login <img src="images/create.png"
                                                                                 alt="Create"/></span>
                                </div>
                                <p>Enter your password</p>
                            </Link>
                        </div>
                        <div className="col-xs-6">
                            <Link to="/importwallet">
                                <div className="col-xs-12">
                                    <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                    <span className="btn btn-default">Import Wallet <img src="images/import.png"
                                                                                         alt="Import"/></span>
                                </div>
                                <p>Import a safexwallet file</p>
                            </Link>
                        </div>
                    </div>
                  </div>
                  <div className="col-xs-12 text-center Intro-footer">
                      <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
                  </div>
              </div>

            );
        } else {
            show_options = (
              <div className="container">
                  <div className="col-xs-12 Login-logo">
                      <img src="images/logo.png" alt="Logo"/>
                  </div>
                  <div className="col-xs-12 App-intro">
                    <div className="row text-center">
                        <div className="col-xs-6">
                            <Link to="/createwallet">
                                <div className="col-xs-12">
                                    <img src="images/safex-icon-circle.png" alt="Safex Icon Circle"/>
                                    <span className="btn btn-default">New Wallet <img src="images/create.png"
                                                                                      alt="Create"/></span>
                                </div>
                                <p>Create a new Wallet</p>
                            </Link>
                        </div>
                        <div className="col-xs-6">
                            <Link to="/importwallet">
                                <div className="col-xs-12">
                                    <img src="images/import-main.png" alt="Safex Icon Circle"/>
                                    <span className="btn btn-default">Import Wallet <img src="images/import.png"
                                                                                         alt="Import"/></span>
                                </div>
                                <p>Import a safexwallet file</p>
                            </Link>
                        </div>
                    </div>
                  </div>
                  <div className="col-xs-12 text-center Intro-footer">
                      <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
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
                                    <h3>Wallet Reset Step 1
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>If you have your password and want to backup your keys unencrypted press proceed, otherwise press skip</p>
                                    <div className="col-xs-12 text-center">
                                        <button onClick={this.walletResetStep1}>Skip</button>
                                        <button onClick={this.walletResetStep1un}>Proceed</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.walletResetModal2
                            ? 'overflow sendModal walletResetModal active'
                            : 'overflow sendModal walletResetModal'}>
                            <div className="container">
                                <div className="col-xs-12">
                                    <h3>Wallet Reset Step 2
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>Blah Blah Blah</p>
                                    <div className="col-xs-12 text-center">
                                        <button onClick={this.walletResetStep2}>Proceed</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.walletResetModal2un
                            ? 'overflow sendModal walletResetModal active'
                            : 'overflow sendModal walletResetModal'}>
                            <div className="container">
                                <div className="col-xs-12">
                                    <h3>Wallet Reset Step 2
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <div className="col-xs-4 col-xs-offset-4 text-center">
                                        <form className="form-group" onSubmit={this.walletResetStep2un}>
                                           <input className="form-control text-center" type="password" name="password" placeholder="Enter Password" />
                                           <button className="btn btn-default" type="submit">Proceed</button>
                                       </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.walletResetModal3
                            ? 'overflow sendModal walletResetModal active'
                            : 'overflow sendModal walletResetModal'}>
                            <div className="container">
                                <div className="col-xs-12">
                                    <h3>Wallet Reset Done
                                        <span onClick={this.walletResetClose} className="close">X</span>
                                    </h3>
                                    <p>Blah Blah Blah</p>
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


//if wallet is found main image is new wallet found
