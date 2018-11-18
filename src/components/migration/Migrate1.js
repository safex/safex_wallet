import React from "react";
const { shell } = window.require('electron')

//Initiate the Migration Process
export default class Migrate1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };

        this.externalLink = this.externalLink.bind(this);
    }

    componentDidMount() {
        this.setState({
            loading: false
        });
    }

    externalLink() {
        shell.openExternal('https://safe.exchange/')
    }

    render() {
        return (
            <div className="step-one">
                <p>Step 1/4 - Understanding</p>
                <p>
                    In this phase you will go through the steps in order to migrate your
                    <input type="text" className="red-input" defaultValue="Safe Exchange Coins" readOnly /> from the Bitcoin blockchain to the Safex
                    blockchain.
                </p>
                <p>
                    In return you will receive <input type="text" className="blue-input" defaultValue="an equal amount" readOnly />  of &nbsp;
                    <input type="text" className="blue-input" defaultValue="Safex Tokens (SFT)" readOnly />
                </p>
                <p>
                    Additionally, you
                    will receive <input type="text" className="blue-input" defaultValue="~0.0023 Safex Cash " readOnly />
                    <input type="text" className="blue-input" defaultValue="Safex Cash (SFX)" readOnly /> &nbsp;
                     for each Token you migrated in this process.
                </p>
                <p>
                    This process is irreversible and you should do so acknowledging that
                    any mistakes made during this process can and definitely may result in
                    total loss of your Safe Exchange Coins and also your Safex Tokens and
                    Safex Cash Airdrop. Proceed with absolute care, and follow the
                    procedures carefully.
                </p>
                <p>
                    Please do consult the <a onClick={this.externalLink}>https://safe.exchange</a> forum if you have any
                    questions. You can email the Safex Team directly <a>team@safex.io.</a>
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
                    className="button-shine green-btn"
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
