import React from 'react';
import FileInput from 'react-file-input';
import {Link} from 'react-router';
const fs = window.require('fs');

import {loadAndDecryptWalletFromFile} from '../../utils/wallet';

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'N/A',
            path: '',
            hasWallet: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    /*componentDidMount() {
        fs.readFile(DEFAULT_WALLET_PATH, (err, fd) => {
            if (err) {
                if (err.code !== 'ENOENT') {
                    alert()
                }
            }
        });
    }*/

    handleChange(e) {
        this.setState({
            filename: e.target.files[0].name,
            path: e.target.files[0].path
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const targetPassword = e.target.password.value;
        
        return loadAndDecryptWalletFromFile(this.state.path, targetPassword, (err, targetWallet) => {
            if (!err && !targetWallet) {
                err = new Error(`File not found: ${this.state.path}`);
            }
            if (err) {
                console.error(err);
                alert(err.message);
                return;
            }
    
            localStorage.setItem('encrypted_wallet', targetWallet.encrypted);
            localStorage.setItem('wallet_path', this.state.path);
            localStorage.setItem('password', targetPassword);
            localStorage.setItem('wallet', JSON.stringify(targetWallet.decrypted));
            
            this.context.router.push('/wallet');
        });
    }
    
    render() {
        return (
            <div className="container">
                <div className="col-xs-12 Login-logo">
                    <Link className="pul-left back-button" to="/"><img src="images/back.png"/> Back</Link>
                    <img src="images/logo.png"/>
                </div>
                <div className="col-xs-12 version-number"><p className="text-center">v0.0.6</p></div>
                <div className="col-xs-12 Login-form Import-wallet">
                    <form className="form-group" onSubmit={this.handleSubmit}>
                        <FileInput name="fileInput" accept=".dat" placeholder="wallet.dat" className="inputClass"
                            onChange={this.handleChange}/>
                        
                        <div className="col-xs-12 fileandpass">
                            <p>Selected File:</p>
                            <p className="filename">{this.state.filename}</p>
                            <input type="password" name="password" placeholder="Enter Password"/>
                        </div>
                        <div className="col-xs-12 fileandpass">
                            <input type="password" name="password" placeholder="Password for your target wallet"/>
                        </div>
                        <button className="btn btn-default" type="submit">IMPORT <img src="images/import.png"/></button>
                    </form>
                    <p className="text-center">
                        Write password down and <br/>
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
