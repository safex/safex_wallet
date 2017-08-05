import React from 'react';
import {Link} from 'react-router';

const Navigation = () => (
  <nav className="navbar navbar-default">
    <div className="container">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand" href="#">
          <Link to="/wallet"><img src="/images/logo.png" /></Link>
        </a>
      </div>

      <div className="collapse navbar-collapse" id="navbar-collapse">
        <ul className="nav navbar-nav navbar-right">
          <li>
            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Wallet <img src="/images/create.png" /></Link>
          </li>
          <li>
            <Link to="/explorer" activeClassName="activeLink">Explorer <img src="/images/explorer.png" /></Link>
          </li>
          <li>
            <Link to="/chat" activeClassName="activeLink">Chat <img src="/images/history.png" /></Link>
          </li>
        </ul>
      </div>
      <div className="collapse navbar-collapse" id="navbar-collapse">
      <ul className="nav navbar-nav navbar-right coin-amounts">
        <li>SAFEX <span className="amount">560000</span></li>
        <li>BTC <span className="amount">0.0003242</span></li>
      </ul>
    </div>
    </div>
  </nav>
);

export default Navigation;
