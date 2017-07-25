import React from 'react';
import Navigation from './Navigation';

const Header = () => (
    <div className="App-header">
        <img src="./img/logo_64.png" className="App-logo" alt="logo" />
        <h5>Welcome to SAFEX Wallet</h5>
        <Navigation />
    </div>
);

export default Header;