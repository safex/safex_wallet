import React from 'react';
import { Link } from 'react-router';

const Navigation = () => (
    <div>
            <Link to="/wallet" activeClassName="activeLink" onlyActiveOnIndex>Home</Link>&nbsp;
            <Link to="/explorer" activeClassName="activeLink">Transactions</Link>&nbsp;
            <Link to="/chat" activeClassName="activeLink">Transactions</Link>&nbsp;
    </div>
);

export default Navigation;