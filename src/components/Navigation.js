import React from 'react';
import { Link } from 'react-router';

const Navigation = () => (
    <div>
            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Wallet</Link>&nbsp;
            <Link to="/explorer" activeClassName="activeLink">Explorer</Link>&nbsp;
            <Link to="/chat" activeClassName="activeLink">Chat</Link>&nbsp;
    </div>
);

export default Navigation;