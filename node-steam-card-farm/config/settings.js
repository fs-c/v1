module.exports = {
    /* Domain, used for generating trade keys if needed */
    domain: 'my.domain',

    /* Bot admin(s) */
    botAdmins: [
        '76561198042302314'
    ],

    /* Log levels */
    logger: {
        console: 'debug',
        file: 'error'
    },

    /* Bots */
    bots: require('../../../cardfarm-config.json'),

    /* Statistics */
    stats: true
};
