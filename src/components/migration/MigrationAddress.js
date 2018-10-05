import React from 'react';

import Migrate1 from './Migrate1';
import Migrate2 from './Migrate2';
import Migrate3 from './Migrate3';
import Migrate4 from './Migrate4';
import Migrate5 from './Migrate5';

import {
    getFee
} from '../../utils/migration';
import {encrypt} from "../../utils/utils";

const fs = window.require('fs');


export default class MigrationAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            address: "",
            wif: "",
            safex_bal: 0,
            pending_safex_bal: 0,
            btc_bal: 0,
            pending_btc_bal: 0,
            safex_price: 0,
            btc_price: 0,
            status_text: "",
            migration_progress: 0,
            show_migration: false,
            safex_key: {}
        };
        this.refresh = this.refresh.bind(this);
        this.setMigrationVisible = this.setMigrationVisible.bind(this);
        this.setMigrationProgress = this.setMigrationProgress.bind(this);
    }


    componentDidMount() {
        getFee().catch(e => alert("network error " + e));
        this.setState({
            address: this.props.data.address,
            wif: this.props.data.wif,
            migration_progress: this.props.data.migration_progress,
            loading: false,
            safex_key: this.props.data.safex_key,
        });
        this.getBalances(this.props.data.address);
    }

    getBalances(address) {
        this.setState({loading: true});
        var promises = [];
        var json = {};
        json['address'] = address;
        promises.push(fetch('http://omni.safex.io:3001/balance', {
            method: "POST",
            body: JSON.stringify(json)
        }).then(resp => resp.json())
            .then((resp) => {
                return resp
            }));
        promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/balance')
            .then(resp => resp.text())
            .then((resp) => {
                return resp
            }));
        promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + address + '/unconfirmedBalance')
            .then(resp => resp.text())
            .then((resp) => {
                return resp
            }));
        promises.push(fetch('http://omni.safex.io:3001/unconfirmed', {
            method: "POST",
            body: JSON.stringify(json)
        })
            .then(resp => resp.json())
            .then((resp) => {
                return resp
            }));

        Promise.all(promises).then(values => {
            this.setState({
                safex_bal: values[0].balance,
                btc_bal: (values[1] / 100000000).toFixed(8),
                pending_btc_bal: (values[2] / 100000000).toFixed(8),
                pending_safex_bal: values[3],
                btc_sync: true,
                safex_sync: true,
                status_text: 'Synchronized',
                safex_price: localStorage.getItem('safex_price'),
                btc_price: localStorage.getItem('btc_price'),
                loading: false
            });
        }).catch(e => {
            console.log(e)
            this.setState({
                status_text: 'Sync error, please refresh',
                loading: false
            });
        });
    }

    refresh(e) {
        e.preventDefault();
        this.getBalances(this.state.address);
    }


    setMigrationVisible() {
        if (this.state.show_migration == true) {
            this.setState({show_migration: false});
        } else {
            this.setState({show_migration: true});
        }
    }

    setMigrationProgress(step) {
        this.setState({loading: true})

        try {
            var json_lswallet = JSON.parse(localStorage.getItem('wallet'));
            var index = -1;

            json_lswallet.keys.find((item, i) => {
                if (item.public_key === this.state.address) {
                    index = i;
                }
            });

            let modded_json;
            modded_json = json_lswallet.keys[index];
            modded_json.migration_progress = step;
            json_lswallet.keys[index] = modded_json;

            var algorithm = 'aes-256-ctr';
            var password = localStorage.getItem('password');
            var cipher_text = encrypt(JSON.stringify(json_lswallet), algorithm, password);

            fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                if (err) {
                    alert('Problem communicating to the wallet file.');
                } else {
                    localStorage.setItem('wallet', JSON.stringify(json_lswallet));
                    if (json_lswallet.keys[index].hasOwnProperty('migration_data')) {
                        this.setState({
                            safex_key: json_lswallet.keys[index].migration_data.safex_keys,
                            migration_progress: step,
                            loading: false
                        });
                    } else {
                        this.setState({
                            migration_progress: step,
                            loading: false
                        });
                    }

                }
            });
        } catch (e) {
            alert('Error parsing the wallet data');
        }
    }

    render() {
        let {migration_progress, address, wif, safex_key} = this.state;
        let migration_shot;

        switch (migration_progress) {
            case 0:
                var data = {};
                migration_shot = <Migrate1
                    setMigrationVisible={this.setMigrationVisible}
                    setMigrationProgress={this.setMigrationProgress}
                    key={address}
                    data={data}/>;
                break;
            case 1:
                var data = {};
                data['address'] = address;
                migration_shot = <Migrate2
                    setMigrationVisible={this.setMigrationVisible}
                    setMigrationProgress={this.setMigrationProgress}
                    key={address}
                    data={data}/>;
                break;
            case 2:
                var data = {};
                data['address'] = address;
                data['wif'] = wif;
                data['safex_key'] = safex_key;
                //set first half of key
                migration_shot = <Migrate3
                    setMigrationVisible={this.setMigrationVisible}
                    setMigrationProgress={this.setMigrationProgress}
                    key={address}
                    data={data}/>
                break;
            case 3:
                var data = {};
                data['address'] = address;
                data['wif'] = wif;
                data['safex_key'] = safex_key;
                //set second half of key
                migration_shot = <Migrate4
                    setMigrationVisible={this.setMigrationVisible}
                    setMigrationProgress={this.setMigrationProgress}
                    key={address}
                    data={data}/>
                break;
            case 4:
                var data = {};
                data['address'] = address;
                data['wif'] = wif;
                data['safex_key'] = safex_key;
                //send to burn address
                migration_shot = <Migrate5
                    setMigrationVisible={this.setMigrationVisible}
                    setMigrationProgress={this.setMigrationProgress}
                    key={address}
                    data={data}/>
                break;
        }


        return (
            <div>

                {this.state.show_migration ? <div>{migration_shot}</div> : null}

                address {this.state.address}
                <br/>
                safex {this.state.safex_bal}
                <br/>
                pending safex {this.state.pending_safex_bal}
                <br/>
                btc {this.state.btc_bal}
                <br/>
                pending btc {this.state.pending_btc_bal}
                <br/>

                <button onClick={() => {
                    this.setMigrationProgress(0)
                }}>show 1
                </button>
                <button onClick={() => {
                    this.setMigrationProgress(1)
                }}>show 2
                </button>
                <button onClick={() => {
                    this.setMigrationProgress(2)
                }}>show 3
                </button>
                <button onClick={() => {
                    this.setMigrationProgress(3)
                }}>show 4
                </button>
                <button onClick={() => {
                    this.setMigrationProgress(4)
                }}>show 5
                </button>
                <button onClick={this.setMigrationVisible}>
                    {
                        this.state.show_migration ?
                            "Hide Migration" : "Migrate"
                    }</button>


            </div>
        )
    }
}