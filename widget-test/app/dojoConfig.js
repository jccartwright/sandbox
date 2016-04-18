var dojoConfig = {
    async: true,
    parseOnLoad: true,
    isDebug: false,
    // locale: 'en-us',
    deps: ['app/main'],

    //list local packages
    packages: [
        {
            name: "ngdc",
            location: '//maps.ngdc.noaa.gov/viewers/dijits-2.8/js/ngdc'
//                location: location.pathname.replace(/\/[^/]*$/, '') + '/../../dijits/js/ngdc'
        },
        {
            name: "app",
            location: location.pathname.replace(/\/[^/]*$/, '') + '/app'
        },
        {
            name: "ncei",
            location: location.pathname.replace(/\/[^/]*$/, '') + '/ncei'
        }

    ],

    //application-specific config
    app: {
        version: '1.0-SNAPSHOT'
    }
/*
    map: {
        '*': {
            'dojox/dgauges': 'dgauges'
        }
    }
*/
};