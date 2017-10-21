# steam-trader

This is just an abstraction over [node-steam-user](https://github.com/DoctorMcKay/node-steam-user),
[node-steamcommunity](https://github.com/DoctorMcKay/node-steamcommunity) and
[node-steam-tradeoffer-manager](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager) working in tandem, to
allow for quick development and setup of simple trading scripts and bots.

## Methods

### Constructor

- `account` - An object containing account information.
  - `accountName`
  - `password`
  - `idsec` - the identity secret of the account, to confirm trades
  - [`shasec`] - the shared secret of the account. If this is not provided, Trader will ask for your steam guard code on startup.

### accept(offer)

- `offer` - A `node-steam-tradeoffer-manager` offer object, as returned by the `newOffer` event.

Accepts an offer. Note that it may take up to 30 seconds for the offer to be confirmed.

This returns a promise that resolves with null and rejects with an `Error` object. Example:
```javascript
trader.accept(offer).then(() => { /** Successfully accepted */ }).catch(err => console.error(err))
```

## Events

These events are emitted by your trader object, for example:
```javascript
let trader = new (require('./Trader.js'))(account)

trader.on('newOffer', (offer) => {
  /** Do something with the offer object. */
})
```

### ready

Emitted when the account is logged on and the trader is ready.

### newOffer

- `offer` - a `node-steam-tradeoffer-manager` offer object, with the [user](https://github.com/DoctorMcKay/node-steamcommunity/wiki/CSteamUser) property tacked on.

Emitted when the manager receives a new offer, polling is done with an interval of 15000ms by default.

### clientError

- `err` - an `Error` object.
- `eresult` - the corresponding [EResult](https://github.com/SteamRE/SteamKit/blob/SteamKit_1.6.3/Resources/SteamLanguage/eresult.steamd) enum.

Emitted when an error occurs during logon. Also emitted on fatal disconnect.

### managerError

- `err` - an `Error` object.

This is a fatal error, emitted when we can't get an API key.
