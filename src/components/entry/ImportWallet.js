import React from 'react';
const fs = window.require('fs');
import FileInput from 'react-file-input';
import {Link} from 'react-router';

import { decrypt } from '../../utils/utils';

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'N/A',
            path: ''
        };

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

        fs.readFile(this.state.path, (err, fd) => {
            if (err) {
                console.error(err);
                alert(`Failed to read file ${this.state.path}: ${err.message}`);
            } else {
                localStorage.setItem('encrypted_wallet', fd);
                localStorage.setItem('wallet_path', this.state.path);
                localStorage.setItem('password', password);

                const cipher_text = localStorage.getItem('encrypted_wallet');
    
                const algorithm = 'aes-256-ctr';
                const password = e.target.password.value;
                const decryptedWallet = decrypt(cipher_text, algorithm, password);

                let parsedWallet;
                try {
                    parsedWallet = JSON.parse(decryptedWallet);
                }
                catch (e) {
                    // This means we got an invalid JSON. Wrong password or corrupted file (no way to know?)
                    alert(`Invalid password or corrupted wallet file`);
                    return;
                }

                if (!parsedWallet || parsedWallet['version'] !== '1') {
                    // We got correct decrypt, but wallet is in some unsupported format
                    alert(`Invalid wallet format`);
                    return;
                }
                
                localStorage.setItem('wallet', decryptedWallet);
                this.context.router.push('/wallet');
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
               <div className="col-xs-12 version-number"><p className="text-center">v0.0.6</p></div>
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
};
