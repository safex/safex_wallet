import React from "react";

export default class KeyLabel extends React.Component {
    constructor(props) {
        super(props);
        this.ENTER_KEY = 13;
        this.state = {
            editText: props.keyLabel || "",
            editing: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
    }

    toggleEditing() {
        this.setState({ editing: !this.state.editing });
        if (this.state.editing) {
            setTimeout(() => {
                this.editLabel.focus();
            }, 100);
        }
    }

    handleChange(e) {
        this.setState({ editText: e.target.value });
    }

    handleSubmit(e) {
        var val = this.state.editText.trim();
        if (val) {
            this.setState({
                editText: val,
                editing: false
            });
        }
        this.props.editLabel(val, this.props.keyReference);
    }

    handleKeyDown(e) {
        if (event.which === this.ENTER_KEY) {
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <div>
                <button className="edit-label-btn" onClick={this.toggleEditing} title="Click to edit Key Label">
                    <img
                        src="images/edit.png"
                        alt="Edit Logo"
                        style={{ opacity: this.state.editing ? 1 : 0.5 }}
                    />
                </button>
                <input
                    ref={el => (this.editLabel = el)}
                    disabled={!this.state.editing}
                    className="key-label"
                    value={this.state.editText}
                    onChange={this.handleChange}
                    onBlur={this.handleSubmit}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        );
    }
}