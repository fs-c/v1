1. Download and install [NodeJS](https://nodejs.org/en/)
2. Download this repository/folder (either through `git clone` or a ZIP)

```
cd path/to/this/folder
npm i
node app.js
```

This script expects a `.steam.json` file to be either in your `HOME` path or the path specified through the `PATH` environment variable. It should follow the following format.

```json
{
	"accountNickname": {
		"accountName": "...",
		"password": "...",
		"idsec": "...",
		"shasec": "..."
	}
}
```

The account nickname could for example be "main" or "smurf" -- it's not relevant to the steam login process and will be used exclusively when prompting for trade confirmation.