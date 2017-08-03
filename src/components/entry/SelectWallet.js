import React from 'react';
import { Link } from 'react-router';
var fs = window.require('fs');
var os = window.require('os');


export default class SelectWallet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoading: true,
            walletExists: false,
        };
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
                this.setState({walletExists: true});
            }

        });
    }

    render() {
        const wallet_exists = this.state.walletExists;
        console.log('is wallet exists? ' + wallet_exists);
        let show_options;

            if (wallet_exists) {
                show_options = (
                    <div className="row text-center">
                      <div className="col-xs-6">
                          <Link to="/login">
                              <img src="/images/safex-icon-circle.png" />
                              <span className="btn btn-default">Login <img src="/images/create.png" /></span>
                          </Link>
                      </div>
                      <div className="col-xs-6">
                          <Link to="/importwallet">
                              <img src="/images/safex-icon-circle.png" />
                              <span className="btn btn-default">Import Wallet <img src="/images/import.png" /></span>
                              <p>Import your wallet or recover</p>
                              <p>from backup file</p>
                          </Link>
                      </div>
                    </div>
                );
            } else {
                show_options = (
                  <div className="row text-center">
                    <div className="col-xs-6">
                        <Link to="/createwallet">
                            <img src="/images/safex-icon-circle.png" />
                            <span className="btn btn-default">New Wallet <img src="/images/create.png" /></span>
                            <p>New to SAFEX?</p>
                            <p>Or you just need a new wallet?</p>
                        </Link>
                    </div>
                    <div className="col-xs-6">
                        <Link to="/importwallet">
                            <img src="/images/safex-icon-circle.png" />
                            <span className="btn btn-default">Import Wallet <img src="/images/import.png" /></span>
                            <p>Import your wallet or recover</p>
                            <p>from backup file</p>
                        </Link>
                    </div>
                  </div>
              );
            }


        return (

            <div className="container">
                <div className="col-xs-12 Login-logo">
                    <img src="/images/logo.png" />
                </div>
                <div className="col-xs-12 App-intro">
                    {show_options}
                </div>
                <div className="col-xs-12 text-center Intro-footer">
                    <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
                </div>
            </div>
        );
    }

}


//if wallet is found main image is new wallet found
