import React from "react";

export default class HistoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.historyOverflowActive
                ? 'overflow historyModal fadeIn active'
                : 'overflow historyModal'}>
                <div className="col-xs-12 history-inner">
                    <div className="container">
                        <h3>History <span className="close" onClick={this.props.closeHistoryModal}>X</span></h3>
                    </div>
                    <div id="history_txs">
                        <h5>Loading...</h5>
                    </div>
                </div>
            </div>
        );
    }
}

