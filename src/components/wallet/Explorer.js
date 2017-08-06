import React from 'react';
import axios from 'axios';
import Navigation from '../Navigation';

export default class Explorer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transactions: []
        }
        this.exploreAddress = this.exploreAddress.bind(this);
        this.getSafexHistory = this.getBitcoinHistory.bind(this);
    }

    getBitcoinPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            console.log(res);
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'BTC') {
                        console.log(res.data[i].price_usd)
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get the current price of bitcoin
    }

    getSafexPrice() {
        axios.get('https://api.coinmarketcap.com/v1/ticker/').then(res => {
            console.log(res);
            try {
                for (var i = 0; i < res.data.length; i++) {
                    // look for the entry with a matching `code` value
                    if (res.data[i].symbol === 'SAFEX') {
                        console.log(res.data[i].price_usd)
                        this.setState({safex_price: res.data[i].price_usd});
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        //get latest price of safex
    }

    getBitcoinHistory() {
        //take in an address, return the history of transactions
        //transaction history:
        // /insight-api/txs/?address=mmhmMNfBiZZ37g1tgg2t8DDbNoEdqKVxAL
    }

    getBitcoinBalance(address) {

        axios.get('http://46.101.251.77/insight-api/addr/' + address + '/balance').then(res => {
            console.log(res);
        });
        //take in an address, return the balance for bitcoins
        // /insight-api/addr/[:addr]/balance
    }

    getSafexHistory(address) {
    console.log('in there');
        fetch('https://www.omniwallet.org/v1/transaction/address', { method: 'POST', body: 'addr=' + address })
            .then(res => res.json())
            .then(json => console.log(json));


        //take in an address, return the history of transactions for safex

        // http://omniexplorer.info/ask.aspx?api=gethistory&address=1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P
    }

    getSafexBalance(address) {
        //take in an address, return the balance for safex coins

        //  http://omniexplorer.info/ask.aspx?api=getbalance&prop=1&address=1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P
    }

    exploreAddress(e) {


        e.preventDefault();

        var options = {
                method: 'POST',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'addr=' + e.target.address.value,
                //mode: 'no-cors',
            };
        var response;
        console.log(e.target.address.value);
        fetch('https://cors-anywhere.herokuapp.com/https://www.omniwallet.org/v1/transaction/address', options)
            .then(res => res.json())
            .then(json => {
    var transactions = json.transactions;
    var result = [];
    for(var i in transactions)
    result.push([i, transactions [i]]);
    this.setState({transactions:result});
    console.log(this.state.transactions);
 })
            .catch(e => console.log(e));
    }


    render() {
        const {transactions} = this.state;

        var table = Object.keys(transactions).map((transaction) => {

                return <tr key={transaction}>
                            <td>{transactions[transaction][1].hash}</td>
                            <td>{transactions[transaction][1].amount}</td>
                            <td>{transactions[transaction][1].role}</td>
                       </tr>
                    });
        return (
            <div>
                <Navigation/>
                <div className="container explorer">
                    <h3>Explorer</h3>
                    <p className="text-center">You may enter a block height, address, block hash, transaction hash, hash160, or ipv4
                        address...</p>
                    <form onSubmit={this.exploreAddress}>
                        <div className="input-group">
                          <input type="text" name="address" className="form-control" placeholder="Address, Ip, Hash" aria-describedby="basic-addon2" />
                          <span className="input-group-addon" id="basic-addon2"><button type="submit">SEARCH</button></span>
                        </div>
                    </form>
                    <table className="table">
                        <thead>
                            <th>Hash</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </thead>
                        <tbody>
                            {table}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
