/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var fs = require('fs');
var minimist = require('minimist');
var lazypipe = require('lazypipe');
var replace = require('gulp-replace');
var utils = require('../utils');
var deploy = process.env.WORK_DIR;
var _ = require('lodash');
var argv = require('optimist').argv;

var knownOptions = {
    string: 'env',
    default: {
        env: process.env.NODE_ENV || 'development',
        watch: process.env.watch || false

    }
};

var options = minimist(process.argv.slice(2), knownOptions);

if (deploy != null)
{
    deploy += '/work/';
}

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var mainFile = pkg.mainFile;
if (!mainFile) {
    var parts = pkg.name.split('/');
    mainFile = parts[parts.length - 1];
}

var main = '../build/' + mainFile;
var dependenciesJson = {};

if (pkg.plugin != null)
{
    deploy = deploy || "build/";
    deploy += "plugins";
}
else
{
    if (deploy != null)
    {
        deploy += "webapps";
    }
    var dPath = 'dependencies.json';
    dependenciesJson = {dependencies: pkg.dependencies};
    if (utils.exists(dPath)) {
        _.assign(dependenciesJson, JSON.parse(fs.readFileSync(dPath, 'utf8')));
    }
}

dependenciesJson.excludes = dependenciesJson.excludes || [];
dependenciesJson.standalone = dependenciesJson.standalone || [];
dependenciesJson.directories = dependenciesJson.directories || {};
dependenciesJson.overrides = dependenciesJson.overrides || {};
var gitHash = (utils.exists('.git/') ? utils.sh('git rev-parse --short HEAD') : 'current');
var pkgVersion = (utils.exists('build/.version') ? utils.sh('cat build/.version') : '[unknown]');
var timestamp = utils.dateFormat(new Date(), '%Y-%m-%d %H:%M:%S')
var replaceAll = lazypipe()
    .pipe(function ()
    {
        return replace('@@version', pkgVersion + " " + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@js_suffix', '.js?rel=' + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@css_suffix', '.css?rel=' + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@timestamp', timestamp)
    });

var distDir = 'dist';
var bundles = {
    main: mainFile + '.js',
    tests: 'tests-bundle.js',
    examples: 'examples-bundle.js'
};

var bundleKinds = ['main', 'tests'];
if (pkg.examples) bundleKinds.push('examples');

pkg = _.assign({build: {}}, pkg);
pkg.build = _.assign({web: true}, pkg.build); // set some defaults

var mainSrc = options.srcDir || 'src';

var config = {
    deploy: deploy,
    pkg: pkg,
    bundleKinds: bundleKinds,
    bundles: bundles,
    srcDirs: {
        main: mainSrc,
        tests: 'test',
        examples: 'examples'
    },
    dependenciesJson: dependenciesJson,
    watch: options.watch,
    scheme: argv.scheme || 'http',
    host: argv.host || pkg.host || 'localhost',
    port: argv.port || pkg.port || '8101',
    prod: !process.env.DEV && options.env === 'production',
    main: main,
    replaceAll: replaceAll,
    build: {
        autoImportAll: {
            main: pkg.build.autoImportAll,
            tests: true,
            examples: true
        }
    },
    dist: {
        dir: distDir,
        main: distDir + '/main',
        tests: distDir + '/test',
        examples: distDir + '/examples'
    },
    module: {
        main: pkg.moduleName,
        tests: 'Tests',
        examples: 'Examples'
    },
    egisUiPkgName: '@egis/egis-ui',
    egisUiModuleName: 'EgisUI',
    dependsOnEgisUi: function() {
        return pkg.devDependencies && pkg.devDependencies[config.egisUiPkgName] ||
            pkg.dependencies && pkg.dependencies[config.egisUiPkgName];
    },
    addWebserver: function(deps) {
        if (argv.serve !== 'false') {
            deps.push('webserver')
        }
        return deps
    }
};

module.exports = config;
