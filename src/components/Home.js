import React from 'react';

export default class Home extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoading: true,
            walletExists: false,
            walletData: '',
            errorWalletData: false,
        };
    }

    render() {
        return (
            <div>
                <div className="App-intro">
                    Initial Page
                </div>

            </div>
        );
    }


}