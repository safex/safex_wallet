import React from 'react';

export default class SafexAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: "",
            wif: "",
        };
    }

    componentDidMount() {
        this.addData(this.props.data.one);
    }

    addData(string) {
        this.setState({address: string});
    }

    //get balances
    /*

      Here we just generate and store addresses and key pairs for Safex Blockchain
      Get balances etc;

     */


    render() {
        return (
            <div>
                <p>{this.state.address}</p>
            </div>
        )
    }
}