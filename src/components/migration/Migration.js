import React from 'react';

import MigrationAddress from './MigrationAddress';
import Navigation from '../partials/Navigation';
import {getFee} from '../../utils/migration';
import InstructionsModal from "../migration/partials/InstructionsModal";

export default class Migration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: "",
            fee: 0,
            keys: {},
            instructionsModal: false,
            loading: true
        };

        this.getPrices = this.getPrices.bind(this);
        this.goNext = this.goNext.bind(this);
        this.reloadWallet = this.reloadWallet.bind(this);
        this.wallet = this.wallet.bind(this);
        this.openInstructionsModal = this.openInstructionsModal.bind(this);
        this.closeInstructionsModal = this.closeInstructionsModal.bind(this);
    }

    getPrices() {
        getFee().then(fee => this.setState({
            fee: fee * 100000000,
            loading: false
        })).catch(e => alert("network error " + e));
    }

    componentDidMount() {
        try {
            const json = JSON.parse(localStorage.getItem('wallet'));
            this.getPrices();
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            this.setState({
                status_text: 'Failed to parse wallet'
            });
            this.context.router.push('/');
        }
        let setRefreshInterval = setInterval(this.reloadWallet, 600000);
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
        this.getPrices();
    }

    goNext(e) {
        e.preventDefault();
        this.context.router.push('/safex');
    }

    openInstructionsModal() {
        this.setState({
            instructionsModal: true
        });
    }

    closeInstructionsModal() {
        this.setState({
            instructionsModal: false
        });
    }

    render() {
        const {keys, fee} = this.state;
        var table;
        console.log("feee " + fee)
        if (fee > 0) {
            table = Object.keys(keys).map((key) => {
                var data = {};
                data['label'] = keys[key].label;
                data['address'] = keys[key].public_key;
                data['wif'] = keys[key].private_key;
                data['safex_key'] = {};
                data['fee'] = fee;
                if (keys[key].hasOwnProperty('migration_data')) {
                    data['migration_progress'] = keys[key].migration_progress;
                    data['safex_key'] = keys[key].migration_data.safex_keys;
                } else {
                    data['migration_progress'] = 0;
                }
                return <MigrationAddress
                    reloadWallet={this.reloadWallet}
                    key={key}
                    data={data}/>;
            });
        }

        if (this.state.loading) {
            return (
                <div>
                    <Navigation
                        safexPrice={this.state.safex_price}
                        btcPrice={this.state.btc_price}
                        wallet={this.wallet}
                        instructionsModal={this.state.instructionsModal}
                        openInstructionsModal={this.openInstructionsModal}
                        closeInstructionsModal={this.closeInstructionsModal}
                    />

                    <div className="container migration-wrap fadeIn">
                        <div className="spinner-wrap">
                            <div className="lds-dual-ring"></div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <Navigation
                        safexPrice={this.state.safex_price}
                        btcPrice={this.state.btc_price}
                        wallet={this.wallet}
                        instructionsModal={this.state.instructionsModal}
                        openInstructionsModal={this.openInstructionsModal}
                        closeInstructionsModal={this.closeInstructionsModal}
                    />

                    <div className="container migration-wrap fadeIn">
                        <div className="col-xs-12 migration-inner">
                            {table}
                        </div>

                        {/*<button className="button-shine" onClick={this.goNext}> To the Real Safex Wallet</button>*/}
                    </div>

                    <InstructionsModal
                        instructionsModal={this.state.instructionsModal}
                        openInstructionsModal={this.openInstructionsModal}
                        closeInstructionsModal={this.closeInstructionsModal}
                    />
                </div>
            );
        }

    }
}

Migration.contextTypes = {
    router: React.PropTypes.object.isRequired
};
