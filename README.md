
# Groestlcoin ShockWallet Alpha

Groestlcoin ShockWallet connects to a remote node and leverages [GUN](https://github.com/amark/gun) for a decentralized social layer.

Requires [Shock API](https://github.com/Groestlcoin/shocknet-api) backend, and [LND](https://github.com/Groestlcoin/lnd)

## Features:

- Portable GUN Personas + Encrypted Messaging
- Provider-less mobile notifications
- LNURL Pay, Withdraw, Channel
- Seed Caching
- SendSide Payments


## [Download Android APK](https://github.com/shocknet/wallet/releases/download/pre2/app-release.apk)

_Node installer available at [Groestlcoin/ShockWizard](https://github.com/Groestlcoin/ShockWizard)_


### Build from source

#### Android: 

Requires Android Studio and React-Native CLI

```
git clone https://github.com/shocknet/wallet
cd wallet
yarn install
react-native run-android //to run in Android Studio emulator
npm run build:release //to build APK
```

#### iOS:

Help Wanted

<hr></hr>

**If you find any issues with this project, or would like to suggest an enhancement, please [tell us](https://github.com/shocknet/Wizard/issues).**

[ISC License](https://opensource.org/licenses/ISC)
© 2020 [Shock Network, Inc.](http://shock.network)
© 2020 [Groestlcoin Developers](http://groestlcoin.org)
