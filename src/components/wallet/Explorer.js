import React from 'react';
import axios from 'axios';
import Navigation from '../Navigation';

export default class Explorer extends React.Component {
    constructor(props) {
        super(props);
        this.exploreAddress = this.exploreAddress.bind(this);
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

    getSafexHistory() {
        //take in an address, return the history of transactions for safex

        // http://omniexplorer.info/ask.aspx?api=gethistory&address=1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P
    }

    getSafexBalance(address) {
        //take in an address, return the balance for safex coins

        //  http://omniexplorer.info/ask.aspx?api=getbalance&prop=1&address=1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P
    }

    exploreAddress(e) {

    }


    render() {

        return (
            <div>
                <Navigation />
                <form onSubmit={this.exploreAddress}>
                    <label htmlFor="address"></label>
                    <input name="address"></input>
                    <button type="submit">explore</button>
                </form>
                <table>
                    {history}
                </table>

            </div>
        );
    }
}