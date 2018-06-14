import { Router, Route, hashHistory } from 'react-router';
import React from 'react';

import SelectWallet from './components/entry/SelectWallet';
import CreateWallet from './components/entry/CreateWallet';
import ImportWallet from './components/entry/ImportWallet';
import Login from './components/entry/Login';
import Wallet from './components/wallet/Wallet';
import Explorer from './components/wallet/Explorer';
import Chat from './components/wallet/Chat';

const routes = (
    <Router history={hashHistory}>
        <Route path="/" component={SelectWallet} />
        <Route path="/login" component={Login} />
        <Route path="/createwallet" component={CreateWallet} />
        <Route path="/importwallet" component={ImportWallet} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/explorer" component={Explorer} />
        <Route path="/chat" component={Chat} />

    </Router>
);

export default routes;