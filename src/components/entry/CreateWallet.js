import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
var bitcoin = window.require('bitcoinjs-lib');
import { encrypt} from '../../utils/utils';
import { genkey } from '../../utils/keys';
import {Link} from 'react-router';



export default class CreateWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            walletExists: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //here we create the wallet file in the default location after prompting for a password and creating the encrypted file.

    handleSubmit(e) {
        e.preventDefault();

        if (e.target.password1.value.length > 0 && e.target.password1.value === e.target.password2.value) {
            var key_pair = genkey();

            var address = key_pair.getAddress();


            var key_json = {};
            key_json['public_key'] = address;
            key_json['private_key'] = key_pair.toWIF();
            key_json['safex_bal'] = 0;
            key_json['btc_bal'] = 0;
            key_json['pending_safex_bal'] = 0;
            key_json['pending_btc_bal'] = 0;

            var key_array = [];
            key_array.push(key_json);

            var json = {};

            json['version'] = '1';
            json['keys'] = key_array;

            console.log(json);

            var crypto = require('crypto'),
                algorithm = 'aes-256-ctr',
                password = e.target.password1.value;

            var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

            var home_dir = os.homedir();

            fs.writeFile(home_dir + '/safexwallet.dat', cipher_text, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    localStorage.setItem('password', password);
                    localStorage.setItem('wallet', JSON.stringify(json));

                    localStorage.setItem('wallet_path', home_dir + '/safexwallet.dat');
                    this.context.router.push('/wallet');
                }
            });

        } else {
            alert('you must enter a password and they must be matching')
        }
    }




    render() {
        return (
          <div className="container">
              <div className="col-xs-12 Login-logo">
                <Link className="pul-left back-button" to="/"><img src="images/back.png" /> Back</Link>
                  <img src="images/logo.png" alt="Logo" />
              </div>
              <div className="col-xs-12 version-number"><p className="text-center">v0.0.3</p></div>
              <div className="col-xs-12 Login-form">
                <form className="form-group" onSubmit={this.handleSubmit}>
                    <input className="form-control" type="password" name="password1" placeholder="Enter Password" />
                    <input className="form-control" type="password" name="password2" placeholder="Repeat Password" />
                    <button className="btn btn-default" type="submit">CREATE <img src="images/create.png" alt="Create" /></button>
                </form>
                <p className="text-center">
                    If you lose your password<br />
                    There is no recovery. <br />
                    Write it down, keep it safe. <br />
                </p>
              </div>
              <div className="col-xs-12 text-center Intro-footer">
                  <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
              </div>
          </div>
        );
    }


}

CreateWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}
