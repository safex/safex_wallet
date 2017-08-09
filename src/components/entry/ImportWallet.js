import React from 'react';
import crypto from 'crypto';
import FileInput from 'react-file-input';
var fs = window.require('fs');

export default class ImportWallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          filename: 'wallet.dat',
          path: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        this.setState({
            filename: e.target.files[0].name,
            path: e.target.files[0].path
        })

    }

    handleSubmit(e) {
        e.preventDefault();
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = e.target.password.value;

        localStorage.setItem('password', password);
        fs.readFile(this.state.path, function read(err, data) {
            localStorage.setItem('encrypted_wallet', data);
        });
        var cipher_text = localStorage.getItem('encrypted_wallet');

        var decryped_wallet = this.decrypt(cipher_text, algorithm, password);
        try {
            var parse_wallet = JSON.parse(decryped_wallet);

            if (parse_wallet['version'] === '1') {
                localStorage.setItem('wallet', decryped_wallet);
                this.context.router.push('/wallet');
            } else {
                console.log('wrong password');
            }

        } catch (e) {
            console.log('error parsing wallet');
        }

    }

    decrypt(text, algorithm, password){
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    render() {
        return (
          <div className="container">
                   <div className="col-xs-12 Login-logo">
                       <img src="/images/logo.png" alt="Logo" />
                   </div>
                   <div className="col-xs-12 Login-form Import-wallet">
                     <form className="form-group" onSubmit={this.handleSubmit}>
                       <FileInput name="walletInput" accept=".dat" placeholder="wallet.dat" className="inputClass" onChange={this.handleChange} />

                         <div className="col-xs-12 fileandpass">
                             <p>Selected File:</p>
                             <p className="filename">{this.state.filename}</p>
                             <input type="password" name="password" placeholder="Enter Password" />
                         </div>

                         <button className="btn btn-default" type="submit">IMPORT <img src="/images/import.png" alt="Import" /></button>
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
