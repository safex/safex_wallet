import React from 'react';
import axios from 'axios';


import MigrationAddress from './MigrationAddress';
import Navigation from '../Navigation';

import {getUTXO} from '../../utils/migration';
import Login from "../entry/Login";



export default class Migration extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            wallet: "",
            keys: {},
            burn_address: "",
        };

        this.goNext = this.goNext.bind(this);
    }

    componentDidMount() {
        try {
            const json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            this.setState({
                status_text: 'Failed to parse wallet'
            });
            this.context.router.push('/');
        }
    }

    goNext(e) {
        e.preventDefault();
        this.context.router.push('/safex')
    }

    //set hard coded address that is labelled the "burn address"
    //script will check this address for transaction history, and also capture the address setting transaction
    //restrict these addresses to only safex transactions

    render() {


        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {
            var data = {};
            data['address'] = keys[key].public_key;
            data['wif'] = keys[key].private_key;
            console.log(data)
            return <MigrationAddress key={key} data={data} />;

        });

        return (
            <div>
                <Navigation />

                {table}
                <button onClick={this.goNext}> onClick</button>
            </div>
        );
    }
}

Migration.contextTypes = {
    router: React.PropTypes.object.isRequired
};
