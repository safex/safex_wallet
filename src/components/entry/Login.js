import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
import { decrypt } from '../../utils/utils';
import {Link} from 'react-router';

export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            wrong_password: false,
        };

        this.wrongPassword = this.wrongPassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    wrongPassword() {
        this.setState({
            wrong_password: true
        });
        setTimeout(() => {
            this.setState({
                wrong_password: false
            });
        }, 1000)
    }

    handleSubmit(e) {
        e.preventDefault();
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = e.target.password.value;

        localStorage.setItem('password', password);

        var cipher_text = localStorage.getItem('encrypted_wallet');


            var decrypted_wallet = decrypt(cipher_text, algorithm, password);

        try {
            var parse_wallet = JSON.parse(decrypted_wallet);

            if (parse_wallet['version'] === '1') {
                localStorage.setItem('wallet', decrypted_wallet);

                this.context.router.push('/wallet');
            } else {
                this.wrongPassword();
                console.log('wrong password');
            }

        } catch (e) {
            this.wrongPassword();
            console.log('error parsing wallet');
        }
    }

    //here we load up the wallet into the local storage and move on with life.
    render() {
        return (
            <div className="container">
                <div className="col-xs-12 Login-logo">
                    <h2>Safex</h2>
                    <h3>Wallet</h3>
                    <Link className="back-button" to="/"><img src="images/back.png" alt="back button"/> Back</Link>
                </div>
                <div className="col-xs-12 Login-form">
                    <form className="form-group" onSubmit={this.handleSubmit}>
                        {
                            this.state.wrong_password
                            ?
                                <input className="form-control shake" type="password" name="password" placeholder="Enter Password" />
                            :
                                <input className="form-control" type="password" name="password" placeholder="Enter Password" />
                        }
                        <button className="btn btn-default button-neon-blue" type="submit">Proceed </button>
                    </form>
                </div>
                <div className="col-xs-12 text-center Intro-footer">
                    <img src="images/footer-logo.png" alt="Safex Icon Footer"/>
                    <p className="text-center">2014-2018 All Rights Reserved Safe Exchange Developers &copy;</p>
                </div>
            </div>
        );
    }
}

Login.contextTypes = {
    router: React.PropTypes.object.isRequired
}
