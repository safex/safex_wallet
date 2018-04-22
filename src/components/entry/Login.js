import React from 'react';
import {Link} from 'react-router';

import { decryptWalletData } from '../../utils/wallet';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
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
            alert(err.message);
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
                       <Link className="pul-left back-button" to="/"><img src="images/back.png" /> Back</Link>
                       <img src="images/logo.png" alt="Logo" />
                   </div>
              <div className="col-xs-12 version-number"><p className="text-center">v0.0.6</p></div>
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
};
