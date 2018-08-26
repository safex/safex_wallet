import React from "react";

export default class AffiliateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.affiliateActive ? "affiliate-wrap active" : "affiliate-wrap"}>
                {
                    this.props.affiliateActive
                    ?
                        <form className="container">
                            <div className="head">
                                <img src="images/affiliate-logo.png" alt="Transfer Icon"/>
                                <h3>
                                    Affiliate<br />
                                    System
                                </h3>
                                <span className="close" onClick={this.props.closeAffiliateModal}>X</span>
                            </div>
                        </form>
                    :
                        <div></div>
                }
            </div>
        );
    }
}