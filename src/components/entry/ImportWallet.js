import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
import FileInput from 'react-file-input';
import { decrypt } from '../../utils/utils';
import {Link} from 'react-router';

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'safexwallet.dat',
            path: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({
            filename: e.target.files[0].name,
            path: e.target.files[0].path
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = e.target.password.value;

        fs.readFile(this.state.path, (err, fd) => {
            if (err) {
                //if the error is that No File exists, let's step through and make the file
                if (err.code === 'ENOENT') {
                    console.log('error');

                }
            } else {
                localStorage.setItem('encrypted_wallet', fd);
                localStorage.setItem('wallet_path', this.state.path);
                localStorage.setItem('password', password);

                var cipher_text = localStorage.getItem('encrypted_wallet');

                var decrypted_wallet = decrypt(cipher_text, algorithm, password);


                try {
                    var parse_wallet = JSON.parse(decrypted_wallet);


                    if (parse_wallet['version'] === '1') {
                        localStorage.setItem('wallet', decrypted_wallet);
                        this.context.router.push('/wallet');
                    } else {
                        console.log('wrong password');
                    }

                } catch (e) {
                    console.log(e);
                }
            }

        });


    }

    render() {
        return (
           <div className="container">
                    <div className="col-xs-12 Login-logo">
                      <Link className="pul-left back-button" to="/"><img src="images/back.png" /> Back</Link>
                        <img src="images/logo.png" />
                    </div>
               <div className="col-xs-12 version-number"><p className="text-center">v0.0.2</p></div>
                    <div className="col-xs-12 Login-form Import-wallet">
                      <form className="form-group" onSubmit={this.handleSubmit}>
                       <FileInput name="fileInput" accept=".dat" placeholder="wallet.dat" className="inputClass" onChange={this.handleChange} />

                          <div className="col-xs-12 fileandpass">
                              <p>Selected File:</p>
                              <p className="filename">{this.state.filename}</p>
                              <input type="password" name="password" placeholder="Enter Password" />
                         </div>
                          <button className="btn btn-default" type="submit">IMPORT <img src="images/import.png" /></button>
                     </form>
                      <p className="text-center">
                          Write password down and <br />
                          NEVER lose it.
                      </p>
                    </div>
                    <div className="col-xs-12 text-center Intro-footer">
                        <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
                    </div>
                </div>
        );
    }



}

ImportWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}
