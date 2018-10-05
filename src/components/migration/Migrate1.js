import React from 'react';


//Initiate the Migration Process
export default class Migrate1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };

    }


    componentDidMount() {
        this.setState({
            loading: false
        });
    }


    render() {
        return (
            <div>

                <p>Step 1/4</p>
                <p>In this phase you will go through the steps in order to migrate
                    your safe exchange coins from the bitcoin blockchain to the safex blockchain.
                    This process is irreversible and you should do so acknowledging that any
                    mistakes made during this process can and definitely may result in total loss
                    of your Safe Exchange Coins and also your Safex Tokens and Safex Cash Airdrop.
                    Proceed with absolute care, and follow the procedures carefully. Please do consult the
                    https://safe.exchange
                    forum if you have any questions. You can email the Safex Team directly if something is unclear.
                    There will be fees involved that go to the Bitcoin Network in order to facilitate the transactions;
                    These are not provided by the Safex Team and no one but yourself is obligated to have the necessary
                    Bitcoin Fees covered on your own.
                    This procedure will last only for 1 year, until Block 1,000,000, after this time no
                    Safe Exchnage Coins will be transferable. And any Airdrop will be absorbed by the Safex
                    Developers.</p>
                <button onClick={() => {
                    this.props.setMigrationProgress(1)
                }}>Proceed
                </button>
                <button onClick={() => {
                    this.props.setMigrationVisible()
                }}>Cancel
                </button>
            </div>
        )
    }
}