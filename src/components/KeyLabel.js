import React from 'react';

export default class KeyLabel extends React.Component {

    constructor(props) {
        super();
        this.ESCAPE_KEY = 27;
        this.ENTER_KEY = 13;
        this.state = {
            editText: props.name,
            editing: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleChange.bind(this);
        this.handleKeyDown = this.handleChange.bind(this);
    }

    handleChange (e) {
        this.setState({editText: e.target.value});
    }

    handleSubmit (e) {
        var val = this.state.editText.trim();
        if (val) {
            this.setState({
                editText: val,
                editing: false,
            });
        }
    }

    handleKeyDown (e) {
        if (event.which === this.ESCAPE_KEY) {
            this.setState({
                editText: this.props.name,
                editing: false
            });
        } else if (event.which === this.ENTER_KEY) {
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <div>
                <button className="edit-label-btn">
                    <img src="images/edit.png" alt="Edit Logo"/>
                </button>
                <input
                    className="key-label"
                    placeholder="Label"
                    value={this.state.editText}
                    onChange={this.handleChange}
                    onBlur={this.handleSubmit}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        );
    }
}
