import React from "react";

export default class InstructionsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            instructions_lang: 'english'
        };
        this.changeInstructionLang = this.changeInstructionLang.bind(this);
    }

    changeInstructionLang(lang) {
        this.setState({
            instructions_lang: lang
        })
    }

    render() {
        return (
            <div>
                <div className={this.props.instructionsModal
                    ? 'instructionsModal active'
                    : 'instructionsModal'}>
                    <div className="instructionsModalInner">
                        <span className="close" onClick={this.props.closeInstructionsModal}>X</span>
                        <div className="lang-bts-wrap">
                            <button className={this.state.instructions_lang === 'english' ? "button-shine active" : "button-shine"} onClick={this.changeInstructionLang.bind(this, 'english')}>EN</button>
                            <button className={this.state.instructions_lang === 'serbian' ? "button-shine active" : "button-shine"} onClick={this.changeInstructionLang.bind(this, 'serbian')}>SRB</button>
                        </div>
                        {
                            this.state.instructions_lang === 'english'
                            ?
                                <div>
                                    <h3>Instructions</h3>
                                </div>
                            :
                                <div>
                                    <h3>Uputstvo</h3>
                                </div>
                        }
                    </div>
                </div>

                <div className={this.props.instructionsModal
                    ? 'instructionsModalBackdrop active'
                    : 'instructionsModalBackdrop'} onClick={this.props.closeInstructionsModal}>
                </div>
            </div>
        );
    }
}

