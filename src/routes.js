import { IndexRoute, Router, Route, hashHistory } from 'react-router';
import React from 'react';
import Container from './components/Container';
import Home from './components/Home';
import SelectWallet from './components/entry/SelectWallet';
import CreateWallet from './components/entry/CreateWallet';
import ImportWallet from './components/entry/ImportWallet';
import Login from './components/entry/Login';

const routes = (
    <Router history={hashHistory}>
        <Route path="/" component={SelectWallet} />
        <Route path="/login" component={Login} />
        <Route path="/createwallet" component={CreateWallet} />
        <Route path="/importwallet" component={ImportWallet} />

    </Router>
);

export default routes;