import React from "react";

export default class SafexAddress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      wif: ""
    };
  }

  componentDidMount() {
    this.addData(this.props.data.one);
  }

  addData = string => {
    var add_this = "hello";
    var final_string = string + " " + add_this;
    this.setState({ address: final_string });
  };

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
    );
  }
}
