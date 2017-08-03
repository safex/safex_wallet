import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');

export default class Login extends React.Component {

    constructor(props) {
        super(props);


        this.handleSubmit = this.handleSubmit.bind(this);

    }


    handleSubmit(e) {
        e.preventDefault();
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = e.target.password.value;

        localStorage.setItem('password', password);

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
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }

    //here we load up the wallet into the local storage and move on with life.
    render() {

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="password" name="password" />
                    <button type="submit">Open Wallet</button>

                </form>

            </div>

        );
    }
}


Login.contextTypes = {
    router: React.PropTypes.object.isRequired
}


