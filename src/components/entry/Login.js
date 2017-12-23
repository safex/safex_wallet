import React from 'react';
import crypto from 'crypto';
var fs = window.require('fs');
import { decrypt } from '../../utils/utils';
import {Link} from 'react-router';

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
            alert('wrong password');
            console.log('error parsing wallet');
        }

    }

    //here we load up the wallet into the local storage and move on with life.
    render() {

        return (
          <div className="container">
                   <div className="col-xs-12 Login-logo">
                       <Link className="pul-left back-button" to="/"><img src="images/back.png" /> Back</Link>
                       <img src="images/logo.png" alt="Logo" />
                   </div>
              <div className="col-xs-12 version-number"><p className="text-center">v0.0.5</p></div>
                   <div className="col-xs-12 Login-form">
                     <form className="form-group" onSubmit={this.handleSubmit}>
                         <input className="form-control" type="password" name="password" placeholder="Enter Password" />
                         <button className="btn btn-default" type="submit">LOGIN <img src="images/create.png" alt="Create" /></button>
                     </form>
                   </div>
                   <div className="col-xs-12 text-center Intro-footer">
                       <p className="text-center">2014-2017 All Rights Reserved Safe Exchange Developers &copy;</p>
                   </div>
               </div>
        );
    }
}


Login.contextTypes = {
    router: React.PropTypes.object.isRequired
}
