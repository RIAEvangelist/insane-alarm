var NwBuilder = require('nw-builder');
var nw = new NwBuilder(
    {
        files: './src/**/**', // use the glob format
        platforms: ['osx', 'win','linux'],
        winIco: './src/app/resources/icons/-128.ico',
        macZip:true,
        version:'0.12.2'
    }
);

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(
    function () {
        console.log('all done!');
    }
).catch(
    function (error) {
        console.error(error);
    }
);
