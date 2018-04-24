import React from 'react';
import FileInput from 'react-file-input';
import {Link} from 'react-router';
const fs = window.require('fs');

import {loadWalletFromFile, loadAndDecryptWalletFromFile, decryptWalletData, DEFAULT_WALLET_PATH} from '../../utils/wallet';

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'N/A',
            path: '',
            existingEncryptedWallet: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    componentDidMount() {
        return loadWalletFromFile(DEFAULT_WALLET_PATH, (err, existingEncryptedWallet) => {
            if (err) {
                console.error(err);
                alert(err.message);
                return;
            }
            
            this.setState({
                existingEncryptedWallet
            });
        });
    }

    handleChange(e) {
        this.setState({
            filename: e.target.files[0].name,
            path: e.target.files[0].path
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const targetPassword = e.target.password.value;
        const currentPassword = e.target.current_password && e.target.current_password.value;
        
        if (!targetPassword || (this.state.existingEncryptedWallet && !currentPassword)) {
            alert(`You must enter password`);
            return;
        }
        
        return loadAndDecryptWalletFromFile(this.state.path, targetPassword, (err, targetWallet) => {
            if (!err && !targetWallet) {
                err = new Error(`File not found: ${this.state.path}`);
            }
            if (err) {
                console.error(err);
                alert(err.message);
                return;
            }
    
            if (this.state.existingEncryptedWallet) {
                // We will load the keys from the target wallet into existing wallet, and log the user in
                // TODO
            } else {
                // We will copy the target wallet to our wallet storage destination.
                // TODO
            }
    
            localStorage.setItem('encrypted_wallet', targetWallet.encrypted);
            localStorage.setItem('wallet_path', this.state.path);
            localStorage.setItem('password', targetPassword);
            localStorage.setItem('wallet', JSON.stringify(targetWallet.decrypted));
            
            this.context.router.push('/wallet');
        });
    }
    
    render() {
        const currentWalletPass = this.state.existingEncryptedWallet && (
            <div className="col-xs-12 fileandpass currentwallet">
                <p>Login for your current wallet:</p>
                <input type="password" name="current_password" placeholder="Enter Password"/>
            </div>
        );
        
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
                        
                        {currentWalletPass}
                        
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
