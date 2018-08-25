/**
 * Open Dividend Modal
 */
function openDividendModal(target) {
    target.setState({
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

/**
 * Close Dividend Modal
 */
function closeDividendModal(target) {
    target.setState({
        sidebar_open: false,
        dividend_active: false
    });
}

/**
 * Open Affiliate Modal
 */
function openAffiliateModal(target) {
    target.setState({
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

/**
 * Close Affiliate Modal
 */
function closeAffiliateModal(target) {
    target.setState({
        sidebar_open: false,
        affiliate_active: false
    });
}

/**
 * Open Settings Modal
 */
function openSettingsModal(target) {
    target.setState({
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

/**
 * Close Settings Modal
 */
function closeSettingsModal(target) {
    target.setState({
        sidebar_open: false,
        settings_active: false,

        // Close Settings Form Popup
        info_popup: false
    });
}

/**
 * Open Main Alert Popup
 */
function openMainAlert(target, alert) {
    target.setState({
        main_alert_popup: true,
        main_alert_popup_text: alert,
    });
}

/**
 * Open Wallet Import Alerts
 */
function walletImportAlert(target, alert, duration) {
    target.setState({
        walletImportAlerts: true,
        walletImportAlertsText: alert
    });
    setTimeout(() => {
        target.setState({
            walletImportAlerts: false
        });
    }, duration);
}

/**
 * Open Wallet Reset Popup
 */
function walletResetModal(target, step, alert) {
    target.setState({
        [step]: true,
        walletResetModalText: alert,
    });
}

/**
 * Open next wallet reset step and close the previous step
 */
function walletResetModalStep(target, step, closedStep, alert) {
    target.setState({
        [step]: true,
        [closedStep]: false,
        walletResetModalText: alert,
    });
}

/**
 * Send Coins validation settings when sidebar is opened
 */
function coinModalOpenSettings(target, alert) {
    target.setState({
        sidebar_open: true,
        send_receive_popup: true,
        send_receive_info: alert
    });
}

/**
 * Send Coins validation settings when sidebar is closed
 */
function coinModalClosedSettings(target, alert) {
    target.setState({
        sidebar_open: false,
        send_receive_popup: true,
        send_receive_info: alert,
        send_overflow_active: false,
        settings_active: false,
        affiliate_active: false,
        dividend_active: false,
    });
}

/**
 * Open Home View
 */
function archiveView(target) {
    target.setState({
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
        send_receive_info: '',

        copied: false,
    });
}

/**
 * Open Archive View
 */
function homeView(target) {
    target.setState({
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
        send_receive_info: '',

        copied: false,
    });
}

/**
 * Open History Modal
 */
function openHistoryModal(target) {
    document.getElementById("history_txs").innerHTML = "<h5>Loading...</h5>";
    target.setState({
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

        copied: false
    });
}

/**
 * Close History Modal
 */
function closeHistoryModal(target) {
    target.setState({
        history_overflow_active: false,
        history_key: '',
    })
}

/**
 * Close Success Modal
 */
function closeSuccessModal(target) {
    target.setState({
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
}

/**
 * Close Coin Modal
 */
function closeCoinModal(target) {
    target.setState({
        sidebar_open: false,

        send_overflow_active: false,
        send_to: '',
        send_keys: {
            public_key: '',
            private_key: ''
        }
    })
}

/**
 * Close Private Modal
 */
function closePrivateModal(target){
    target.setState({
        private_key_open: {
            private_key_popup: false,
        }
    });
}

/**
 * Close Main Alert Popup
 */
function closeMainAlertPopup(target) {
    target.setState({
        main_alert_popup: false,
    });

    setTimeout(() => {
        target.setState({
            export_encrypted_wallet: false,
            export_unencrypted_wallet: false,
        });
    }, 300)
}

/**
 * Open Create Key Modal
 */
function openCreateKey(target) {
    target.setState({
        history_overflow_active: false,
        history_key: '',
        create_key_active: true,

        // Close Private Key Popup
        private_key_open: {
            private_key_popup: false,
        },
    });
}

/**
 * Close Send Receive Modal
 */
function closeSendReceiveModal(target) {
    target.setState({
        collapse_open: {
            send_open: false,
            receive_open: false
        }
    });
}

/**
 * Close Send Receive Popup
 */
function closeSendReceivePopup(target) {
    target.setState({
        send_receive_popup: false,
        send_receive_info: ''
    });
}

/**
 * Open Export Unencrypted Wallet Popup
 */
function openExportUnencryptedWalletPopup(target) {
    target.setState({
        export_encrypted_wallet: false,
        export_unencrypted_wallet: true,

        // Close Private Key Popup
        private_key_open: {
            private_key_popup: false,
        },

        // Close settings alert popup
        info_popup: false,
    });
}

/**
 * Open Export Encrypted Wallet Popup
 */
function openExportEncryptedWalletPopup(target) {
    target.setState({
        export_encrypted_wallet: true,
        export_unencrypted_wallet: false,

        // Close Private Key Popup
        private_key_open: {
            private_key_popup: false,
        },

        // Close settings alert popup
        info_popup: false,
    });
}

module.exports = {
    openDividendModal,
    closeDividendModal,
    openAffiliateModal,
    closeAffiliateModal,
    openSettingsModal,
    closeSettingsModal,
    openMainAlert,
    walletImportAlert,
    walletResetModal,
    walletResetModalStep,
    coinModalOpenSettings,
    coinModalClosedSettings,
    archiveView,
    homeView,
    openHistoryModal,
    closeHistoryModal,
    closeSuccessModal,
    closeCoinModal,
    closePrivateModal,
    closeMainAlertPopup,
    openCreateKey,
    closeSendReceiveModal,
    closeSendReceivePopup,
    openExportUnencryptedWalletPopup,
    openExportEncryptedWalletPopup
};