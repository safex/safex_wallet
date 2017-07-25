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
        var it_works = false;
        fs.readFile(home_dir + '/safexwallet.dat', (err, fd) => {
            if (err) {
                //if the error is that No File exists, let's step through and make the file
                if (err.code === 'ENOENT') {
                    console.log('error');
                    this.setState({walletExists: false});

                }
            } else {
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
                <div>
                    <Link to="/login">login</Link>
                    <Link to="/importwallet">Import Wallet</Link>
                </div>);
            } else {
                show_options = (<div>
                    <Link to="/createwallet">Create Wallet</Link>
                    <Link to="/importwallet">Import Wallet</Link>
                </div>);
            }


        return (

            <div>
                <div className="App-intro">
                    {show_options}
                </div>
            </div>
        );
    }

}


//if wallet is found main image is new wallet found