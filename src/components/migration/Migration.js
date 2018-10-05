import React from 'react';

import MigrationAddress from './MigrationAddress';
import Navigation from '../partials/Navigation';


export default class Migration extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            wallet: "",
            keys: {},
        };

        this.goNext = this.goNext.bind(this);
        this.reloadWallet = this.reloadWallet.bind(this);
        this.wallet = this.wallet.bind(this);
    }

    componentDidMount() {
        console.log("rendering Migration component");
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

    wallet() {
        this.context.router.push('/wallet');
    }

    reloadWallet() {
        console.log("wallet reloaded");
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

    render() {
        const {keys} = this.state;

        var table = Object.keys(keys).map((key) => {
            var data = {};
            data['address'] = keys[key].public_key;
            data['wif'] = keys[key].private_key;
            data['migration_progress'] = 0;
            data['safex_key'] = {};
            if (keys[key].hasOwnProperty('migration_data')) {
                data['migration_progress'] = keys[key].migration_progress;
                data['safex_key'] = keys[key].migration_data.safex_keys;
            }
            return <MigrationAddress
                reloadWallet={this.reloadWallet}
                key={key}
                data={data}/>;
        });

        return (
            <div>
                <Navigation
                    wallet={this.wallet}
                />

                <div className="container migration-wrap fadeIn">
                    {table}


                    <p>
                        <button className="button-shine" onClick={this.goNext}> To the Real Safex Wallet</button>
                    </p>
                </div>
            </div>
        );
    }
}

Migration.contextTypes = {
    router: React.PropTypes.object.isRequired
};
