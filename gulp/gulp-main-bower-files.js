'use strict';

// gulp-main-bower-files package code inlined and modified

var through = require('through2');
var PluginError = require('plugin-error');
var mainBowerFiles = require('main-bower-files');
var fs = require('fs');
var path = require('path');

function getBowerFolder() {
    return 'node_modules' + path.sep;
}

module.exports = function(filter, opts, callback) {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            console.warn("file is stream");
            this.emit(
                'error',
                new PluginError('gulp-main-bower-files', 'Streams are not supported!')
            );
            return cb();
        }

        if (file.isBuffer()) {
            var bowerFolder = getBowerFolder();

            if (filter.filter) {
                opts = filter;
            } else if (typeof filter === 'function') {
                callback = filter;
                opts = null;
                filter = null;
            } else if (
                typeof filter !== 'string' &&
                Array.isArray(filter) === false
            ) {
                if (typeof opts === 'function') {
                    callback = opts;
                }
                opts = filter;
                filter = null;
            } else if (typeof opts === 'function') {
                callback = opts;
                opts = null;
            }

            opts = opts || {};
            opts.filter = opts.filter || filter;
            opts.paths = opts.path || {};
            opts.paths.bowerJson = file.path;
            opts.paths.bowerDirectory = file.base = path.join(file.base, bowerFolder);

            var fileNames = mainBowerFiles(opts, callback).sort(function (a, b) {
                function extractPackageName(jsPath) {
                    var parts = jsPath.split('node_modules' + path.sep);
                    var parts2 = parts[parts.length - 1].split(path.sep);
                    var moduleName = parts2.shift();
                    return {moduleName: moduleName, rest: parts2};
                }
                function compareByOrder(name1, name2, order) {
                    order = order || [];
                    var inameA = order.indexOf(name1);
                    var inameB = order.indexOf(name2);
                    const INFINITY = 10000;
                    if (inameA < 0) {
                        inameA = INFINITY;
                    }
                    if (inameB < 0) {
                        inameB = INFINITY;
                    }
                    var res;
                    if (inameA < inameB) {
                        res = -1;
                    } else if (inameA > inameB) {
                        res = 1;
                    } else {
                        // names are equal
                        res = 0;
                    }
                    return res;
                }
                var da = extractPackageName(a);
                var db = extractPackageName(b);
                var moduleNameA = da.moduleName;
                var moduleNameB = db.moduleName;
                var res;
                if (moduleNameA === moduleNameB) {
                    var order = (opts.overrides[moduleNameA] || {}).main
                    res = compareByOrder(da.rest.join('/'), db.rest.join('/'), order);
                } else {
                    res = compareByOrder(moduleNameA, moduleNameB, opts.order);
                }

                return res;
            });

            fileNames.forEach(function(fileName) {
                var newFile = file.clone();
                newFile.path = fileName;
                newFile.contents = fs.readFileSync(newFile.path);
                newFile.stat = fs.statSync(newFile.path);
                this.push(newFile);
            }, this);
        } else {
            console.warn("it's not a stream and not a buffer")
        }

        cb();
    });
};
