# SAFEX WALLET

Official repository for SAFEX electron wallet.

## Releases

You can download [SAFEX Wallet](https://github.com/safex/safex_wallet/releases) on the github release page or on [Safex.io](https://safex.io/safexwallet)

Available for Mac, Windows (64, 32) and Linux.

## Development

Electron app consists of main (backend) and renderer (frontend) processes. Frontend is based on [create-react-app](https://github.com/facebook/create-react-app). You'll want to start both in development mode at the same time.

#### Backend:

To start Safex Wallet backend, run this:

```
ELECTRON_START_URL=http://localhost:3000 ELECTRON_DEV=yes npm run electron
```

To run with a debugger, you'll want to set node interpreter to `node_modules/electron/cli.js`. Electron should be started referencing the ***project directory***, not the entry file directly. In Webstorm, you can set node parameters to "`./`", javascript file to anything (eg. `src/electron-wallet.js`) and working directory to the directory where you cloned this project.

#### Frontend:

```
npm start
```

This will start webpack dev server and open a browser window. You will not be able to develop frontend in the browser, as it will lack some of electron's native API-s. So you can close that browser tab and instead debug frontend directly in the electron window you have started as described above.

## Build:

Run

```
npm run make-all-installers
```

to make all installer. This will work only on Mac because of Mac.

You can also run

```
npm run make-win-installer
npm run make-mac-installer
npm run make-linux-installer
```
separately.

For linux builds, you will need to have `rpmbuild` available on system (`apt-get install rpm`).

## License

MIT License

Copyright (c) 2019 Safex Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
