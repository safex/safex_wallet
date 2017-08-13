import React from 'react';
import axios from 'axios';
import Navigation from '../Navigation';

export default class Explorer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bitcoin_transactions: [],
            total_txns: 0
        }
        this.exploreAddress = this.exploreAddress.bind(this);
        //this.getSafexHistory = this.getSafexHistory.bind(this);
    }

    componentDidMount() {
        //this.getSafexHistory('1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru');
    }

    getTransactionCount(address) {
        axios.get('http://46.101.251.77:3001/insight-api/addrs/' + address + '/txs?from=0&to=20').then(res => {
            var json = JSON.stringify(res.data);
            json = JSON.parse(json);
            console.log('got total items ' + json["totalItems"])

        });
    }

   /* getSafexHistory(address) {
        var txn_count = 0;
        console.log('txn count ' + txn_count)
        var txids = [];
        var index = 0;


        axios.get('http://46.101.251.77:3001/insight-api/addrs/' + address + '/txs?from=0&to=20').then(res => {
            var json = JSON.stringify(res.data);
            json = JSON.parse(json);
            console.log('got total items ' + json["totalItems"])
            txn_count = json["totalItems"];
            while (index < txn_count) {
                if ((txn_count - index) > 50) {
                    axios.get('http://46.101.251.77:3001/insight-api/addrs/' + address + '/txs?from=' + index + '&to=' + (index + 50)).then(res => {
                        var json = JSON.stringify(res.data);
                        console.log('index is ' + index);
                        json = JSON.parse(json);
                        index += 50;
                        for (var x in json['items']) {
                            txids.push(x['txid'])
                        }
                    });
                } else {
                    axios.get('http://46.101.251.77:3001/insight-api/addrs/' + address + '/txs?from=' + index + '&to=' + txn_count).then(res => {
                        var json = JSON.stringify(res.data);
                        json = JSON.parse(json);

                        console.log('index is ' + index);
                        index = txn_count;
                        for (var x in json['items']) {
                            txids.push(x['txid'])
                        }
                    });
                }
            }
        });

        console.log('tx ids lenght ' + txids.length)
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


    getBitcoinBalance(address) {

        axios.get('http://46.101.251.77/insight-api/addr/' + address + '/balance').then(res => {
            console.log(res);
        });
        //take in an address, return the balance for bitcoins
        // /insight-api/addr/[:addr]/balance
    }

    getSafexHistory(address) {

        var json = {};
        json['address'] = address;
        axios.post('http://localhost:3001/transactions', JSON.stringify(json)).then(res => {
            console.log('safex balance repsonse ' + JSON.stringify(res.data));

            var balance = res.data;
            //console.log(balance);
            return balance;
        });


        //take in an address, return the history of transactions for safex

        // http://omniexplorer.info/ask.aspx?api=gethistory&address=1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P
    }*/


    exploreAddress(e) {
        e.preventDefault();





    }




    render() {
        const {bitcoin_transactions} = this.state;

        var table = Object.keys(bitcoin_transactions).map((transaction) => {

            return <tr key={transaction}>
                <td>{bitcoin_transactions[transaction][1].hash}</td>
                <td>{bitcoin_transactions[transaction][1].amount}</td>
                <td>{bitcoin_transactions[transaction][1].role}</td>
            </tr>
        });
        return (
            <div>
                <Navigation/>
                <div className="container explorer">
                    <h3>Explorer</h3>
                    <p className="text-center">Enter an address to explore</p>
                    <form onSubmit={this.exploreAddress}>
                        <div className="input-group">
                            <input type="text" name="address" className="form-control" placeholder="Address, Ip, Hash"
                                   aria-describedby="basic-addon2"/>
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
