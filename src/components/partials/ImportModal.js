import React from "react";

export default class ImportModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={this.props.importModalActive || this.props.createKeyActive
                ? 'importModal active'
                : 'importModal'}>
                <div className="importModalInner">
                    <form onSubmit={this.props.importModalActive ? this.props.importKey : this.props.createKey}>
                        <div className="input-group">
                            <label htmlFor="key-label">Key Label</label>
                            <input type="text" placeholder="Enter Key Label" name="label" id="label" onChange={this.props.saveLabel} ref={input => input && input.focus()} />
                        </div>
                        {
                            this.props.importModalActive
                            ?
                                <div>
                                    <div className="input-group">
                                        <label htmlFor="key">Private Key</label>
                                        <input name="key" value={this.props.importKeyState} />
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
                                        this.props.createKeyActive
                                        ?
                                            <button type="submit" className="button-shine" title="Create Key">Create Key</button>
                                        :
                                            <button type="submit" disabled="disabled" className="button-shine" title="Create Key"></button>
                                    }
                                </div>
                        }
                    </form>
                    <span className="close" onClick={this.props.closeImportModal}>X</span>
                </div>
            </div>
        );
    }
}