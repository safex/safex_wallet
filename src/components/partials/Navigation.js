import React from 'react';
import {Link} from 'react-router';
import packageJson from "../../../package";

export default class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (<nav className="navbar navbar-default fadeInDown">
            <div className="container">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                        data-target="#navbar-collapse"
                        aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <span className="navbar-brand" href="#">
                        <img src="images/logo.png" alt="Logo"/>
                    </span>
                </div>

                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav wallet-nav fadeIn">
                        <li>
                            <Link activeClassName="activeLink" onlyActiveOnIndex>
                                Wallet &nbsp;{packageJson.version}
                            </Link>
                        </li>
                    </ul>
                    <div className="wallet-tabs fadeIn">
                        {
                            this.props.activeHomePage
                            ?
                                <div>
                                    <div onClick={this.props.migrate} className='btn btn-default button-shine'>
                                        Migrate
                                    </div>
                                    {
                                        this.props.activeHomePage && this.props.archiveActive
                                        ?
                                            <div>
                                                {
                                                    this.props.keyToHome
                                                    ?
                                                        <div onClick={this.props.setHomeView} className='btn btn-default button-shine glow-active'>
                                                            Home
                                                        </div>
                                                    :
                                                        <div onClick={this.props.setHomeView} className='btn btn-default button-shine'>
                                                            Home
                                                        </div>
                                                }
                                                <div onClick={this.props.setArchiveView} className='btn btn-default button-shine active'>
                                                    Archive
                                                </div>
                                            </div>
                                        :
                                            <div>
                                                <div onClick={this.props.setHomeView} className='btn btn-default button-shine active'>
                                                    Home
                                                </div>
                                                {
                                                    this.props.keyToArchive
                                                    ?
                                                        <div onClick={this.props.setArchiveView} className='btn btn-default button-shine glow-active'>
                                                            Archive
                                                        </div>
                                                    :
                                                        <div onClick={this.props.setArchiveView} className='btn btn-default button-shine'>
                                                            Archive
                                                        </div>
                                                }
                                            </div>
                                    }
                                </div>
                            :
                                <div onClick={this.props.wallet} className='btn btn-default button-shine'>
                                    Wallet
                                </div>
                        }
                    </div>
                </div>
                <div className="collapse navbar-collapse" id="navbar-collapse">
                    <ul className="nav navbar-nav navbar-right coin-amounts">
                        <li><span className="currency">SAFEX</span> <span className="amount">${this.props.safexPrice}</span></li>
                        <li><span className="currency">BTC</span> <span className="amount">${this.props.btcPrice}</span></li>
                    </ul>
                </div>
            </div>
        </nav>);
    }
}
