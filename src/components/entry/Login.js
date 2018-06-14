import React from 'react';
import {Link} from 'react-router';

import { decryptWalletData } from '../../utils/wallet';

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
        }, 1000);
    }

    handleSubmit(e) {
        e.preventDefault();

        localStorage.setItem('password', e.target.password.value);

        let wallet;
        try {
            wallet = decryptWalletData();
        }
        catch (err) {
            console.error(err);
            this.wrongPassword();
            return;
        }

        localStorage.setItem('wallet', JSON.stringify(wallet));
        this.context.router.push('/wallet');
    }

    //here we load up the wallet into the local storage and move on with life.
    render() {
        return (
            <div className="container">
                <div className="col-xs-12 Login-logo">
                    <h2>Safex</h2>
                    <h3>Wallet</h3>
                    <p>v0.0.7</p>
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
};
