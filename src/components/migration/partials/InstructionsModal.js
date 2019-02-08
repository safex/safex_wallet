import React from "react";

export default class InstructionsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instructions_lang: "english"
    };
  }

  changeInstructionLang = lang => {
    this.setState({
      instructions_lang: lang
    });
  };

  render() {
    return (
      <div>
        <div
          className={
            this.props.instructionsModal
              ? "instructionsModal active"
              : "instructionsModal"
          }
        >
          <div className="instructionsModalInner">
            <span className="close" onClick={this.props.closeInstructionsModal}>
              X
            </span>
            <div className="lang-bts-wrap">
              <button
                className={
                  this.state.instructions_lang === "english"
                    ? "button-shine active"
                    : "button-shine"
                }
                onClick={this.changeInstructionLang.bind(this, "english")}
              >
                EN
              </button>
              <button
                className={
                  this.state.instructions_lang === "serbian"
                    ? "button-shine active"
                    : "button-shine"
                }
                onClick={this.changeInstructionLang.bind(this, "serbian")}
              >
                SRB
              </button>
            </div>
            {this.state.instructions_lang === "english" ? (
              <div>
                <h3>Instructions</h3>
                <p>
                  To migrate your Safex Tokens to the Safex Blockchain, choose
                  one of the following options. If you don't already have your
                  Safex address, click{" "}
                  <button>
                    <img src="images/migration/cube.png" alt="Cube" />
                    new address
                  </button>{" "}
                  option. This will generate new Safex address.
                </p>
                <p className="red-text">
                  Before you proceed save the .txt file with your Safex Address
                  information. This information controls your coins, keep it
                  safe at all times! Sharing or losing this information can and
                  will cause the total loss of your Safex Tokens and Safex Cash.
                  Safex Team will not take responsibility for any losses that
                  may occur.
                </p>
                <p>
                  If you already have Safex Address, select{" "}
                  <button>
                    <img src="images/migration/enter-key.png" alt="Enter Key" />
                    my address
                  </button>{" "}
                  option. There you will need to enter your Safex Address, and
                  secret spend and secret view key for your address. Once you
                  set your address it will be saved, and you can always use it
                  later by choosing{" "}
                  <button className="my-keys">
                    <img src="images/migration/my-keys.png" alt="My Keys" />
                    previously used
                  </button>{" "}
                  option.
                </p>
                <p>
                  Next, you will need to set the first and the second half of
                  your Safex Address. These steps require bitcoin fee, so please
                  proceed with caution. If you make a mistake, you can always{" "}
                  <button className="red-btn">Reset</button> your transaction
                  and start over.
                </p>
                <p>
                  On the final step, choose the amount of Safex Tokens you want
                  to migrate. Once you enter your amount and click send the
                  migration transaction will begin. It may take a couple of days
                  to be processed, so please be patient. That is it, you have
                  successfully migrated your Safex Tokens to Safex Blockchain.
                </p>
              </div>
            ) : (
              <div>
                <h3>Uputstvo</h3>
                <p>
                  Da biste migrirali svoje Safex Tokene na Safex Blockchain,
                  izaberite jednu od ponudjenih opcija. Pročitajte tekst i ako
                  se slažete kliknite procceed dugme. Ako nemate Safex adresu,
                  kliknite{" "}
                  <button>
                    <img src="images/migration/cube.png" alt="Cube" />
                    new address
                  </button>
                  dugme koje će generisati novu Safex adresu.
                </p>
                <p className="red-text">
                  Pre nego što nastavite sačuvajte .txt fajl sa podacima o Vašoj
                  Safex adresi. Ovi podaci kontrolišu Vaše tokene, zato ih uvek
                  čuvajte na sigurnom! U slučaju kradje ili gubitka ovih
                  podataka izgubićete sve Vaše Safex tokene i Safex Cash. Safex
                  Team ne preuzima odgovornost za bilo kakve moguće gubitke
                  Vaših tokena.
                </p>
                <p>
                  Ako već imate Safex adresu, unesite je odabirom{" "}
                  <button>
                    <img src="images/migration/enter-key.png" alt="Enter Key" />
                    my address
                  </button>{" "}
                  opcije. Unesite svoju Safex adresu, i tajni ključ za kupovinu
                  (secret spend key) i tajni ključ za pregled (secret view key).
                  Kada unesete sve podatke, Vaša adresa će biti sačuvana i uvek
                  možete da joj pristupite{" "}
                  <button className="my-keys">
                    <img src="images/migration/my-keys.png" alt="My Keys" />
                    previously used
                  </button>{" "}
                  opcijom.
                </p>
                <p>
                  U sledećem koraku odredićete prvu i drugu polovinu Vaše Safex
                  adrese. To zahteva bitcoin naknadu, zato Vas molimo da budete
                  pažljivi. Ako napravite grešku, uvek možete da resetujete
                  svoju transakciju i počnete ispočetka klikom na{" "}
                  <button className="red-btn">Reset</button> dugme.
                </p>
                <p>
                  Na poslednjem koraku izaberite iznos koji želite da migrirate.
                  Kada unesete iznos i kliknete send započećete Vašu migracionu
                  transakciju. Obrada migracione transakcije može da potraje par
                  dana, zato Vas molimo da budite strpljivi. To je to, uspešno
                  ste započeli migraciju Vaših Safex tokena na Safex Blockchain.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className={
            this.props.instructionsModal
              ? "instructionsModalBackdrop active"
              : "instructionsModalBackdrop"
          }
          onClick={this.props.closeInstructionsModal}
        />
      </div>
    );
  }
}
