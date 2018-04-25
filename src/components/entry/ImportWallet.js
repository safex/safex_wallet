import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
import FileInput from 'react-file-input';
import { decrypt } from '../../utils/utils';
import {Link} from 'react-router';

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        var file = 'N/A'
        fs.stat('safexwallet.dat', function(err, stats) {
            if(err == null) {
                file = 'safexwallet.dat'
                console.log('Wallet file exists');
            }
        })

        this.state = {
            filename: file,
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
                    console.error('error');
                    // TODO: Nothing happens here?
                }
            } else {
                localStorage.setItem('encrypted_wallet', fd);
                localStorage.setItem('wallet_path', this.state.path);
                localStorage.setItem('password', password);

                const cipher_text = localStorage.getItem('encrypted_wallet');

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
                    <h2>Safex</h2>
                    <h3>Wallet</h3>
                    <Link className="back-button" to="/"><img src="images/back.png" /> Back</Link>
                </div>
                <div className="col-xs-12 Import-wallet">
                    <form className="form-group" onSubmit={this.handleSubmit}>
                        <FileInput name="fileInput" accept=".dat" placeholder="wallet.dat" className="inputClass" onChange={this.handleChange} />

                        <div className="col-xs-12 fileandpass">
                            <p>Selected File:</p>
                            <p className="filename">{this.state.filename}</p>
                            <input type="password" name="password" placeholder="Enter Password" />
                        </div>
                        <button className="btn btn-default button-neon-green" type="submit">IMPORT </button>
                    </form>
                    <p className="text-center">
                        Write password down and <br />
                        NEVER lose it.
                    </p>
                </div>
                <div className="col-xs-12 text-center Intro-footer">
                    <img src="images/footer-logo.png" alt="Safex Icon Footer"/>
                    <p className="text-center">2014-2018 All Rights Reserved Safe Exchange Developers &copy;</p>
                </div>
            </div>
        );
    }



}

ImportWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}
