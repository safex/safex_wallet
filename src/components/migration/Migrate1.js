import React from "react";

//Initiate the Migration Process
export default class Migrate1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
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
                <p>Step 1/4 - Understanding</p>
                <p>
                    In this phase you will go through the steps in order to migrate your
                    Safe Exchange Coins from the Bitcoin blockchain to the Safex
                    blockchain.
                </p>
                <p>
                    In return you will receive an equal amount of Safex Tokens (SFT). Additionally, you
                    will receive ~0.0023 Safex Cash (SFX) for each Token you migrated in this process.
                </p>
                <p>
                    This process is irreversible and you should do so acknowledging that
                    any mistakes made during this process can and definitely may result in
                    total loss of your Safe Exchange Coins and also your Safex Tokens and
                    Safex Cash Airdrop. Proceed with absolute care, and follow the
                    procedures carefully.
                </p>
                <p>
                    Please do consult the https://safe.exchange forum if you have any
                    questions. You can email the Safex Team directly team@safex.io.
                    There will be fees involved that go to the Bitcoin Network in
                    order to facilitate the transactions; These are not provided by the
                    Safex Team and no one but yourself is obligated to have the necessary
                    Bitcoin Fees covered on your own.
                </p>
                <p>
                    This procedure will last only for 1 year, until Block 260,000 - after
                    this time no Safe Exchnage Coins will be accepted for migration. Any unclaimed SFX Airdrop
                    will be absorbed by the Safex Developers.
                </p>

                <button
                    className="button-shine"
                    onClick={() => {
                        this.props.setMigrationProgress(1);
                    }}
                >
                    I Understand -> Proceed
                </button>
            </div>
        );
    }
}
