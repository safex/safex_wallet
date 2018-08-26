import React from 'react';
import axios from 'axios';


import SafexAddress from './SafexAddress';
import Navigation from '../Navigation';

import {getUTXO} from '../../utils/migration';


export default class Safex extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.goNext = this.goNext.bind(this);
    }


    goNext(e) {
        e.preventDefault();
        this.context.router.push('/migration')
    }

    render() {
        var data = {};
        data['one'] = "hello";
        return (
            <div>
                <Navigation />
                <SafexAddress data={data} />
                <button onClick={this.goNext}> onClick</button>
            </div>
        );
    }
}
Safex.contextTypes = {
    router: React.PropTypes.object.isRequired
};
