import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
var os = window.require('os');



export default class CreateWallet extends React.Component {
    constructor(props) {
        super(props);


    }

    //here we create the wallet file in the default location after prompting for a password and creating the encrypted file.

    create_wallet() {
        var home_dir = os.homedir();

        fs.writeFile(home_dir + '/safexwallet.dat', '', function (err) {
            if (err) {
                console.log(err);
            }
        });
    }


    render() {
        return (
            <div>

                Create Wallet
            </div>
        );
    }




}