import React from 'react';
import axios from 'axios';

const fileDownload = require('react-file-download');
const fs = window.require('fs');
const os = window.require('os');
const bitcoin = window.require('bitcoinjs-lib');
const bitcore = window.require('bitcore-lib');
import QRCode from 'qrcode.react';

import {encrypt, safexPayload} from '../../utils/utils';
import {genkey} from '../../utils/keys';
import {
    downloadWallet,
    loadAndDecryptWalletFromFile,
    flashField,
    openMainAlert,
    coinModalOpenSettings,
    coinModalClosedSettings
} from '../../utils/wallet';

import Navigation from '../Navigation';
import KeyLabel from "../KeyLabel";
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class Wallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //wallet state
            keys: [],
            wallet: {},
            import_key: '',
            archive_active: false,

            //transaction
            send_coin: 'safex',
            send_amount: 1,
            send_fee: 0.0001,
            send_total: 1,
            send_overflow_active: false,
            history_overflow_active: false,
            history_key: '',
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },
            transaction_being_sent: false,
            transaction_sent: false,
            txid: "",
            average_fee: 0,
            active_fee: 'fast',
            safex_price: 0,
            btc_price: 0,
            fee_in_btc: true,

            //Dividend calculator
            totalTradeVolume: 500000000,
            marketplaceFee: 5,
            marketplaceEarnings: 0,
            safexMarketCap: 0,
            safexDividendYield: 0,
            safexDividendInfo: false,
            safexHoldingsInfo: false,
            safexHolding: 100000,
            holdingsByMarket: 0,
            holdingsYield: 0,
            safexPrice: 0,
            selectedAmount: 0,
            safexQuantity: 0,

            //UI state
            btc_sync: false,
            safex_sync: false,
            is_loading: false,
            loging_out: false,
            receive_amount: 0.00000001.toFixed(8),
            collapse_open: {
                key: '',
                receive_open: false,
                send_open: false
            },
            private_key_open: {
                key: '',
                display_private_key: '',
                private_key_popup: false,
            },
            send_disabled: false,
            sidebar_open: false,
            settings_active: false,
            refreshTimer: 0,
            refreshInterval: '',
            status_text: 'Loading...',
            dividend_active: false,
            affiliate_active: false,
            import_wrap_glow: false,
            wrongOldPassword: false,
            wrongNewPassword: false,
            wrongRepeatPassword: false,
            transfer_key_to_archive: false,
            transfer_key_to_home: false,
            info_popup: false,
            info_text: '',
            send_receive_popup: false,
            send_receive_info: '',
            main_alert_popup: false,
            main_alert_popup_text: '',
            export_unencrypted_wallet: false,
            export_encrypted_wallet: false,
            create_key_active: false,
            import_modal_active: false,
            savedLabel: '',
            value: '',
            copied: false,
        };

        this.createKey = this.createKey.bind(this);
        this.importKey = this.importKey.bind(this);
        this.importKeyChange = this.importKeyChange.bind(this);
        this.sendCoins = this.sendCoins.bind(this);
        this.prepareDisplay = this.prepareDisplay.bind(this);
        this.prepareDisplayPendingTx = this.prepareDisplayPendingTx.bind(this);
        this.openCoinModal = this.openCoinModal.bind(this);
        this.closeCoinModal = this.closeCoinModal.bind(this);
        this.setCoinModalOpenSettings = this.setCoinModalOpenSettings.bind(this);
        this.setCoinModalClosedSettings = this.setCoinModalClosedSettings.bind(this);
        this.openHistoryModal = this.openHistoryModal.bind(this);
        this.showPrivateModal = this.showPrivateModal.bind(this);
        this.closePrivateModal = this.closePrivateModal.bind(this);
        this.closeHistoryModal = this.closeHistoryModal.bind(this);
        this.sendAmountOnChange = this.sendAmountOnChange.bind(this);
        this.sendFeeOnChange = this.sendFeeOnChange.bind(this);
        this.sendTotalAdjustCoinChange = this.sendTotalAdjustCoinChange.bind(this);
        this.closeSuccessModal = this.closeSuccessModal.bind(this);
        this.openDividendModal = this.openDividendModal.bind(this);
        this.closeDividendModal = this.closeDividendModal.bind(this);
        this.openAffiliateModal = this.openAffiliateModal.bind(this);
        this.closeAffiliateModal = this.closeAffiliateModal.bind(this);
        this.closeSendReceiveModal = this.closeSendReceiveModal.bind(this);

        this.openExportUnencryptedWalletPopup = this.openExportUnencryptedWalletPopup.bind(this);
        this.exportUnencryptedWallet = this.exportUnencryptedWallet.bind(this);
        this.openExportEncryptedWallet = this.openExportEncryptedWallet.bind(this);
        this.exportEncryptedWallet = this.exportEncryptedWallet.bind(this);
        this.getFee = this.getFee.bind(this);
        this.refreshWallet = this.refreshWallet.bind(this);
        this.feeChange = this.feeChange.bind(this);
        this.openSettingsModal = this.openSettingsModal.bind(this);
        this.closeSettingsModal = this.closeSettingsModal.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.logout = this.logout.bind(this);
        this.listTransactions = this.listTransactions.bind(this);
        this.sendToArchive = this.sendToArchive.bind(this);
        this.setArchiveView = this.setArchiveView.bind(this);
        this.setHomeView = this.setHomeView.bind(this);
        this.removeFromArchive = this.removeFromArchive.bind(this);
        this.importGlow = this.importGlow.bind(this);
        this.importGlowDeactivate = this.importGlowDeactivate.bind(this);
        this.wrongOldPassword = this.wrongOldPassword.bind(this);
        this.wrongNewPassword = this.wrongNewPassword.bind(this);
        this.wrongRepeatPassword = this.wrongRepeatPassword.bind(this);
        this.closeSettingsInfoPopup = this.closeSettingsInfoPopup.bind(this);
        this.resetSettingsForm = this.resetSettingsForm.bind(this);
        this.closeSendReceivePopup = this.closeSendReceivePopup.bind(this);
        this.closeMainAlertPopup = this.closeMainAlertPopup.bind(this);
        this.openImportModal = this.openImportModal.bind(this);
        this.closeImportModal = this.closeImportModal.bind(this);
        this.saveLabel = this.saveLabel.bind(this);
        this.editLabel = this.editLabel.bind(this);
        this.openCreateKey = this.openCreateKey.bind(this);
        this.amountChange = this.amountChange.bind(this);
        this.convertBtcToDollars = this.convertBtcToDollars.bind(this);
    }

    logout() {
        localStorage.clear();
        this.setState({
            sidebar_open: false,
            // Close Settings Modal
            settings_active: false,

            // Close Send Receive Modal
            collapse_open: {
                send_open: false,
                receive_open: false
            },

            loging_out: true,
        });
        setTimeout(() => {
            this.context.router.push('/');
        }, 1500)
    }

    refreshWallet() {
        if (this.state.refreshTimer === 0) {
            this.prepareDisplay();
            let interval = setInterval(this.refreshWalletTimer, 1000);
            this.setState({
                refreshTimer: 23,
                refreshInterval: interval,
                copied: false,
            });
            this.prepareDisplayPendingTx();
        }
    }

    refreshWalletTimer = () => {
        if (this.state.refreshTimer > 0) {
            this.setState({refreshTimer: this.state.refreshTimer - 1});
        }
        else {
            clearInterval(this.state.refreshInterval);
        }
    };

    componentWillMount() {
        axios({method: 'post', url: 'https://safex.io/api/price/'}).then(res => {

            var safex_price = parseFloat(res.data.price_usd);
            var safex_dividend = (parseFloat(this.state.totalTradeVolume) *
                (parseFloat(this.state.marketplaceFee) / 100) /
                parseFloat(safex_price * 2147483647)) * 100;

            var dividend_yield = (safex_price * 100000 * (safex_dividend / 100)).toFixed(2);
            var holdings_market = safex_price * 100000;

            this.setState({
                holdingsYield: dividend_yield,
                holdingsByMarket: holdings_market.toFixed(2),
                safexPrice: safex_price,
                safexMarketCap: (safex_price * 2147483647).toFixed(0),
                safexDividendYield: safex_dividend.toFixed(2)
            });
        }).catch(function (error) {
            console.log(error);
        });

        axios({method: 'get', url: 'https://api.coinmarketcap.com/v1/ticker/safe-exchange-coin/'}).then(res => {
            var total_supply = res.data[0].total_supply;

            this.setState({
                safexQuantity: total_supply
            });
        }).catch(function(error) {
            console.log(error);
        });

        try {
            const json = JSON.parse(localStorage.getItem('wallet'));
            this.setState({wallet: json, keys: json['keys']});
        } catch (e) {
            this.setState({
                status_text: 'Failed to parse wallet'
            });
            this.context.router.push('/');
        }
    }

    componentDidMount() {
        this.refreshWallet();
        this.getFee();

        this.refreshWalletInterval = setInterval(() => {
            var i;
            for(i=0; i<5; i++) {
                this.prepareDisplay();
                this.prepareDisplayPendingTx();
                console.log('Page refreshed');
            }
        }, 1800000);

        // this.prepareDisplayInterval = setInterval(() => {
        //     this.prepareDisplay();
        //     this.prepareDisplayPendingTx();
        //     console.log('Timer')
        // }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    getFee() {
        fetch('http://omni.safex.io:3001/getfee')
            .then(resp => resp.text())
            .then((resp) => {
                this.setState({average_fee: resp, send_fee: resp});
            })
            .catch(e => {
                this.setState({
                    btc_sync: false,
                    safex_sync: false,
                    status_text: 'Sync error, please refresh'
                });
                this.openMainAlertPopup('Unable to fetch average fee');
            });
    }

    prepareDisplayPendingTx(keys = null) {
        var promises = [];
        if (keys === null) {
            keys = this.state.keys.slice();
        }

        if (!Array.isArray(keys)) {
            keys = [keys]
        }

        keys.forEach((key) => {
            var json = {};
            json['address'] = key.public_key;
            promises.push(fetch('http://omni.safex.io:3001/unconfirmed', {
                method: "POST",
                body: JSON.stringify(json)
            })
                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
        });

        Promise.all(promises).then(values => {
            var iteration = 0;
            for (var x = 0; x < values.length; x++) {
                var currentIndex = this.state.keys.findIndex(i => i.public_key === keys[iteration]['public_key']);
                this.state.keys[currentIndex].pending_safex_bal = values[iteration];
                iteration += 1;
            }
        });
    }

    prepareDisplay(keys = null) {
        var promises = [];
        if (keys === null) {
            keys = this.state.keys.slice();
        }

        if (!Array.isArray(keys)) {
            keys = [keys]
        }

        keys.forEach((key) => {
            var json = {};
            json['address'] = key.public_key;
            promises.push(fetch('http://omni.safex.io:3001/balance', {
                method: "POST",
                body: JSON.stringify(json)
            })

                .then(resp => resp.json())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + key.public_key + '/balance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
            promises.push(fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + key.public_key + '/unconfirmedBalance')
                .then(resp => resp.text())
                .then((resp) => {
                    return resp
                }));
        });
        Promise.all(promises).then(values => {
            var internal_index = 0;
            var iteration = 0;
            for (var x = 0; x < values.length; x++) {
                var currentIndex = this.state.keys.findIndex(i => i.public_key === keys[internal_index]['public_key']);
                if (iteration === 0) {
                    this.state.keys[currentIndex].safex_bal = values[x].balance;
                    iteration += 1;
                } else if (iteration === 1) {
                    this.state.keys[currentIndex].btc_bal = (values[x] / 100000000).toFixed(8);
                    iteration += 1;
                } else if (iteration === 2) {
                    this.state.keys[currentIndex].pending_btc_bal = (values[x] / 100000000).toFixed(8);
                    iteration = 0;
                    internal_index += 1;
                }
            }
            this.setState({
                keys: this.state.keys,
                btc_sync: true,
                safex_sync: true,
                status_text: 'Synchronized',
                safex_price: localStorage.getItem('safex_price'),
                btc_price: localStorage.getItem('btc_price'),
            });
        }).catch(e => {
            console.log(e)
            this.setState({
                btc_sync: false,
                safex_sync: false,
                status_text: 'Sync error, please refresh'
            });
        });
    }

    formBitcoinTransaction(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;
        var pending_safex_bal = document.getElementById('pending_safex_bal').value;
        var pending_btc_bal = document.getElementById('pending_btc_bal').value;

        utxos.forEach(txn => {
            if (!txn.confirmations > 0) {

            } else {

                if (running_total < (amount + fee)) {
                    running_total += txn.satoshis;
                    tx.addInput(txn.txid, txn.vout);
                    inputs_num += 1;
                }
            }
        });

        tx.addOutput(destination, amount);

        if ((running_total - (amount + fee)) > 0) {
            tx.addOutput(source, (running_total - (amount + fee)));
        }
        for (var i = 0; i < inputs_num; i++) {
            tx.sign(i, key);
        }

        var json = {};
        json['rawtx'] = tx.build().toHex();
        fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
            .then(resp => resp.text())
            .then((resp) => {
                if (resp === "") {
                    this.setCoinModalOpenSettings('There was an error with the transaction');
                    this.closeMainAlertPopup();
                    this.setState({
                        send_disabled: false,
                    });
                    setTimeout(() => {
                        this.setState({
                            transaction_being_sent: false,
                        });
                    }, 500);
                    throw "There was an error with the transaction.";
                }
                this.setState({
                    sidebar_open: true,
                    transaction_sent: true,
                    transaction_being_sent: false,
                    send_disabled: true,
                    txid: resp,

                    // Close main alert popup
                    main_alert_popup: false,
                    main_alert_popup_text: '',
                });
                if (pending_safex_bal >= 0 || pending_btc_bal >= 0) {
                    this.prepareDisplayInterval = setInterval(() => {
                        this.prepareDisplay();
                        this.prepareDisplayPendingTx();
                        this.setState({
                            send_disabled: true,
                        });
                        console.log('refresh');
                    }, 200);
                    this.closeSendReceiveModal();
                } else {
                    clearInterval(this.prepareDisplayInterval);
                }
                setTimeout(() => {
                    clearInterval(this.prepareDisplayInterval);
                    this.prepareDisplay();
                    this.prepareDisplayPendingTx();
                    console.log('clear refresh');
                    this.setState({
                        send_disabled: false,
                    });
                }, 4000);
            });
    }

    formSafexTransaction(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;
        var check = 0;
        var checks = [source, destination];
        var pending_safex_bal = document.getElementById('pending_safex_bal').value;
        var pending_btc_bal = document.getElementById('pending_btc_bal').value;

        utxos.forEach(txn => {
            if (running_total < (700 + fee)) {
                running_total += txn.satoshis;
                tx.addInput(txn.txid, txn.vout);
                inputs_num += 1;
            }
        });
        tx.addOutput(destination, 700);

        if ((running_total - (700 + fee)) > 0) {
            tx.addOutput(source, (running_total - (700 + fee)));
        } else {
            check++; // no need check for source
            checks = [destination];
        }

        var SafexTransaction = {};
        SafexTransaction['incomplete_tx'] = tx.buildIncomplete().toHex();
        SafexTransaction['amount'] = amount;
        fetch('http://omni.safex.io:3001/getsafextxn', {method: "POST", body: JSON.stringify(SafexTransaction)})
            .then(resp => resp.text())
            .then((resp) => {
                var decoded_txn = bitcoin.Transaction.fromHex(resp);
                var txn = bitcoin.TransactionBuilder.fromTransaction(decoded_txn);
                checks.forEach(function(item) {
                    txn.tx.outs.some(out => {
                        try {
                            var pubkey = bitcoin.address.fromOutputScript(out.script, bitcoin.networks.livenet);
                        } catch (e) {
                            console.log(e);
                        }
                        if (pubkey === item) {
                            check += 1;
                            return;
                        }
                    });
                });

                if (check === 2) {
                    for (var i = 0; i < inputs_num; i++) {
                        txn.sign(i, key);
                    }
                    var json = {};
                    json['rawtx'] = txn.build().toHex();
                    fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
                        .then(resp => resp.text())
                        .then((resp) => {
                            if (resp === "") {
                                this.setCoinModalOpenSettings('There was an error with the transaction');
                                this.closeMainAlertPopup();
                                this.setState({
                                    send_disabled: false,
                                });
                                setTimeout(() => {
                                    this.setState({
                                        transaction_being_sent: false,
                                    });
                                }, 500);
                                throw "There was an error with the transaction.";
                            }
                            this.setState({
                                sidebar_open: true,
                                transaction_sent: true,
                                transaction_being_sent: false,
                                send_disabled: true,
                                txid: resp,

                                // Close main alert popup
                                main_alert_popup: false,
                                main_alert_popup_text: '',
                            });
                            if (pending_safex_bal >= 0 || pending_btc_bal >= 0) {
                                this.prepareDisplayInterval = setInterval(() => {
                                    this.prepareDisplay();
                                    this.prepareDisplayPendingTx();
                                    this.setState({
                                        send_disabled: true,
                                    });
                                    console.log('refresh');
                                }, 200);
                                this.closeSendReceiveModal();
                            } else {
                                clearInterval(this.prepareDisplayInterval);
                            }
                            setTimeout(() => {
                                clearInterval(this.prepareDisplayInterval);
                                this.prepareDisplay();
                                this.prepareDisplayPendingTx();
                                this.setState({
                                    send_disabled: false,
                                });
                                console.log('clear refresh');
                            }, 4000);
                        })
                } else {
                    if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                        this.setCoinModalOpenSettings('Error with transaction');
                    } else {
                        this.setCoinModalClosedSettings('Error with transaction');
                    }
                    this.setState({
                        sidebar_open: true,
                        transaction_being_sent: false,
                    });
                }
            });
    }

    //TODO: needs more testing - safex not sent
    formSafexTransactionBeta(utxos, amount, fee, destination, key, source) {
        var running_total = 0;
        var tx = new bitcoin.TransactionBuilder();
        var inputs_num = 0;

        // here we list btc tx from our wallet, remove 700sats, put back (the rest - fee) to ourself
        utxos.forEach(txn => {
            if (running_total < (700 + fee)) {
                running_total += txn.satoshis;
                tx.addInput(txn.txid, txn.vout);
                inputs_num += 1;
            }
        });
        tx.addOutput(destination, 700);

        var btc_remaining = (running_total - (700 + fee));
        if (btc_remaining > 0) {
            tx.addOutput(source, btc_remaining);
        }

        var btc = require('bitcoinjs-lib');
        if (amount <= 0.1) {
            this.openMainAlertPopup('Transaction not processed - Amount is too low.');
            return;
        }

        // payload omni tx
        var data = new Buffer("0000000000000056" + String("0000000000000000" + amount).slice(-16));
        var dataScript = btc.script.nullData.output.encode(data);
        tx.addOutput(dataScript, 1000)

        for (var i = 0; i < inputs_num; i++) {
            tx.sign(i, key);
        }
        var json = {};
        json['rawtx'] = tx.build().toHex();
        fetch('http://omni.safex.io:3001/broadcast', {method: "POST", body: JSON.stringify(json)})
            .then(resp => resp.text())
            .then((resp) => {
                this.setState({
                    sidebar_open: true,
                    transaction_sent: true,
                    transaction_being_sent: false,
                    txid: resp,

                    // Close main alert popup
                    main_alert_popup: false,
                    main_alert_popup_text: '',

                    // Close Send Receive Modal
                    collapse_open: {
                        send_open: false,
                        receive_open: false
                    },
                });
                this.prepareDisplay();
                this.prepareDisplayPendingTx();
                this.closeSendReceiveModal();
            });
    }

    sendCoins(e) {
        e.preventDefault();
        //check whether Bitcoin or Safex is selected
        if (this.state.send_coin === 'safex') {
            if (this.state.fee_in_btc) {
                //open the modal by setting transaction_being_sent
                try {
                    this.setState({
                        sidebar_open: true,
                        transaction_being_sent: true,
                        settings_active: false,
                        send_disabled: true,
                        main_alert_popup: true,
                        main_alert_popup_text: 'Sending...',
                    });

                    //set the signing key for the transaction
                    var keys = bitcoin.ECPair.fromWIF(e.target.private_key.value);
                    //set the source of the transaction
                    var source = e.target.public_key.value;
                    //set the amount provided by the user
                    var amount = e.target.amount.value;
                    //set the fee provided by the user
                    var fee = e.target.fee.value;
                    //set the destination provided by the user
                    var destination = e.target.destination.value;

                    //here we will check to make sure that the destination is a valid bitcoin address
                    var address = bitcore.Address.fromString(destination);
                    var address2 = bitcore.Address.fromString(source);

                    //here we try to get the unspent transactions from the source we send from
                    try {
                        fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                            .then(resp => resp.json())
                            .then((resp) => {
                                //enter into the safex transaction method
                                this.formSafexTransaction(resp,
                                    amount,
                                    parseFloat((fee * 100000000).toFixed(0)),
                                    destination,
                                    keys,
                                    source);
                            });
                    } catch (e) {
                        //if the fetch fails then we have a network problem and can't get unspent transaction history
                        if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                            this.setCoinModalOpenSettings('Network communication error, please try again later');
                        } else {
                            this.setCoinModalClosedSettings('Network communication error, please try again later');
                        }
                        throw 'Network communication error, please try again later';
                    }
                } catch (e) {
                    //this is triggered if the destination address is not a valid bitcoin address
                    if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                        this.setCoinModalOpenSettings('Invalid destination address');
                    } else {
                        this.setCoinModalClosedSettings('Invalid destination address');
                    }
                    throw 'Invalid destination address';
                }
            } else {
                this.setCoinModalOpenSettings('Please convert the transaction to BTC to proceed');
            }
            //if safex is not selected then it must be Bitcoin
        } else if(this.state.send_coin === 'btc') {
            if (this.state.fee_in_btc) {
                try {  //open the modal by setting transaction_being_sent
                    this.setState({
                        sidebar_open: true,
                        transaction_being_sent: true,
                        settings_active: false,
                        send_disabled: true,
                        main_alert_popup: true,
                        main_alert_popup_text: 'Sending...',
                    });

                    //set the signing key for the transaction
                    var keys = bitcoin.ECPair.fromWIF(e.target.private_key.value);
                    //set the source of the transaction
                    var source = e.target.public_key.value;
                    //set the amount provided by the user
                    var amount = e.target.amount.value;
                    //set the fee provided by the user
                    var fee = e.target.fee.value;
                    //set the destination provided by the user
                    var destination = e.target.destination.value;

                    //here we will check to make sure that the destination is a valid bitcoin address

                    var address = bitcore.Address.fromString(destination);
                    var address2 = bitcore.Address.fromString(source);
                    //here we try to get the unspent transactions from the source we send from
                    try {
                        fetch('http://bitcoin.safex.io:3001/insight-api/addr/' + e.target.public_key.value + '/utxo')
                            .then(resp => resp.json())
                            .then((resp) => {
                                //enter into the bitcoin transaction method
                                this.formBitcoinTransaction(resp,
                                    parseFloat((amount * 100000000).toFixed(0)),
                                    parseFloat((fee * 100000000).toFixed(0)),
                                    destination,
                                    keys,
                                    source);
                            });
                    } catch (e) {
                        //if the fetch fails then we have a network problem and can't get unspent transaction history
                        if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                            this.setCoinModalOpenSettings('Network communication error, please try again later');
                        } else {
                            this.setCoinModalClosedSettings('Network communication error, please try again later');
                        }
                        throw 'Network communication error, please try again later';
                    }
                } catch (e) {
                    //this is triggered if the destination address is not a valid bitcoin address
                    if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                        this.setCoinModalOpenSettings('Invalid destination address');
                    } else {
                        this.setCoinModalClosedSettings('Invalid destination address');
                    }
                    throw 'Invalid destination address';
                }
            } else {
                this.setCoinModalOpenSettings('Please convert the transaction to BTC to proceed');
            }
        }
    }

    //Activates send_overflow_active state which opens Modal screen displaying transaction pre-confirmation information
    openCoinModal(e) {
        e.preventDefault();
        var key_btc_bal = 0;
        var key_safex_bal = 0;
        var pending_safex_bal = 0;
        var pending_btc_bal = 0;

        this.state.keys.map(key => {
            if (key.public_key === e.target.public_key.value) {
                key_btc_bal = key.btc_bal;
                key_safex_bal = key.safex_bal;
                pending_safex_bal = key.pending_safex_bal;
                pending_btc_bal = key.pending_btc_bal;
            }
        });

        if ((this.state.send_coin === 'safex' && this.state.send_fee > key_btc_bal) || (this.state.send_coin === 'btc' && this.state.send_total > key_btc_bal)) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('You do not have enough BITCOIN to cover the fee');
            } else {
                this.setCoinModalClosedSettings('You do not have enough BITCOIN to cover the fee');
            }
        } else if (this.state.send_coin === 'safex' && this.state.send_amount > key_safex_bal) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('You do not have enough SAFEX to cover this transaction');
            } else {
                this.setCoinModalClosedSettings('You do not have enough SAFEX to cover this transaction');
            }
        } else if (this.state.send_coin === 'safex' && (this.state.send_amount === '' || this.state.send_amount === 0 || isNaN(this.state.send_amount))) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Invalid SAFEX amount');
            } else {
                this.setCoinModalClosedSettings('Invalid SAFEX amount');
            }
        } else if (this.state.send_coin === 'btc' && (this.state.send_amount === '' || parseFloat(this.state.send_amount) === 0 || isNaN(this.state.send_total))) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Invalid BITCOIN amount');
            } else {
                this.setCoinModalClosedSettings('Invalid BITCOIN amount');
            }
        } else if (this.state.send_coin === 'btc' && this.state.send_total > key_btc_bal) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('You do not have enough BITCOIN to cover this transaction');
            } else {
                this.setCoinModalClosedSettings('You do not have enough BITCOIN to cover this transaction');
            }
        } else if (e.target.destination.value === '') {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Destination field is empty');
            } else {
                this.setCoinModalClosedSettings('Destination field is empty');
            }
        } else if (e.target.destination.value === e.target.public_key.value) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Invalid sending address');
            } else {
                this.setCoinModalClosedSettings('Invalid sending address');
            }
        } else if (pending_safex_bal < 0 || pending_btc_bal < 0) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Cannot send transaction, this key has a pending minus. Please try again later.');
            } else {
                this.setCoinModalClosedSettings('Cannot send transaction, this key has a pending minus. Please try again later.');
            }
            this.closeCoinModal;
        } else if (this.state.fee_in_btc === false) {
            if (this.sidebar_open) {
                this.setCoinModalOpenSettings('Please convert the transaction to BTC to proceed');
            } else {
                this.setCoinModalClosedSettings('Please convert the transaction to BTC to proceed');
            }
        } else {
            try {
                bitcore.Address.fromString(e.target.destination.value);
                this.setState({
                    sidebar_open: true,
                    send_overflow_active: true,
                    send_to: e.target.destination.value,
                    send_keys: {
                        public_key: e.target.public_key.value,
                        private_key: e.target.private_key.value
                    },
                    settings_active: false,
                    dividend_active: false,
                    affiliate_active: false,
                    transaction_sent: false,
                    send_receive_popup: false,
                    send_receive_info: ''
                });
            } catch (e) {
                if (this.state.settings_active || this.state.affiliate_active || this.state.dividend_active) {
                    this.setCoinModalOpenSettings('Destination address is invalid');
                } else {
                    this.setCoinModalClosedSettings('Destination address is invalid');
                }
            }
        }
    }

    createKey(e) {
        e.preventDefault();
        this.setState({is_loading: true});

        var key_pair = genkey();

        var address = key_pair.getAddress();

        var key_json = {};
        key_json['public_key'] = address;
        key_json['private_key'] = key_pair.toWIF();
        key_json['safex_bal'] = 0;
        key_json['btc_bal'] = 0;
        key_json['pending_safex_bal'] = 0;
        key_json['pending_btc_bal'] = 0;
        key_json['archived'] = false;
        key_json['label'] = e.target.label.value || 'Enter your label here';

        try {
            var json = JSON.parse(localStorage.getItem('wallet'));
        } catch (e) {
            this.openMainAlertPopup('Error parsing the wallet data.');
        }

        json['keys'].push(key_json);

        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = localStorage.getItem('password');

        var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

        fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
            if (err) {
                this.openMainAlertPopup('Problem communicating to the wallet file.');
            } else {
                localStorage.setItem('wallet', JSON.stringify(json));
                try {
                    var json2 = JSON.parse(localStorage.getItem('wallet'));
                    this.setState({
                        wallet: json2,
                        keys: json2['keys'],
                        is_loading: false,
                        create_key_active: false,
                        history_overflow_active: false,
                        history_key: '',
                        private_key_open: {
                            private_key_popup: false,
                        }
                    });
                    this.prepareDisplay();
                    this.prepareDisplayPendingTx();
                    document.getElementById("label").value = '';
                } catch (e) {
                    this.setState({
                        create_key_active: false,
                    });
                    this.openMainAlertPopup('An error adding a key to the wallet. Please contact team@safex.io');
                }
            }
        });
    }

    importKeyChange(e) {
        this.setState({
            import_key: e.target.value
        });
    }

    openImportModal(e) {
        e.preventDefault();
        try{
            var key_pair = bitcoin.ECPair.fromWIF(e.target.key.value);
            var address = key_pair.getAddress();

            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
                var key_exists = false;

                if (key_exists === false) {
                    this.setState({
                        import_modal_active: true,

                        // Close Private Key Popup
                        private_key_open: {
                            private_key_popup: false,
                        },
                    });
                }

                for (var i = 0; i < json['keys'].length; i++) {
                    // look for the entry with a matching `code` value
                    if (json['keys'][i].public_key === address) {
                        this.setState({
                            history_overflow_active: false,
                            history_key: '',
                            import_modal_active: false,
                        });
                        this.openMainAlertPopup('Key exists');
                        console.log('Key exists');
                    }
                }
            } catch (e) {
                console.log(e);
            }
        } catch(e) {
            this.setState({
                history_overflow_active: false,
                history_key: '',
                import_modal_active: false,

                // Close Private Key Popup
                private_key_open: {
                    private_key_popup: false,
                },
            });
            this.openMainAlertPopup('Invalid private key');
        }
    }

    openCreateKey() {
        this.setState({
            history_overflow_active: false,
            history_key: '',
            create_key_active: true,

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },
        });
    }

    importKey(e) {
        e.preventDefault();
        try {
            var key_pair = bitcoin.ECPair.fromWIF(e.target.key.value);
            var address = key_pair.getAddress();

            var key_json = {};
            key_json['public_key'] = address;
            key_json['private_key'] = e.target.key.value;
            key_json['safex_bal'] = 0;
            key_json['btc_bal'] = 0;
            key_json['pending_safex_bal'] = 0;
            key_json['pending_btc_bal'] = 0;
            key_json['archived'] = false;
            key_json['label'] = e.target.label.value || 'Enter your label here';

            try {
                var json = JSON.parse(localStorage.getItem('wallet'));
                var key_exists = false;


                for (var i = 0; i < json['keys'].length; i++) {
                    // look for the entry with a matching `code` value
                    if (json['keys'][i].public_key === address) {
                        key_exists = true;
                    }
                }

                if (key_exists === false) {

                    json['keys'].push(key_json);

                    var crypto = require('crypto'),
                        algorithm = 'aes-256-ctr',
                        password = localStorage.getItem('password');

                    var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

                    fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            localStorage.setItem('wallet', JSON.stringify(json));
                            this.setState({
                                import_key: '',
                            })
                            try {
                                var json2 = JSON.parse(localStorage.getItem('wallet'));
                                this.setState({
                                    wallet: json2,
                                    keys: json2['keys'],
                                    is_loading: false,
                                    import_modal_active: false,

                                    // Close History Modal
                                    history_overflow_active: false,
                                    history_key: '',

                                    // Close Private Key Popup
                                    private_key_open: {
                                        private_key_popup: false,
                                    },
                                });
                                this.prepareDisplay();
                                this.prepareDisplayPendingTx();
                                document.getElementById("label").value = '';
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    });
                } else {
                    console.log('Key exists');
                }
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            this.setState({
                // Close Private Key Popup
                private_key_open: {
                    private_key_popup: false,
                },
            });
            this.openMainAlertPopup('Invalid private key');
        }
        this.setState({
            history_overflow_active: false,
            history_key: '',

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },
        });
    }

    closeImportModal() {
        this.setState({
            import_modal_active: false,
            create_key_active: false,
        })
    }

    importGlow() {
        this.setState({
            import_wrap_glow: true
        });
    }

    importGlowDeactivate() {
        this.setState({
            import_wrap_glow: false
        });
    }

    closeMainAlertPopup() {
        this.setState({
            main_alert_popup: false,
        });

        setTimeout(() => {
            this.setState({
                export_encrypted_wallet: false,
                export_unencrypted_wallet: false,
            });
        }, 300)
    }

    openExportEncryptedWallet() {
        this.setState({
            export_encrypted_wallet: true,
            export_unencrypted_wallet: false,

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },

            // Close settings alert popup
            info_popup: false,
        });
        this.openMainAlertPopup('This will create a file where you can see your private keys. It is a very sensitive file, please be responsible with it. This file is for importing. It is for showing you the private keys which you can bring into a new wallet. You import keys using the \'import key\' feature in another wallet. Press OK to proceed.');
    }

    exportEncryptedWallet() {
        return downloadWallet(localStorage.getItem('wallet_path'), err => {
            if (err) {
                this.openMainAlertPopup(err.message);
            }

            this.setState({
                main_alert_popup: false
            });

            setTimeout(() => {
                this.setState({
                    export_encrypted_wallet: false
                })
            }, 300);
        });
    }

    openExportUnencryptedWalletPopup() {
        this.setState({
            export_encrypted_wallet: false,
            export_unencrypted_wallet: true,

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },

            // Close settings alert popup
            info_popup: false,
        });
        this.openMainAlertPopup('This will create a file where you can see your private keys. It is a very sensitive file, please be responsible with it. This file is not for importing. It is for showing you the private keys which you can bring into a new wallet. You import keys using the \'import key\' feature in another wallet. Press OK to proceed.');
    }

    exportUnencryptedWallet() {
        var wallet_data = JSON.parse(localStorage.getItem('wallet'));
        var nice_keys = "";
        var keys = wallet_data['keys'];
        keys.map((key) => {
            nice_keys += "private key: " + key.private_key + '\n';
            nice_keys += "public key: " + key.public_key + '\n';
            nice_keys += '\n';
        });
        var date = Date.now();

        fileDownload(nice_keys, date + 'unsafex.txt');

        this.setState({
            main_alert_popup: false,
        });

        setTimeout(() => {
            this.setState({
                export_unencrypted_wallet: false,
            })
        }, 300);
    }

    amountChange = (receive_amount) => {
        this.setState({
            receive_amount: receive_amount.target.value
        });
    }

    //This function is connected to Send expansion button and receive expansion button
    openSendReceive(key, sendreceive) {
        if (sendreceive === 'send') {
            if (!this.state.collapse_open.send_open && this.state.collapse_open.key !== key || this.state.collapse_open.send_open && this.state.collapse_open.key !== key) {
                this.setState({
                    private_key_open: {
                        private_key_popup: false,
                    },
                    collapse_open: {
                        key: key,
                        send_open: true,
                        receive_open: false
                    },
                    send_public_key: this.state.keys[key].public_key,
                });
            }

            if (this.state.collapse_open.send_open && this.state.collapse_open.key === key) {
                this.setState({
                    collapse_open: {
                        key: key,
                        send_open: false,
                        receive_open: false
                    },
                    send_public_key: ''
                });
                if (this.state.send_overflow_active) {
                    this.closeCoinModal();
                }
            }

            if (!this.state.collapse_open.send_open && this.state.collapse_open.key === key) {
                this.setState({
                    private_key_open: {
                        private_key_popup: false,
                    },
                    collapse_open: {
                        key: key,
                        send_open: true,
                        receive_open: false
                    },
                    send_public_key: ''
                });
            }
        }
        if (sendreceive === 'receive') {
            if (!this.state.collapse_open.receive_open && this.state.collapse_open.key !== key || this.state.collapse_open.receive_open && this.state.collapse_open.key !== key) {
                this.setState({
                    private_key_open: {
                        private_key_popup: false,
                    },
                    collapse_open: {
                        key: key,
                        send_open: false,
                        receive_open: true
                    },
                    receive_amount: 0.00000001.toFixed(8),
                });
            }
            if (this.state.collapse_open.receive_open && this.state.collapse_open.key === key || !this.state.collapse_open.receive_open && this.state.collapse_open.key === key) {
                this.setState({
                    private_key_open: {
                        private_key_popup: false,
                    },
                    collapse_open: {
                        key: key,
                        send_open: false,
                        receive_open: !this.state.collapse_open.receive_open
                    },
                    send_receive_popup: false,
                    receive_amount: 0.00000001.toFixed(8),
                });
                if (this.state.send_overflow_active) {
                    this.closeCoinModal();
                }
            }
        }
        this.setState({
            // Close Send Receive Popup
            send_receive_popup: false,
            send_receive_info: ''
        });
    }

    showPrivateModal(e) {
        this.setState({
            private_key_open: {
                private_key_popup: true,
                display_private_key: this.state.keys[e].private_key,
                current_public_key: this.state.keys[e].public_key
            },

            // Close Send Receive Modal
            collapse_open: {
                send_open: false,
                receive_open: false
            },

            // Close Send Receive Popup
            send_receive_popup: false,
            send_receive_info: ''
        });
    }

    closePrivateModal(){
        this.setState({
            private_key_open: {
                private_key_popup: false,
            }
        });
    }

    openHistoryModal(e) {
        document.getElementById("history_txs").innerHTML = "<h5>Loading...</h5>";
        this.setState({
            sidebar_open: false,
            history_overflow_active: true,

            // Close Success Modal
            transaction_sent: false,

            // Close Coin Modal
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },

            // Close Send Receive Modal
            collapse_open: {
                send_open: false,
                receive_open: false
            },

            // Close Dividend Modal
            dividend_active: false,

            // Close Affiliate Modal
            affiliate_active: false,

            // Close Settings Modal
            settings_active: false,

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },
        })
        this.listTransactions(this.state.keys[e].public_key);
    }

    closeSendReceivePopup() {
        this.setState({
            send_receive_popup: false,
            send_receive_info: ''
        });
    }

    changePassword(e) {
        e.preventDefault();
        var now_pass = e.target.old_pass.value;
        var new_pass = e.target.new_pass.value;
        var repeat_pass = e.target.repeat_pass.value;

        //check if the new password field is full
        if (new_pass.length > 0) {
            //check that the new password matches the repeated password
            if (new_pass === repeat_pass) {
                loadAndDecryptWalletFromFile(localStorage.getItem('wallet_path'), now_pass, (err, wallet) => {
                    if (!wallet) {
                        err = new Error(`No wallet was found`);
                    }

                    if (!err) {
                        const decrypted_wallet_str = JSON.stringify(wallet.decrypted);

                        const crypto = require('crypto');
                        const hash1 = crypto.createHash('sha256');
                        const hash2 = crypto.createHash('sha256');

                        //hash the wallet on the path
                        hash1.update(decrypted_wallet_str);

                        //hash the wallet in localstorage
                        hash2.update(localStorage.getItem('wallet'));

                        //check that both hashes the active wallet and encrypted wallet are identical
                        if (hash1.toString() === hash2.toString()) {
                            //encrypt the wallet data with the new password
                            const algorithm = 'aes-256-ctr';
                            const password = new_pass;
                            const encrypted_wallet = encrypt(decrypted_wallet_str, algorithm, password);

                            //write the new file to the path
                            fs.writeFile(localStorage.getItem('wallet_path'), encrypted_wallet, (err) => {
                                if (err) {
                                    this.setState({
                                        info_popup: true,
                                        info_text: 'There was a problem writing the new encrypted file to disk'
                                    });
                                } else {
                                    //set the active password and wallet to the new file
                                    localStorage.setItem('password', new_pass);
                                    localStorage.setItem('wallet', decrypted_wallet_str);
                                    this.setState({
                                        info_popup: true,
                                        info_text: 'Password has been changed. Write it down, keep it safe.'
                                    });
                                }
                            });
                        }
                    } else {
                        // Failed to load wallet
                        console.error(err);
                        this.openMainAlertPopup(err.message);
                        this.wrongOldPassword();
                    }
                });
            } else {
                this.setState({
                    info_popup: true,
                    info_text: 'New password does not match repeated password'
                });
                this.wrongRepeatPassword();
            }
        } else {
            this.setState({
                info_popup: true,
                info_text: 'New password field is empty'
            });
            this.wrongNewPassword();
        }
    }

    closeSettingsInfoPopup(){
        this.setState({
            info_popup: false
        })
    }

    closeSettingsModal() {
        this.setState({
            sidebar_open: false,
            settings_active: false,

            // Close Settings Form Popup
            info_popup: false
        });
    }

    resetSettingsForm() {
        document.getElementsByClassName('password-input').value = '';

        this.setState({
            info_popup: false
        });
    }

    closeCoinModal() {
        this.setState({
            sidebar_open: false,

            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            }
        })
    }

    closeHistoryModal() {
        this.setState({
            history_overflow_active: false,
            history_key: ''
        })
    }

    closeSuccessModal(e) {
        e.preventDefault();
        this.setState({
            sidebar_open: false,
            transaction_sent: false,

            // Close Coin Modal
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },

            // Close Send Receive Modal
            collapse_open: {
                send_open: false,
                receive_open: false
            },

            // Close Settings Info Popup
            info_popup: false
        });
        this.prepareDisplay();
        this.prepareDisplayPendingTx();
    }

    openSettingsModal(e) {
        e.preventDefault();
        this.setState({
            sidebar_open: true,
            settings_active: true,

            // Close Send Coin Modal
            transaction_being_sent: false,

            // Close Success Modal
            transaction_sent: false,

            // Close Coin Modal
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },

            // Close History Modal
            history_overflow_active: false,
            history_key: '',

            // Close Dividend Modal
            dividend_active: false,

            // Close Affiliate Modal
            affiliate_active: false,
        });
    }

    //This is fired when amount is changed
    sendAmountOnChange(e) {
        var send_fee = this.state.send_fee;
        var send_total = 0;
        if (this.state.send_coin === 'safex') {
            send_total = parseInt(e.target.value);
            this.setState({
                send_amount: parseInt(e.target.value),
                send_total: parseInt(send_total)
            });
        } else {
            send_total = parseFloat(e.target.value) + parseFloat(send_fee);
            this.setState({
                send_amount: e.target.value,
                send_total: send_total.toFixed(8)
            });
        }
    }

    //This is fired when fee is changed
    sendFeeOnChange(e) {
        var send_amount = this.state.send_amount;
        var send_fee = parseFloat(e.target.value);

        if (this.state.send_coin === 'safex') {
            var send_total = parseFloat(send_amount);
            this.setState({
                send_fee: send_fee,
                send_total: send_total.toFixed(0)
            });
        } else {
            var send_total = parseFloat(send_fee) + parseFloat(send_amount);
            this.setState({
                send_fee: send_fee,
                send_total: send_total.toFixed(8)
            });
        }

        if (this.state.send_amount <= 0.00001) {
            this.state.send_amount === 0.00001;
        }
    }

    //This fires the currency selection method and sets the currency state
    sendCoinChoose(coin) {
        this.setState({
            send_coin: coin,
            fee_in_btc: true
        });
        this.sendTotalAdjustCoinChange(coin);
    }

    //This is fired when change of currency is selected BTC SAFEX
    sendTotalAdjustCoinChange(coin) {
        var send_amount = this.state.send_amount;
        if (this.state.average_fee > 0) {
            var send_fee = this.state.average_fee;
        } else {
            var send_fee = this.state.send_fee;
        }

        //if this.state.average_fee > 0 send_fee == fast. Set active fee selection fastest.
        if (coin === 'safex') {
            send_amount = parseFloat(this.state.send_amount).toFixed(0);
            var send_total = parseFloat(send_amount);
            this.setState({
                send_amount: 1,
                send_fee: parseFloat(this.state.average_fee).toFixed(8),
                send_total: 1,
                active_fee: 'fast'
            });
        } else {
            if (parseFloat(parseFloat(this.state.average_fee) / 4) > 0.00001) {
                var send_total = parseFloat(this.state.average_fee) / 4 + 0.00001;
                this.setState({
                    send_amount: 0.00001.toFixed(8),
                    send_fee: parseFloat(parseFloat(this.state.average_fee) / 4).toFixed(8),
                    send_total: send_total.toFixed(8),
                    active_fee: 'fast'
                });
            } else {
                var send_total = 0.00002;
                this.setState({
                    send_amount: 0.00001.toFixed(8),
                    send_fee: 0.00001.toFixed(8),
                    send_total: send_total.toFixed(8),
                    active_fee: 'fast'
                });
            }
        }
    }

    feeChange(speed) {
        var coin = this.state.send_coin;
        if (coin === 'safex') {
            if (speed === 'fast') {
                if (parseFloat(this.state.average_fee) > 0.00001) {
                    this.setState({
                        send_fee: parseFloat(this.state.average_fee).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee: 0.00001.toFixed(8),
                        active_fee: speed
                    });
                }
            }
            if (speed === 'med') {
                if (parseFloat(parseFloat(this.state.average_fee) / 2) > 0.00001) {
                    this.setState({
                        send_fee: parseFloat(parseFloat(this.state.average_fee) / 2).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee: 0.00001.toFixed(8),
                        active_fee: speed
                    });
                }
            }
            if (speed === 'slow') {
                if (parseFloat(parseFloat(this.state.average_fee) / 4) > 0.00001) {
                    this.setState({
                        send_fee: parseFloat(parseFloat(this.state.average_fee) / 4).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee: 0.00001.toFixed(8),
                        active_fee: speed
                    });
                }
            }
        }
        if (coin === 'btc') {
            if (speed === 'fast') {
                if (parseFloat(parseFloat(this.state.average_fee) / 4) > 0.00001) {
                    this.setState({
                        send_fee:   parseFloat(parseFloat(this.state.average_fee) / 4).toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + parseFloat(this.state.average_fee) / 4).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee:   0.00001.toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + 0.00001).toFixed(8),
                        active_fee: speed
                    });
                }
            }
            if (speed === 'med') {
                if (parseFloat(parseFloat(this.state.average_fee) / 6) > 0.00001) {
                    this.setState({
                        send_fee:   parseFloat(parseFloat(this.state.average_fee) / 6).toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + parseFloat(this.state.average_fee) / 6).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee:   0.00001.toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + 0.00001).toFixed(8),
                        active_fee: speed
                    });
                }
            }
            if (speed === 'slow') {
                if (parseFloat(parseFloat(this.state.average_fee) / 8) > 0.00001) {
                    this.setState({
                        send_fee:   parseFloat(parseFloat(this.state.average_fee) / 8).toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + parseFloat(this.state.average_fee) / 8).toFixed(8),
                        active_fee: speed
                    });
                } else {
                    this.setState({
                        send_fee:   0.00001.toFixed(8),
                        send_total: parseFloat(parseFloat(this.state.send_amount) + 0.00001).toFixed(8),
                        active_fee: speed
                    });
                }
            }
        }
    }

    listTransactions(key) {
        var render = '';
        var bodyFormData = new FormData();
        var promises = [];
        bodyFormData.set('addr', key);

        // promises.push(axios({
        //     method: 'post',
        //     url: 'https://api.omniexplorer.info/v1/transaction/address/0',
        //     data: bodyFormData,
        //     config: {
        //         headers: {'Content-Type': 'multipart/form-data', 'origin': '', 'referrer': '', 'referer': ''}
        //     }
        // }));

        promises.push(
            fetch('https://api.omniexplorer.info/v1/transaction/address/0', {
                method: 'POST',
                body: bodyFormData,
            })
            .then(res => {
                return res.json();
            })
        );

        promises.push(
            fetch(`http://bitcoin.safex.io:3001/insight-api/txs/?address=${key}`)
                .then(res => {
                    return res.json();
                })
        );

        Promise.all(promises)
            .then(function (response) {
                var historySafex = response[0].transactions;
                var historyBtc = response[1].txs;
                var render = '';
                var safex_direction = '';
                var coin = '';
                var date_time = 0;
                var safex_confirmations = '';
                var btc_reference_address = '';
                var btc_confirmations = '';
                var btc_amount = '';
                var btc_amount_arr = [];
                var scriptPubKey = [];
                var btc_send_addr = '';
                var btc_receive_addr = '';
                var btc_send_direction = [];
                var btc_sending_direction = [];
                var btc_tx_direction = [];
                var btc_tx_send_direction = '';

                historyBtc.unshift.apply( historyBtc, historySafex );

                var array = historyBtc.map(tx => ({
                    safex_direction: tx.referenceaddress === key ? "Received" : "Sent",
                    safex_reference_address: tx.referenceaddress,
                    date_time: tx.propertyname === "SafeExchangeCoin" ? tx.blocktime : tx.time,
                    safex_txid: tx.txid,
                    safex_sending_address: tx.sendingaddress,
                    safex_amount: tx.amount,
                    confirmations: tx.confirmations,
                    coin: tx.propertyname === "SafeExchangeCoin" ? "safex" : "bitcoin",
                    btc_txid: tx.txid,
                    btc_sending_address: tx.vout,
                    btc_fees: tx.propertyname === "SafeExchangeCoin" ? 0 : tx.fees
                }));

                array.sort(function(a, b) {
                    return parseFloat(b.date_time) - parseFloat(a.date_time);
                });

                var txArray = JSON.stringify(array);

                JSON.parse(txArray).forEach((tx) => {
                    safex_direction = tx['safex_direction'];
                    coin = tx['coin'];
                    date_time = new Date(tx['date_time'] * 1000);
                    safex_confirmations = tx['confirmations'] > 15 ? "(16/16)" : "("+ tx['confirmations'] + "/16)";
                    btc_amount = tx['btc_fees'] !== undefined ? tx['btc_fees'] : 0;
                    btc_reference_address = tx['btc_sending_address'];
                    btc_confirmations = tx['confirmations'];

                    if(btc_reference_address !== undefined){
                        btc_reference_address.forEach(function(nestedProp) {
                            scriptPubKey.push(nestedProp['scriptPubKey']['addresses']);
                        });

                        btc_amount_arr = btc_reference_address.filter(function (el) {
                            return el.n === 0;
                        });

                        btc_amount = btc_amount_arr[0]['value'];
                    }

                    if (scriptPubKey.length > 0 && scriptPubKey !== undefined) {
                        btc_send_addr = scriptPubKey[0];
                        btc_receive_addr = scriptPubKey[1];
                    }

                    if (btc_send_addr[0] !== undefined && btc_send_addr[0].length) {
                        btc_send_addr.forEach(function(addr) {
                            btc_send_direction.push(addr);
                        })
                    }

                    if(btc_send_direction[0] !== undefined) {
                        btc_sending_direction.push(btc_send_direction[0]);
                    }

                    if (btc_sending_direction[0] !== undefined && btc_sending_direction[0].length > 0) {
                        btc_sending_direction.forEach(function(addr) {
                            btc_tx_direction.push(addr);
                        })
                    }

                    if (btc_tx_direction !== []) {
                        btc_tx_direction.forEach(function(send_addr) {
                            btc_tx_send_direction = send_addr;
                        })
                    }

                    if (btc_tx_send_direction === key) {
                        btc_tx_send_direction = "Received";
                    } else {
                        btc_tx_send_direction = "Sent";
                    }

                    if (safex_direction === "Received" && coin === 'safex') {
                        render +=`
                        <div class="history">
                            <p class="coin-name">SAFEX</p><br /> ` + safex_direction + ` <br />
                            <img class="coin-logo" src="images/coin-white.png" alt="Safex Coin">
                            <p class="date">` + date_time + `</p><br />
                            <p class="address"><b>TX: </b> `+ tx['safex_txid'] +`</p><br />
                            <p class="address address-green">`+ tx['safex_sending_address'] +`</p> <p class="address-arrow"> ➡ </p> <p class="address address-green">`+ tx['safex_reference_address'] +`</p>
                            <div class="col-xs-12 confirmations_wrap">
                                `+ tx['safex_amount'] +` safex `+ safex_confirmations +` confirmations
                            </div>
                        </div>`;
                    } else if (safex_direction === "Sent" && coin === 'safex') {
                        render +=`
                        <div class="history">
                            <p class="coin-name">SAFEX</p><br /> ` + safex_direction + ` <br />
                            <img class="coin-logo" src="images/coin-white.png" alt="Safex Coin">
                            <p class="date">` + date_time + `</p><br />
                            <p class="address"><b>TX: </b> `+ tx['safex_txid'] +`</p><br />
                            <p class="address address-blue">`+ tx['safex_sending_address'] +`</p> <p class="address-arrow"> ➡ </p> <p class="address address-blue">`+ tx['safex_reference_address'] +`</p>
                            <div class="col-xs-12 confirmations_wrap">
                                `+ tx['safex_amount'] +` safex `+ safex_confirmations +` confirmations
                            </div>
                        </div>`;
                    }
                    else if (btc_tx_send_direction === "Received" && coin === 'bitcoin') {
                        render += `
                        <div class="history">
                            <p class="coin-name">BITCOIN</p><br /> ` + btc_tx_send_direction + ` <br />
                            <img class="coin-logo" src="images/btc-coin.png" alt="Bitcoin Logo">
                            <p class="date">` + date_time + `</p><br />
                            <p class="address"><b>TX: </b> ` + tx['btc_txid'] + `</p><br />
                            <p class="address address-green">`+ btc_receive_addr +`</p> <p class="address-arrow"> ➡ </p> <p class="address address-green">`+ btc_send_addr +`</p>
                            <div class="col-xs-12 confirmations_wrap">
                                ` + btc_amount +` bitcoin(s) ` + btc_confirmations + ` confirmations
                            </div>
                        </div>`;
                    } else if (btc_tx_send_direction === "Sent" && coin === 'bitcoin') {
                        render += `
                        <div class="history">
                            <p class="coin-name">BITCOIN</p><br /> ` + btc_tx_send_direction + ` <br />
                            <img class="coin-logo" src="images/btc-coin.png" alt="Bitcoin Logo">
                            <p class="date">` + date_time + `</p><br />
                            <p class="address"><b>TX: </b> ` + tx['btc_txid'] + `</p><br />
                            <p class="address address-blue">`+ btc_receive_addr +`</p> <p class="address-arrow"> ➡ </p> <p class="address address-blue">`+ btc_send_addr +`</p>
                            <div class="col-xs-12 confirmations_wrap">
                                ` + btc_amount +` bitcoin(s) ` + btc_confirmations + ` confirmations
                            </div>
                        </div>`;
                    }
                });
                if (response[1].txs.length === 0) {
                    render =`<h5>No transaction history</h5>`;
                }
                document.getElementById("history_txs").innerHTML = render;
            })
            .catch(function (error) {
                console.log(error);
                render += `<h5>Could not fetch transaction history, plese try again later</h5>`
            });

    }

    sendToArchive(index) {
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));

            var json_index;
            json_index = json.keys[index];

            json_index.archived = true;

            json.keys[index] = json_index;

            var crypto = require('crypto'),
                algorithm = 'aes-256-ctr',
                password = localStorage.getItem('password');

            var cipher_text = encrypt(JSON.stringify(json), algorithm, password);

            fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                if (err) {
                    this.openMainAlertPopup('Problem communicating to the wallet file.');
                } else {
                    localStorage.setItem('wallet', JSON.stringify(json));
                    try {
                        var json2 = JSON.parse(localStorage.getItem('wallet'));
                        json2['keys'].forEach((key) => {
                            var currentIndex = this.state.keys.findIndex(i => i.public_key === key['public_key'])
                            key['safex_bal'] = this.state.keys[currentIndex].safex_bal;
                            key['btc_bal'] = this.state.keys[currentIndex].btc_bal;
                            key['pending_safex_bal'] = this.state.keys[currentIndex].pending_safex_bal;
                            key['pending_btc_bal'] = this.state.keys[currentIndex].pending_btc_bal;
                        });

                        this.setState({
                            wallet: json2,
                            keys: json2['keys'],
                            is_loading: false
                        });
                    } catch (e) {
                        this.openMainAlertPopup('An error adding a key to the wallet. Please contact team@safex.io');
                    }

                }
            });
        } catch (e) {
            this.openMainAlertPopup('Error parsing the wallet data.');
        }
        this.setState({
            transfer_key_to_archive: true,
        });
        setTimeout(() => {
            this.setState({
                transfer_key_to_archive: false
            });
        }, 800);
    }

    removeFromArchive(index) {
        try {
            var json = JSON.parse(localStorage.getItem('wallet'));

            var json_index;
            json_index = json.keys[index];

            json_index.archived = false;

            json.keys[index] = json_index;

            var crypto = require('crypto'),
                algorithm = 'aes-256-ctr',
                password = localStorage.getItem('password');

            var cipher_text = encrypt(JSON.stringify(json), algorithm, password);


            fs.writeFile(localStorage.getItem('wallet_path'), cipher_text, (err) => {
                if (err) {
                    this.openMainAlertPopup('Problem communicating to the wallet file.');
                } else {
                    localStorage.setItem('wallet', JSON.stringify(json));
                    try {
                        var json2 = JSON.parse(localStorage.getItem('wallet'));
                        json2['keys'].forEach((key) => {
                            var currentIndex = this.state.keys.findIndex(i => i.public_key === key['public_key'])
                            key['safex_bal'] = this.state.keys[currentIndex].safex_bal;
                            key['btc_bal'] = this.state.keys[currentIndex].btc_bal;
                            key['pending_safex_bal'] = this.state.keys[currentIndex].pending_safex_bal;
                            key['pending_btc_bal'] = this.state.keys[currentIndex].pending_btc_bal;
                        });

                        this.setState({
                            wallet: json2,
                            keys: json2['keys'],
                            is_loading: false
                        });
                        this.prepareDisplay(json.keys[index]);
                    } catch (e) {
                        this.openMainAlertPopup('An error occured while adding a key to the wallet. Please contact team@safex.io');
                    }
                }
            });
        } catch (e) {
            this.openMainAlertPopup('Error parsing the wallet data');
        }
        this.setState({
            transfer_key_to_home: true,
        });
        setTimeout(() => {
            this.setState({
                transfer_key_to_home: false
            });
        }, 800);
    }

    setArchiveView() {
        this.setState({
            archive_active: true,

            //Close History Modal
            history_overflow_active: false,
            history_key: '',

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },

            // Close Send Receive Popup
            send_receive_popup: false,
            send_receive_info: ''
        });
    }

    setHomeView() {
        this.setState({
            archive_active: false,

            //Close History Modal
            history_overflow_active: false,
            history_key: '',

            // Close Private Key Popup
            private_key_open: {
                private_key_popup: false,
            },

            // Close Send Receive Popup
            send_receive_popup: false,
            send_receive_info: ''
        });
    }

    openDividendModal(e) {
        e.preventDefault();
        this.setState({
            sidebar_open: true,
            dividend_active: true,

            // Close Success Modal
            transaction_sent: false,

            // Close Coin Modal
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },

            //Close History Modal
            history_overflow_active: false,
            history_key: '',

            // Close Affiliate Modal
            affiliate_active: false,

            // Close Settings Modal
            settings_active: false,
        });
    }

    closeDividendModal() {
        this.setState({
            sidebar_open: false,
            dividend_active: false
        });
    }

    openAffiliateModal(e) {
        e.preventDefault();
        this.setState({
            sidebar_open: true,
            affiliate_active: true,

            // Close Success Modal
            transaction_sent: false,

            // Close Coin Modal
            send_overflow_active: false,
            send_to: '',
            send_keys: {
                public_key: '',
                private_key: ''
            },

            // Close History Modal
            history_overflow_active: false,
            history_key: '',

            // Close Dividend Modal
            dividend_active: false,

            // Close Settings Modal
            settings_active: false,
        });
    }

    closeAffiliateModal() {
        this.setState({
            sidebar_open: false,
            affiliate_active: false
        });
    }

    closeSendReceiveModal() {
        this.setState({
            collapse_open: {
                send_open: false,
                receive_open: false
            }
        });
    }

    safexDividendOnChange(e) {
        e.preventDefault();
        if (e.target.name === "total_trade_volume") {
            var safexDividendYield = parseFloat(e.target.value) * (parseFloat(this.state.marketplaceFee) / 100) / parseFloat(this.state.safexMarketCap);
            this.setState({
                totalTradeVolume: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "marketplace_fee") {
            var safexDividendYield = (parseFloat(e.target.value) / 100) * parseFloat(this.state.totalTradeVolume) / parseFloat(this.state.safexMarketCap);
            this.setState({
                marketplaceFee: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "safex_market_cap") {
            var safexDividendYield = (parseFloat(this.state.marketplaceFee) / 100) * parseFloat(this.state.totalTradeVolume) / parseFloat(e.target.value);
            this.setState({
                safexMarketCap: e.target.value,
                safexDividendYield: (safexDividendYield * 100).toFixed(2)
            })
        } else if (e.target.name === "safex_holdings") {
            var safexDividendYield = ((parseFloat(this.state.marketplaceFee) / 100) * parseFloat(this.state.totalTradeVolume) / 2147483647) * parseFloat(e.target.value) * (100 / (parseFloat(this.state.holdingsByMarket)));
            this.setState({
                safexHolding: e.target.value,
                safexDividendYield: safexDividendYield.toFixed(2)
            })
        }
    }

    wrongOldPassword() {
        flashField(this, 'wrongOldPassword');
    }

    wrongNewPassword() {
        flashField(this, 'wrongNewPassword');
    }

    wrongRepeatPassword() {
        flashField(this, 'wrongRepeatPassword');
    }

    saveLabel(e) {
        this.setState({
            savedLabel: e.target.value
        });
    }

    editLabel(label, key) {
        // console.log(label, key);
    }

    openMainAlertPopup(message) {
        openMainAlert(this, message)
    }

    setCoinModalOpenSettings(alert) {
        coinModalOpenSettings(this, alert)
    }

    setCoinModalClosedSettings(alert) {
        coinModalClosedSettings(this, alert)
    }

    convertBtcToDollars() {
        this.setState({
            fee_in_btc: !this.state.fee_in_btc,
            send_fee: parseFloat(this.state.send_fee).toFixed(8)
        });
    }

    copyToClipboard(){

    }

    render() {
        const {keys, archive_active, safex_price, btc_price} = this.state;

        var table = Object.keys(keys).map((key) => {

            return <div className={keys[key].archived === archive_active
            || (!keys[key].hasOwnProperty('archived') && archive_active === false)
                ? 'col-xs-12 single-key'
                : 'col-xs-12 single-key hidden-xs hidden-sm hidden-md hidden-lg'} key={key}>
                <div className="col-xs-8 single-key-inner">
                    <KeyLabel
                        keyReference={keys[key]}
                        keyLabel={keys[key].label}
                        editLabel={this.editLabel}
                    />
                    <div className="key">
                        {
                            this.state.copied && keys[key].public_key === key
                            ?
                                <CopyToClipboard text={keys[key].public_key} onCopy={() => this.setState({copied: true})} className="button-shine">
                                    <button>
                                        Copied
                                    </button>
                                </CopyToClipboard>
                            :
                                <CopyToClipboard text={keys[key].public_key} onCopy={() => this.setState({copied: true})} className="button-shine">
                                    <button>
                                        Copy
                                    </button>
                                </CopyToClipboard>
                        }
                        <input type="text" value={keys[key].public_key} onChange={({target: {value}}) => this.setState({value, copied: false})} />
                        <input type="hidden" name="current_public_key" id="current_public_key" readOnly value={keys[key].public_key} />
                    </div>
                    <span>
                        {
                            keys[key].pending_safex_bal > 0
                            || keys[key].pending_safex_bal < 0
                                ? ' (safex: pending ' + keys[key].pending_safex_bal + ')'
                                : ''
                        }
                    </span>
                    <span>
                        {
                            keys[key].pending_btc_bal > 0
                            || keys[key].pending_btc_bal < 0
                                ? ' (bitcoin: pending ' + keys[key].pending_btc_bal + ')'
                                : ''
                        }
                    </span>
                </div>
                <div className="pull-right single-key-btns-wrap">
                    {
                        this.state.collapse_open.send_open && this.state.collapse_open.key === key
                        ?
                            <div>
                                <button disabled={keys[key].pending_btc_bal >= 0 && this.state.average_fee !== 0 || this.state.send_disabled === false ? '' : 'disabled'}
                                    onClick={this.openSendReceive.bind(this, key, 'send')}
                                    className={this.state.collapse_open.key === key && this.state.transaction_being_sent || this.state.send_disabled ? 'send-btn button-shine disabled-btn' : 'send-btn button-shine active'}>
                                    <span className="img-wrap">
                                        {
                                            this.state.collapse_open.key === key && this.state.transaction_being_sent || this.state.send_disabled
                                            ?
                                                <img src="images/outbox-gray.png" alt="Outbox Logo"/>
                                            :
                                                <img src="images/outbox-white.png" alt="Outbox Logo"/>
                                        }
                                    </span>
                                    <span>SEND</span>
                                </button>
                                <button className="receive-btn button-shine disabled" onClick={this.openSendReceive.bind(this, key, 'receive')}>
                                    <img src="images/receive-gray.png" alt="Receive"/>
                                    <span>RECEIVE</span>
                                </button>
                            </div>
                        :
                            <div>
                                <button disabled={keys[key].pending_btc_bal >= 0 && this.state.average_fee !== 0 ? '' : 'disabled'}
                                    onClick={this.openSendReceive.bind(this, key, 'send')}
                                    className={this.state.collapse_open.key === key && this.state.collapse_open.receive_open || this.state.send_disabled ? 'send-btn button-shine disabled' : 'send-btn button-shine'}>
                                    {
                                        this.state.collapse_open.key === key && this.state.collapse_open.receive_open || this.state.transaction_being_sent || this.state.send_disabled
                                        ?
                                            <span className="img-wrap">
                                                <img src="images/outbox-gray.png" alt="Outbox Logo"/>
                                            </span>
                                        :
                                            <span className="img-wrap">
                                            {
                                                keys[key].pending_btc_bal >= 0 && this.state.average_fee !== 0
                                                ?
                                                    <img src="images/outbox-blue.png" alt="Outbox Logo"/>
                                                :
                                                    <img src="images/outbox-gray.png" alt="Outbox Logo"/>

                                            }
                                            </span>
                                    }
                                    <span>SEND</span>
                                </button>
                                <button className="receive-btn button-shine-green" onClick={this.openSendReceive.bind(this, key, 'receive')}>
                                    {
                                        this.state.collapse_open.key === key && this.state.collapse_open.receive_open
                                        ?
                                            <img src="images/receive-white.png" alt="Inbox Logo"/>
                                        :
                                            <img src="images/receive-blue.png" alt="Inbox Logo"/>

                                    }
                                    <span>RECEIVE</span>
                                </button>
                            </div>
                    }
                </div>

                <div className="col-xs-12 amounts-wrap">
                    <div className="row amounts">
                        <div className="row amounts">
                            <div className="col-xs-5 amount-btns-wrap">
                                <button onClick={() => this.removeFromArchive(key)}
                                    className={keys[key].archived === true
                                    || (!keys[key].hasOwnProperty('archived') && archive_active === true)
                                        ? 'archive-button button-shine to-home-btn'
                                        : 'archive-button button-shine hidden-xs hidden-sm hidden-md hidden-lg to-home-btn'}>
                                    <span>TO HOME</span>
                                </button>

                                <button onClick={() => this.sendToArchive(key)}
                                    className={keys[key].archived === false
                                    || (!keys[key].hasOwnProperty('archived') && archive_active === false)
                                        ? 'archive-button button-shine to-archive-btn'
                                        : 'archive-button button-shine hidden-xs hidden-sm hidden-md hidden-lg to-archive-btn'}>
                                    <span>TO ARCHIVE</span>
                                </button>
                                {
                                    this.state.history_overflow_active
                                    ?
                                        <button onClick={this.closeHistoryModal} className='archive-button history-button button-shine history-btn'>
                                            <span>HISTORY</span>
                                        </button>
                                    :
                                        <button onClick={() => this.openHistoryModal(key)} className='archive-button history-button button-shine history-btn'>
                                            <span>HISTORY</span>
                                        </button>
                                }

                                <button onClick={() => this.showPrivateModal(key)} className='archive-button show-private-button button-shine show-private-btn'>
                                    <span>show private</span>
                                </button>
                            </div>
                            <div className="amounts safex-amounts">
                                <span className="col-xs-12 amount">
                                    <span>
                                        {
                                            parseFloat(keys[key].safex_bal)
                                        }
                                    </span>
                                    <span className="coin-name">Safex</span>
                                    <span>
                                        ${(keys[key].safex_bal * safex_price).toFixed(2)}
                                    </span>
                                </span>
                            </div>
                            <div className="amounts bitcoin-amounts">
                                <span className="col-xs-12 amount">
                                    <span>
                                        {
                                            keys[key].pending_btc_bal < 0
                                                ? (parseFloat(keys[key].btc_bal) + parseFloat(keys[key].pending_btc_bal)).toFixed(8)
                                                : keys[key].btc_bal
                                        }
                                    </span>
                                    <span className="coin-name">Bitcoin</span>
                                    <span>
                                        ${(keys[key].btc_bal * btc_price).toFixed(2)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={this.openCoinModal}
                      className={this.state.collapse_open.send_open && this.state.collapse_open.key === key
                          ? 'col-xs-12 form-inline form-send active'
                          : 'col-xs-12 form-inline form-send'}>
                    <div className="col-xs-12 sendCloseButton" onClick={this.openSendReceive.bind(this, key, 'send')}>
                        <div className="close text-right">
                            X
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-7 send-left">
                            <label htmlFor="which">Currency:</label>
                            <img className={this.state.send_coin === 'safex'
                                ? 'coin active'
                                : 'coin'} onClick={this.sendCoinChoose.bind(this, 'safex')} src="images/coin-white.png"  alt="Safex Coin"/>
                            <img className={this.state.send_coin === 'btc'
                                ? 'coin active'
                                : 'coin'} onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png" alt="Bitcoin Coin"/>
                            <input type="hidden" name="which" readOnly value={this.state.send_coin} />
                            <input type="hidden" name="private_key" readOnly value={keys[key].private_key} />
                            <input type="hidden" name="public_key" readOnly value={keys[key].public_key} />
                            <input type="hidden" name="pending_safex_bal" readOnly value={keys[key].pending_safex_bal} id="pending_safex_bal" />
                            <input type="hidden" name="pending_btc_bal" readOnly value={keys[key].pending_btc_bal} id="pending_btc_bal" />
                            <div className="input-group">
                                <span className="input-group-addon" id="basic-addon1">From:</span>
                                <input name="from" type="text" className="form-control" placeholder="From"
                                    aria-describedby="From" value={keys[key].public_key} />
                            </div>
                            <div className="input-group">
                                <span className="input-group-addon" id="basic-addon1">To:</span>
                                <input name="destination" type="text" className="form-control" id="to" placeholder="Address"
                                    aria-describedby="basic-addon1" onChange={this.closeSendReceivePopup} />
                            </div>
                        </div>
                        <div className="col-xs-5 send-right">
                            <div className="form-group">
                                <label htmlFor="amount">Amount&nbsp;
                                    <span className={this.state.send_coin === "safex"
                                    ? ''
                                    : 'hidden-xs hidden-sm hidden-md hidden-lg'}>
                                        {
                                            this.state.fee_in_btc ? '(Safex)' : '($)'
                                        }
                                    </span>
                                    <span className={this.state.send_coin === "btc"
                                        ? ''
                                        : 'hidden-xs hidden-sm hidden-md hidden-lg'}>
                                        {
                                            this.state.fee_in_btc ? '(BTC)' : '($)'
                                        }
                                    </span>
                                </label>
                                {
                                    this.state.send_coin === 'safex'
                                    ?
                                        <input type="number" name="amount" id="amount" onChange={this.sendAmountOnChange} readOnly={this.state.fee_in_btc ? '' : 'readonly'}
                                            value={this.state.fee_in_btc ? this.state.send_amount : (this.state.send_amount * this.state.safex_price).toFixed(8)}/>
                                    :
                                        <input type="number" name="amount" id="amount" onChange={this.sendAmountOnChange} readOnly={this.state.fee_in_btc ? '' : 'readonly'}
                                            value={this.state.fee_in_btc ? this.state.send_amount : (this.state.send_amount * this.state.btc_price).toFixed(8)}/>
                                }
                            </div>
                            <div className="form-group">
                                <label htmlFor="fee">{this.state.fee_in_btc ? 'Fee (BTC):' : 'Fee ($)'}</label>
                                <input type="number" name="fee" onChange={this.sendFeeOnChange} readOnly={this.state.fee_in_btc ? '' : 'readonly'}
                                    value={this.state.fee_in_btc ? this.state.send_fee : (this.state.send_fee * this.state.btc_price).toFixed(8)}/>
                            </div>
                            <div className="form-group fee-buttons">
                                <span className={this.state.active_fee === 'slow'
                                    ? 'slow slow-btn button-shine-orange active'
                                    : 'slow-btn button-shine-orange'} onClick={this.feeChange.bind(this, 'slow')}>Slow</span>
                                <span className={this.state.active_fee === 'med'
                                    ? 'medium medium-btn button-shine-green active'
                                    : 'medium-btn button-shine-green'} onClick={this.feeChange.bind(this, 'med')}>Med</span>
                                <span className={this.state.active_fee === 'fast'
                                    ? 'fast fast-btn button-shine active'
                                    : 'fast-btn button-shine'} onClick={this.feeChange.bind(this, 'fast')}>Fast</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="total" className="total-label">
                                    Total&nbsp;
                                    <span className={this.state.send_coin === "safex"
                                        ? ''
                                        : 'hidden-xs hidden-sm hidden-md hidden-lg'}>
                                        {
                                            this.state.fee_in_btc ? '(Safex)' : '($)'
                                        }
                                    </span>
                                    <span className={this.state.send_coin === "btc"
                                        ? ''
                                        : 'hidden-xs hidden-sm hidden-md hidden-lg'}>
                                        {
                                            this.state.fee_in_btc ? '(BTC)' : '($)'
                                        }
                                    </span>
                                </label>
                                {
                                    this.state.send_coin === 'safex'
                                    ?
                                        <input className="total-input" type="number" name="total" readOnly value={this.state.fee_in_btc ? this.state.send_total : (this.state.send_total * this.state.safex_price).toFixed(8)} />
                                    :
                                        <input className="total-input" type="number" name="total" readOnly value={this.state.fee_in_btc ? this.state.send_total : (this.state.send_total * this.state.btc_price).toFixed(8)} />
                                }
                            </div>
                            <div className="form-group">
                                <button type="button" className="btc-convert-btn button-shine" onClick={this.convertBtcToDollars}
                                    disabled={this.state.send_overflow_active && this.state.transaction_sent === false ? 'disabled' : ''}>
                                    {this.state.fee_in_btc ? 'Btc to $' : '$ to btc'}
                                </button>
                                {
                                    this.state.send_overflow_active && this.state.transaction_sent === false
                                    ?
                                        <button type="submit"
                                            name="form_send_submit"
                                            className="form-send-submit button-shine"
                                            disabled={this.state.transaction_being_sent ? 'disabled' : ''}>
                                            <img src="images/outgoing.png" alt="Outgoing Icon"/>
                                            Send
                                        </button>
                                    :
                                        <button type="submit"
                                            name="form_send_submit"
                                            className="form-send-submit button-shine"
                                            disabled={this.state.transaction_being_sent ? 'disabled' : ''}>
                                            <img src="images/outgoing-blue.png" alt="Outgoing Icon"/>
                                            Send
                                        </button>
                                }
                            </div>
                            <div className="send_receive_popup_wrap">
                                <div className={this.state.send_receive_popup
                                    ?  'send_receive_info active'
                                    :  'send_receive_info'}>
                                    <p>{this.state.send_receive_info}</p>
                                    <span className="close" onClick={keys[key].pending_btc_bal < 0 || keys[key].pending_safex_bal < 0 ? this.closeSendReceiveModal : this.closeSendReceivePopup}>X</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className={this.state.collapse_open.receive_open && this.state.collapse_open.key === key
                    ? 'col-xs-12 receive active'
                    : 'col-xs-12 receive'}>
                    <div className="col-xs-12 sendCloseButton" onClick={this.openSendReceive.bind(this, key, 'receive')}>
                        <div className="close">
                            X
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-7 receive-address-wrap">
                            <label htmlFor="receive-address">Address:</label>
                            <input name="receive-address" value={keys[key].public_key}/>

                            <label htmlFor="amount">Amount:</label>
                            <input type="amount" placeholder="1" onChange={this.amountChange} value={this.state.receive_amount}/>
                        </div>
                        <div className="col-xs-5 qr-code-wrap">
                            <QRCode value={"bitcoin:" + keys[key].public_key + "?amount=" + this.state.receive_amount}/>
                        </div>
                    </div>
                </div>

                <div className={this.state.private_key_open.private_key_popup && keys[key].public_key === this.state.private_key_open.current_public_key
                    ?  'col-xs-12 private_key_popup active'
                    :  'col-xs-12 private_key_popup'}>
                    <h4>The following key is to control your coins, do not share it. Keep your private key for yourself only!</h4>
                    <p>{this.state.private_key_open.display_private_key}</p>
                    <button onClick={this.closePrivateModal}>
                        Ok
                    </button>
                </div>
            </div>
        });

        return (
            <div className={this.state.loging_out ? 'wallet-page fadeOutUp' : 'wallet-page'}>
                <Navigation />
                <div className="container wallet-tabs-wrap">
                    <div className="wallet-tabs fadeIn">
                        {
                            archive_active
                            ?
                                <div>
                                    {
                                        this.state.transfer_key_to_home
                                        ?
                                            <div onClick={this.setHomeView} className='btn btn-default button-shine glow-active'>
                                                Home
                                            </div>
                                        :
                                            <div onClick={this.setHomeView} className='btn btn-default button-shine'>
                                                Home
                                            </div>
                                    }
                                    <div onClick={this.setArchiveView} className='btn btn-default button-shine active'>
                                        Archive
                                    </div>
                                </div>
                            :
                                <div>
                                    <div onClick={this.setHomeView} className='btn btn-default button-shine active'>
                                        Home
                                    </div>
                                    {
                                        this.state.transfer_key_to_archive
                                        ?
                                            <div onClick={this.setArchiveView} className='btn btn-default button-shine glow-active'>
                                                Archive
                                            </div>
                                        :
                                            <div onClick={this.setArchiveView} className='btn btn-default button-shine'>
                                                Archive
                                            </div>
                                    }
                                </div>
                        }
                    </div>
                </div>

                <div className="container keys-container fadeIn">
                    <div className={this.state.settings_active || this.state.send_overflow_active || this.state.dividend_active || this.state.affiliate_active
                        ? 'col-xs-12 sidebar-opened keys-wrap fadeIn'
                        : 'col-xs-12 keys-wrap fadeIn'}>
                        <div className={this.state.history_overflow_active ? "row row-hidden" : "row"}>
                            {table}
                        </div>
                    </div>
                </div>
                <div className={this.state.history_overflow_active
                    ? 'overflow historyModal fadeIn active'
                    : 'overflow historyModal'}>
                    <div className="col-xs-12 history-inner">
                        <div className="container">
                            <h3>History <span className="close" onClick={this.closeHistoryModal}>X</span></h3>
                        </div>
                        <div id="history_txs">
                            <h5>Loading...</h5>
                        </div>
                    </div>
                </div>

                <div className={this.state.sidebar_open
                    ? 'overflow sendModal active'
                    : 'overflow sendModal'}>
                    {
                        this.state.send_overflow_active && this.state.transaction_sent === false
                        ?
                            <form className="container transactionBeingSent" onSubmit={this.sendCoins}>
                                <div className="head">
                                    <h3>Sending </h3>
                                    <span className={this.state.transaction_being_sent ? 'close disabled' : 'close'} onClick={this.closeCoinModal}>X</span>
                                </div>
                                <div className="currency">
                                    <span>Currency:</span>
                                    <img className={this.state.send_coin === 'safex'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                         onClick={this.sendCoinChoose.bind(this, 'safex')}
                                         src="images/coin-white.png" alt="Safex Coin"/>
                                    <img className={this.state.send_coin === 'btc'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                         onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png"
                                         alt="Bitcoin Coin"/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="from">From:</label>
                                    <textarea name="from" className="form-control" readOnly aria-describedby="basic-addon1" value={this.state.send_keys.public_key}>
                                    </textarea>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="destination">To:</label>
                                    <textarea name="destination" className="form-control" readOnly aria-describedby="basic-addon1" value={this.state.send_to}>
                                    </textarea>
                                </div>
                                <input type="hidden" readOnly name="private_key"
                                       value={this.state.send_keys.private_key} />
                                <input type="hidden" readOnly name="public_key"
                                       value={this.state.send_keys.public_key} />
                                <div className="form-group">
                                    <label htmlFor="amount">Amount:</label>
                                    <input readOnly name="amount" value={this.state.send_amount}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fee">Fee(BTC):</label>
                                    <input readOnly name="fee" value={parseFloat(this.state.send_fee).toFixed(8)}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="total">Total:</label>
                                    <input readOnly name="total" value={this.state.send_total} />
                                </div>
                                <button className={this.state.transaction_being_sent ? 'confirm-btn button-shine-green disabled' : 'confirm-btn button-shine-green'} type="submit">
                                    {this.state.transaction_being_sent ? 'Pending' : 'CONFIRM'}
                                </button>
                            </form>
                        :
                            <div></div>
                    }
                    {   this.state.transaction_sent
                        ?
                            <form className="container transactionSent" onSubmit={this.closeSuccessModal}>
                                <div className="head">
                                    <h3>Sent </h3>
                                    <span className="close" onClick={this.closeSuccessModal}>X</span>
                                </div>
                                <div className="currency">
                                    <span>Currency:</span>
                                    <img className={this.state.send_coin === 'safex'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                         onClick={this.sendCoinChoose.bind(this, 'safex')}
                                         src="images/coin-white.png" alt="Safex Coin"/>
                                    <img className={this.state.send_coin === 'btc'
                                        ? 'coin'
                                        : 'coin hidden-xs hidden-sm hidden-md hidden-lg'}
                                         onClick={this.sendCoinChoose.bind(this, 'btc')} src="images/btc-coin.png"
                                         alt="Bitcoin Coin"/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="from">From:</label>
                                    <textarea name="from" className="form-control" readOnly
                                        value={this.state.send_keys.public_key} placeholder="Address"
                                        aria-describedby="basic-addon1">
                                    </textarea>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="destination">To:</label>
                                    <textarea name="destination" className="form-control" readOnly
                                        value={this.state.send_to} placeholder="Address"
                                        aria-describedby="basic-addon1">
                                    </textarea>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="txid">TX ID:</label>
                                    <textarea name="txid" className="form-control" readOnly
                                        value={this.state.txid}  placeholder="Address"
                                        aria-describedby="basic-addon1" rows="3">
                                    </textarea>
                                </div>
                                <input type="hidden" readOnly name="private_key"
                                    value={this.state.send_keys.private_key} />
                                <input type="hidden" readOnly name="public_key"
                                   value={this.state.send_keys.public_key} />
                                <div className="form-group">
                                    <label htmlFor="amount">Amount:</label>
                                    <input readOnly name="amount" value={this.state.send_amount} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fee">Fee(BTC):</label>
                                    <input readOnly name="fee" value={this.state.send_fee} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="total">Total:</label>
                                    <input readOnly name="total" value={this.state.send_total} />
                                </div>
                                <button type="submit" className="sent-close button-shine">
                                    Close
                                </button>
                            </form>
                        :
                            <div></div>
                    }
                    {
                        this.state.settings_active && this.state.send_overflow_active === false
                        ?
                            <div className="container form-wrap settingsModal">
                                <div className="head">
                                    <img src="images/mixer.png" alt="Transfer Icon"/>
                                    <h3>
                                        User<br />
                                        Settings
                                    </h3>
                                    <span className="close" onClick={this.closeSettingsModal}>X</span>
                                </div>

                                <form onSubmit={this.changePassword} onChange={this.closeSettingsInfoPopup}>
                                    <div className="form-group">
                                        <label htmlFor="old_pass">Old Password:</label>
                                        <input type="password" className={this.state.wrongOldPassword ? 'form-control shake password-input' : 'form-control password-input'} id="old_pass" name="old_pass" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="new_pass">New Password:</label>
                                        <input type="password" className={this.state.wrongNewPassword ? 'form-control shake password-input' : 'form-control password-input'} id="new_pass" name="new_pass" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="repeat_pass">Repeat Password:</label>
                                        <input type="password" className={this.state.wrongRepeatPassword ? 'form-control shake password-input' : 'form-control password-input'} id="repeat_pass" name="repeat_pass" />
                                    </div>
                                    <div className="col-xs-12 submit-wrap">
                                        <div className="row">
                                            <button className="reset-btn button-shine" type="reset" onClick={this.resetSettingsForm}>Reset</button>
                                            <button className="submit-btn button-shine-green" type="submit">Submit</button>
                                        </div>
                                        <div className="info-wrap">
                                            <div className={this.state.info_popup
                                                ? 'info-text active'
                                                : 'info-text'}>
                                                <p>{this.state.info_text}</p>
                                                <span className="close" onClick={this.closeSettingsInfoPopup}>X</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <button className="keys-btn button-shine" onClick={this.openExportEncryptedWallet}>Export Encrypted Wallet <span className="blue-text">(.dat)</span></button>
                                <button className="keys-btn button-shine" onClick={this.openExportUnencryptedWalletPopup}>Export Unencrypted Keys</button>
                                <button className="logout-btn button-shine-red" onClick={this.logout}>Logout</button>
                            </div>
                        :
                            <div></div>
                    }
                    {
                        this.state.dividend_active
                        ?
                            <form className="container" onChange={this.safexDividendOnChange.bind(this)}>
                                <div className="head">
                                    <img src="images/dividend-logo.png" alt="Transfer Icon"/>
                                    <h3>
                                        Dividend<br />
                                        Calculator
                                    </h3>
                                    <span className="close" onClick={this.closeDividendModal}>X</span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Projected Marketplace Volume $
                                    </label>
                                    <input type="number" name="total_trade_volume" value={this.state.totalTradeVolume}/>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Marketplace Fee %
                                    </label>
                                    <input type="number" name="marketplace_fee" value={this.state.marketplaceFee}/>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Safex Market Cap $
                                    </label>
                                    <input type="number" name="safex_market_cap" value={this.state.safexMarketCap}/>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Number of SAFEX Held
                                    </label>
                                    <input type="number" name="safex_holdings" value={this.state.safexHolding}/>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Cost of Safex Holdings $
                                    </label>
                                    <input type="number" name="safex_holdings_by_market" value={this.state.holdingsByMarket} readOnly/>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Annual Return on Investment %
                                    </label>
                                    <input type="number" name="safex_dividend_yield" value={isNaN(this.state.safexDividendYield) ? '0' : this.state.safexDividendYield}/>
                                </div>
                            </form>
                        :
                            <div></div>
                    }
                    {
                        this.state.affiliate_active
                        ?
                            <form className="container">
                                <div className="head">
                                    <img src="images/affiliate-logo.png" alt="Transfer Icon"/>
                                    <h3>
                                        Affiliate<br />
                                        System
                                    </h3>
                                    <span className="close" onClick={this.closeAffiliateModal}>X</span>
                                </div>
                            </form>
                        :
                            <div></div>
                    }
                </div>
                <div className="key-buttons status fadeInUp">
                    <div className="container">
                        <div className="status-left-wrap">
                            <span>Status:</span>
                            <span className={this.state.safex_sync
                                ? 'status-green'
                                : 'status-red'}>SAFEX</span>
                            <span className={this.state.btc_sync
                                ? 'status-green'
                                : 'status-red'}>BTC</span><br />
                            <img src="images/transfer.png" alt="Transfer Icon"/>
                            <span className="sync-span">{this.state.status_text}</span>
                        </div>
                        <div className={this.state.import_wrap_glow ? 'import-form-wrap active' :'import-form-wrap'}>
                            <form onChange={this.importKeyChange} onSubmit={this.openImportModal}>
                                <input name="key" value={this.state.import_key} onFocus={this.importGlow} onBlur={this.importGlowDeactivate} placeholder="Paste your private key"/>
                                <button type="submit" className="button-shine" title="Import Key">Import</button>
                            </form>
                            <button onClick={this.openCreateKey} className="create-btn button-shine" title="Create New Key">
                                <img src="images/plus.png" alt="Plus Logo"/>
                            </button>
                        </div>
                        <div className="right-options">
                            {
                                this.state.affiliate_active
                                ?
                                    <button className="aff-btn aff-btn-active button-shine" title="Affiliate System (Under development)" onClick={this.closeAffiliateModal} disabled>
                                        <img src="images/world-blue.png" alt="World Logo"/>
                                    </button>
                                :
                                    <button className="aff-btn button-shine" title="Affiliate System (Under development)" onClick={this.openAffiliateModal} disabled>
                                        <img src="images/world.png" alt="World Logo"/>
                                    </button>
                            }

                            {
                                this.state.dividend_active
                                ?
                                    <button className="dividend-btn dividend-btn-active button-shine" title="Dividend Calculator (Under development)" onClick={this.closeDividendModal} disabled>
                                        <img src="images/calculator-blue.png" alt="Calculator Logo"/>
                                    </button>
                                :
                                    <button className="dividend-btn button-shine" title="Dividend Calculator (Under development)" onClick={this.openDividendModal} disabled>
                                        <img src="images/calculator.png" alt="Calculator Logo"/>
                                    </button>
                            }

                            {
                                this.state.settings_active
                                ?
                                    <button className="settings button-shine settings-btn-active" onClick={this.closeSettingsModal} title="Settings">
                                        <img src="images/settings-blue.png" alt="Mixer Logo"/>
                                    </button>
                                :
                                    <button className="settings button-shine" onClick={this.openSettingsModal} title="Settings">
                                        <img src="images/settings.png" alt="Mixer Logo"/>
                                    </button>
                            }

                            {
                                this.state.refreshTimer === 0
                                ?
                                    <button className="refresh-btn button-shine"  onClick={this.refreshWallet} title="Refresh">
                                        <img src="images/refresh.png" alt="Refresh Logo"/>
                                    </button>
                                :
                                    <button className="refresh-btn button-shine disabled" title="Refresh">
                                        <img src="images/refresh-blue.png" alt="Refresh Logo"/>
                                        <span><p>{this.state.refreshTimer + 's'}</p></span>
                                    </button>
                            }
                        </div>
                    </div>
                </div>

                <div className={this.state.import_modal_active || this.state.create_key_active
                    ? 'importModal active'
                    : 'importModal'}>
                    <div className="importModalInner">
                        <form onSubmit={this.state.import_modal_active ? this.importKey : this.createKey}>
                            <div className="input-group">
                                <label htmlFor="key-label">Key Label</label>
                                <input type="text" placeholder="Enter Key Label" name="label" id="label" onChange={this.saveLabel} />
                            </div>
                            {
                                this.state.import_modal_active
                                ?
                                    <div>
                                        <div className="input-group">
                                            <label htmlFor="key">Private Key</label>
                                            <input name="key" value={this.state.import_key} />
                                        </div>

                                        <button type="submit" className="button-shine" title="Import Key">Import Key</button>
                                    </div>
                                :
                                    <div>
                                        <div className="input-group input-group-hidden">
                                            <label htmlFor="key">Private Key</label>
                                            <input name="key" value="" disabled="disabled" />
                                        </div>
                                        {
                                            this.state.create_key_active
                                                ?
                                                <button type="submit" className="button-shine" title="Create Key">Create Key</button>
                                                :
                                                <button type="submit" disabled="disabled" className="button-shine" title="Create Key"></button>
                                        }
                                    </div>
                            }
                        </form>
                        <span className="close" onClick={this.closeImportModal}>X</span>
                    </div>
                </div>

                <div className={this.state.main_alert_popup
                    ? 'mainAlertPopup active'
                    : 'mainAlertPopup'}>
                    <div className="mainAlertPopupInner">
                        <p>{this.state.main_alert_popup_text}</p>
                        {
                            this.state.export_unencrypted_wallet === false && this.state.export_encrypted_wallet
                            ?
                                <div className="mainAlertProceedWrap">
                                    <button className="mainAlertProceed active" onClick={this.exportEncryptedWallet}>
                                        Ok
                                    </button>
                                </div>
                            :
                                <div className="mainAlertProceedWrap">
                                    {
                                        this.state.export_unencrypted_wallet && this.state.export_encrypted_wallet === false
                                            ?
                                            <button className="mainAlertProceed active" onClick={this.exportUnencryptedWallet}>
                                                Ok
                                            </button>
                                            :
                                            <button className="mainAlertProceed">
                                                Ok
                                            </button>
                                    }
                                    <button className="mainAlertProceed">
                                        Ok
                                    </button>
                                </div>
                        }
                        {
                            this.state.transaction_being_sent
                            ?
                                <span className="close disabled" onClick={this.closeMainAlertPopup}>X</span>
                            :
                                <span className="close" onClick={this.closeMainAlertPopup}>X</span>
                        }
                    </div>
                </div>

                {
                    this.state.transaction_being_sent
                    ?
                        <div className={this.state.main_alert_popup || this.state.import_modal_active || this.state.create_key_active
                            ? 'mainAlertBackdrop active disabled'
                            : 'mainAlertBackdrop'} onClick={this.state.main_alert_popup ? this.closeMainAlertPopup : this.closeImportModal}>
                        </div>
                    :
                        <div className={this.state.main_alert_popup || this.state.import_modal_active || this.state.create_key_active
                            ? 'mainAlertBackdrop active'
                            : 'mainAlertBackdrop'} onClick={this.state.main_alert_popup ? this.closeMainAlertPopup : this.closeImportModal}>
                        </div>
                }

            </div>
        );
    }
}

Wallet.contextTypes = {
    router: React.PropTypes.object.isRequired
}
