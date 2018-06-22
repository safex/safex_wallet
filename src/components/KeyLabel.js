import React from "react";

var fs = window.require('fs');
var os = window.require('os');
var bs58 = require('bs58');
import {decrypt, encrypt} from "../utils/utils";

export default class KeyLabel extends React.Component {
    constructor(props) {
        super(props);
        this.ENTER_KEY = 13;
        this.state = {
            editText: props.keyLabel || "",
            editing: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
    }

    handleChange(e) {
        this.setState({ editText: e.target.value });
    }

    toggleEditing() {
        this.setState({ editing: !this.state.editing });
        if (this.state.editing) {
            setTimeout(() => {
                this.editLabel.focus();
            }, 100);
        }
    }

    handleSubmit() {
        var val = this.state.editText.trim();
        var currentVal = this.props.keyLabel;
        var keyReference = this.props.keyReference;

        if (val) {
            this.setState({
                editText: val,
                editing: false
            });
        }
        this.props.editLabel(val, this.props.keyReference);

        fs.readFile(localStorage.getItem("wallet_path"), {encoding: "utf8"}, function(err, wallet){
            if(err){
                console.log(err)
            }

            var crypto = require('crypto'),
                algorithm = 'aes-256-ctr',
                password = localStorage.getItem("password");

            //decrypt the wallet
            var decrypted_wallet = decrypt(wallet.toString(), algorithm, password);

            try {
                var parse_wallet = JSON.parse(decrypted_wallet);
                var wallet_keys = parse_wallet['keys'];

                var filterLabel = wallet_keys.find(x => x.label === currentVal);

                filterLabel.label = val;

                var index = wallet_keys.indexOf(0);

                if (index !== -1) {
                    wallet_keys[index] = filterLabel;
                }

                var encrypted_wallet = encrypt(JSON.stringify(parse_wallet), algorithm, password);

                //write the new file to the path
                fs.writeFile(localStorage.getItem('wallet_path'), encrypted_wallet, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        localStorage.setItem('wallet', JSON.stringify(parse_wallet));
                    }
                });

            } catch (e) {
                console.log(e)
            }
        })
    }

    handleKeyDown(e) {
        if (event.which === this.ENTER_KEY) {
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <div>
                <button
                    className="edit-label-btn"
                    // onClick={this.toggleEditing}
                    disabled
                    title="Click to edit Key Label (Under development)">
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