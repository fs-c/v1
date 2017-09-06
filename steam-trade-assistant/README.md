# Steam Trade Assistant

![](https://i.imgur.com/KQprcPM.png)

NodeJS scripts to make trading across several steam accounts easier and faster.

This is basically just an abstraction over [node-steam-user](https://github.com/DoctorMcKay/node-steam-user),
[node-steamcommunity](https://github.com/DoctorMcKay/node-steamcommunity) and
[node-steam-tradeoffer-manager](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager) working in tandem.

The 'heavy lifting' is done in Trader.js, __app.js is really just an example
of using it.__

App.js `require`s a JSON file it takes the accounts from, it's formatted like this:
```
{
  "customAccountName": { account }, 
  ...
}
```
Where accounts format is as defined in the Trader constructor argument. The path to the file is defined with the DATA_PATH process env variable.

The following is the documentation of the `Trader` class, exposed by Trader.js.

## Methods

### Constructor(account)

- `account` - An object containing account information.
  - `accountName`
  - `password`
  - `idsec` - the identity secret of the account, to confirm trades
  - [`shasec`] - the shared secret of the account (this is optional, but very convenient to have)

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

### clientError

- `err` - an `Error` object.
- `eresult` - the corresponding [EResult](https://github.com/SteamRE/SteamKit/blob/SteamKit_1.6.3/Resources/SteamLanguage/eresult.steamd) enum.

Emitted when an error occurs during logon. Also emitted on fatal disconnect.

### managerError

- `err` - an `Error` object.

This is a fatal error, emitted when we can't get an API key.

### ready

Emitted when the account is logged on and the trader is ready.

### newOffer

- `offer` - a `node-steam-tradeoffer-manager` offer object.

Emitted when the manager receives a new offer, polling is done with an interval of 15000ms by default.
