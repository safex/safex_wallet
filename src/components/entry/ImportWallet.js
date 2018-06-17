import React from 'react';
import FileInput from 'react-file-input';
import {Link} from 'react-router';
import {
    decryptWalletData,
    DEFAULT_WALLET_PATH,
    loadAndDecryptWalletFromFile,
    loadWalletFromFile,
    flashField,
    walletImportAlert,
} from '../../utils/wallet';
import {encrypt} from '../../utils/utils';

const fs = window.require('fs');

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'N/A',
            path: '',
            currentEncryptedWallet: null,
            wrongCurrentPassword: false,
            wrongTargetPassword: false,
            walletImportAlerts: false,
            walletImportAlertsText: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.walletImportAlertsClose = this.walletImportAlertsClose.bind(this);
    }
    
    wrongCurrentPassword() {
        flashField(this, 'wrongCurrentPassword');
    }

    wrongTargetPassword() {
        flashField(this, 'wrongTargetPassword');
    }

    openWalletImportAlert(message, duration) {
        walletImportAlert(this, message, duration)
    }

    componentDidMount() {
        return loadWalletFromFile(DEFAULT_WALLET_PATH, (err, currentEncryptedWallet) => {
            if (err) {
                console.error(err);
                this.openWalletImportAlert(err.message, 5000);
                return;
            }

            this.setState({
                currentEncryptedWallet
            });
        });
    }

    handleChange(e) {
        const file = e.target.files[0];
        if (file) {
            this.setState({
                filename: file.name,
                path: file.path
            });
        }
    }

    walletImportAlertsClose() {
        this.setState({
            walletImportAlerts: false,
            walletImportAlertsText: ''
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        // For now, hardcoded. At some point, this might become user setting
        const walletPath = DEFAULT_WALLET_PATH;
        localStorage.setItem('wallet_path', walletPath);

        if (!this.state.path) {
            this.openWalletImportAlert(`You must select a wallet file first`, 5000);
            this.wrongTargetPassword();
            return;
        }

        const targetPassword = e.target.password.value;
        if (!targetPassword) {
            this.openWalletImportAlert(`You must enter password for the wallet file`, 5000);
            this.wrongTargetPassword();
            return;
        }

        let currentPassword;
        if (this.state.currentEncryptedWallet) {
            currentPassword = e.target.current_password && e.target.current_password.value;
            if (!currentPassword) {
                this.openWalletImportAlert(`You must enter password for your current wallet. 
                If you want to throw it away and replace it with this new one, go back and click "RESET WALLET" in the top right corner first.`, 12000);
                this.wrongCurrentPassword();
                return;
            }
        }

        return loadAndDecryptWalletFromFile(this.state.path, targetPassword, (err, targetWallet) => {
            if (!err && !targetWallet) {
                err = new Error(`File not found`);
            }
            if (err) {
                console.error(err);
                this.openWalletImportAlert('Failed to load target wallet: ' + err.message, 5000);
                this.wrongTargetPassword();
                return;
            }

            if (!this.state.currentEncryptedWallet) {
                // The user doesn't have a wallet yet.
                // We will write the target wallet to our wallet storage destination.
                // Note that we use flags to ensure we only write if file doesn't exist

                return fs.writeFile(walletPath, targetWallet.encrypted, {flag: 'wx'}, (err) => {
                    if (err) {
                        console.error(err);
                        this.openWalletImportAlert(err.message, 5000);
                        return;
                    }

                    // We have adopted the import wallet as our new permanent wallet file. Store it and finish.
                    localStorage.setItem('encrypted_wallet', targetWallet.encrypted);
                    localStorage.setItem('password', targetPassword);
                    localStorage.setItem('wallet', JSON.stringify(targetWallet.decrypted));

                    this.context.router.push('/wallet');
                });
            }

            // If we haven't exited by now, it means user already has a wallet.
            // We will load the keys from the target wallet into existing wallet, and log the user in

            let decrypted;
            try {
                decrypted = decryptWalletData(this.state.currentEncryptedWallet, currentPassword);
            }
            catch (err) {
                this.openWalletImportAlert('Failed to access your current wallet: ' + err.message, 5000);
                this.wrongCurrentPassword();
                return;
            }

            decrypted.keys = decrypted.keys || [];

            // We have both wallets. Add keys from the disk wallet into user's current wallet
            let importedCount = 0;
            const targetKeys = targetWallet.decrypted.keys || [];
            targetKeys.forEach(keyInfo => {
                const alreadyExists = decrypted.keys.some(existingKeyInfo => {
                    return existingKeyInfo.private_key === keyInfo.private_key;
                });
                if (alreadyExists) {
                    // This is a duplicate key. For now, just remember how many duplicates we had.
                    // When we have better UI, we might offer the user more options (keep old / take new / etc.)
                    return;
                }

                decrypted.keys.push(keyInfo);
                importedCount++;
            });

            // We now need to re-encrypt the wallet and save it to disk with imported keys

            const algorithm = 'aes-256-ctr';
            const decryptedStr = JSON.stringify(decrypted);
            const reEncrypted = encrypt(decryptedStr, algorithm, currentPassword);

            return fs.writeFile(walletPath, reEncrypted, (err) => {
                if (err) {
                    this.openWalletImportAlert(err.message, 5000);
                    return;
                }

                // We are done. Save the wallet to storage and log user in.

                const duplicatesMessage = importedCount < targetKeys.length
                    ? ` (found ${targetKeys.length - importedCount} duplicates)`
                    : '';
                this.openWalletImportAlert(`Imported ${importedCount} out of ${targetKeys.length} keys${duplicatesMessage}.`, 4000);

                localStorage.setItem('encrypted_wallet', reEncrypted);
                localStorage.setItem('password', currentPassword);
                localStorage.setItem('wallet', decryptedStr);

                this.context.router.push('/wallet');
            });
        });
    }

    render() {
        const currentWalletPass = this.state.currentEncryptedWallet && (
            <div className="col-xs-12 fileandpass currentwallet">
                <p>Login for your current wallet:</p>
                <input type="password" name="current_password" placeholder="Enter Password"
                    className={this.state.wrongCurrentPassword ? 'form-control shake' : 'form-control'} />
            </div>
        );

        return (
            <div className="container">
                <div className="col-xs-12 Login-logo">
                    <h2>Safex</h2>
                    <h3>Wallet</h3>
                    <p>v0.0.7</p>
                    <Link className="back-button" to="/"><img src="images/back.png"/> Back</Link>
                </div>
                <div className="col-xs-12 Import-wallet">
                    <form className="form-group" onSubmit={this.handleSubmit}>
                        <FileInput name="fileInput" accept=".dat" placeholder="wallet.dat" className="inputClass"
                            onChange={this.handleChange}/>

                        <div className="col-xs-12 fileandpass">
                            <p>Selected File:</p>
                            <p className="filename">{this.state.filename}</p>
                            <input type="password"
                                className={this.state.wrongTargetPassword ? 'form-control shake' : 'form-control'}
                                name="password"
                                placeholder="Enter Password"/>
                        </div>

                        {currentWalletPass}

                        <button className="btn btn-default button-neon-green" type="submit">IMPORT</button>
                    </form>
                    <p className="text-center">
                        Write password down and NEVER lose it.
                    </p>
                </div>
                <div className="col-xs-12 text-center Intro-footer">
                    <img src="images/footer-logo.png" alt="Safex Icon Footer"/>
                    <p className="text-center">2014-2018 All Rights Reserved Safe Exchange Developers &copy;</p>
                </div>

                <div className={this.state.walletImportAlerts
                    ? 'overflow sendModal walletResetModal active'
                    : 'overflow sendModal walletResetModal'}>
                    <div className="container">
                        <h3>Wallet Import
                            <span onClick={this.walletImportAlertsClose} className="close">X</span>
                        </h3>
                        <p>{this.state.walletImportAlertsText}</p>
                    </div>
                </div>
            </div>
        );
    }
}

ImportWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
};
