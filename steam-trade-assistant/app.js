const log = require('winston');
const rls = require('readline-sync');

const Trader = require('./Trader');

const dataPath = process.env.DATA || require('path').join(
    require('os').homedir() + '/.steam.json',
);

let data;

const build = (name) => {
    const trader = new Trader(data[name]);

    trader.on('ready', () => log.info(`[${name}] trader ready.`));

    trader.on('clientError', (err, res) =>
        log.error(`[${name}] error while logging in: ${res || err}`));

    trader.on('managerError', (err) =>
        log.error(`[${name}] trade manager error: ${err.message || err}`));

    trader.on('newOffer', offer => {
        const partner = offer.user ? offer.user.name : offer.partner.toString();

        log.info(
            `[${name}] new offer (${offer.id}) by ${partner}, `
            + `${offer.itemsToGive.length} item(s) to give and `
            + `${offer.itemsToReceive.length} item(s) to receive.`
        );

        if (rls.keyInYN(`Accept offer ${offer.id} by ${partner} for ${name}?`)) {
            trader.accept(offer)
                .then(() => log.info(`[${name}] accepted offer ${offer.id}.`))
                .catch((err) =>
                    log.warn(
                        `[${name}] error accepting offer ${offer.id}: `
                        + `${err.msg || err.message || err}`
                    )
                );
        }
    });
}

try {
    data = require(dataPath)
} catch (err) {
    log.error(`expected a JSON file in ${dataPath}`);

    return;
}

for (const name in data) {
    if (rls.keyInYN(`Use account ${name}?`))
        build(name);
}
