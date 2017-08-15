import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
import FileInput from 'react-file-input';
import { decrypt } from '../../utils/utils';

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
            <div>
                <form onSubmit={this.handleSubmit}>
                    <FileInput name="fileInput" placeholder="safexwallet.dat" onChange={this.handleChange} />
                    <input type="password" name="password" />
                    <button type="submit">Import </button>
                </form>
            </div>
        );
    }



}

ImportWallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}
