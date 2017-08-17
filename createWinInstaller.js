const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((error) => {
     console.error(error.message || error)
     process.exit(1)
 })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'installers')

    return Promise.resolve({
       appDirectory: path.join(rootPath, 'release-builds', 'SafexWallet-win32-ia32'),
       authors: 'Safex Developers',
       noMsi: true,
       outputDirectory: outPath,
       exe: 'SafexWallet.exe',
       setupExe: 'SafexWalletWindowsInstaller.exe',
       setupIcon: 'public/images/icons/wallet-icon.ico',
       skipUpdateIcon: true
   })
}
