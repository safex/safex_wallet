import React from "react";

// var fs = window.require('fs');
// var os = window.require('os');
// var bs58 = require('bs58');
// import {decrypt, encrypt} from "../utils/utils";

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

    handleSubmit() {
        var val = this.state.editText.trim();
        if (val) {
            this.setState({
                editText: val,
                editing: false
            });
        }
        this.props.editLabel(val, this.props.keyReference);

        // fs.readFile(localStorage.getItem('wallet_path'), (err, fd) => {
        //     var crypto = require('crypto'),
        //         algorithm = 'aes-256-ctr',
        //         label = this.state.editText;
        //
        //     var wallet = localStorage.getItem('wallet_path');
        //
        //     try {
        //         var parse_wallet = JSON.parse(wallet);
        //
        //         if (parse_wallet['version'] === '1') {
        //
        //             fs.writeFile(localStorage.getItem('wallet_path'), parse_wallet, (err) => {
        //                 if (err) {
        //                     console.log(err)
        //                 } else {
        //                     localStorage.setItem('wallet', wallet);
        //                 }
        //             });
        //         }
        //     } catch (e) {
        //         console.log(e)
        //     }
        // });

        // var wallet = localStorage.getItem('wallet');
        // var parse_wallet = JSON.parse(wallet);
        // var key_reference = this.props.keyReference.label;
        // key_reference = val;
        //
        // console.log(key_reference)
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