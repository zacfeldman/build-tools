See [CODESTYLE](CODESTYLE.md)  

## Naming Conventions / Directory Layout

```shell
build/ 		# compiled and concatenanted classes
dist/ 		# compiled JS classes
src/ 		#  ES6 and Handlebars templates
style/ 		# LESS, SASS or, CSS
resource/	# Copied as is to build directory
lib-export.js	# the entrypoint ala index.js
```

## Build Pipeline

* All bower dependencies are downloaded and concatenated into `build/dependencies.js` and `build/dependencies.css`
* ES6 files are compiled and concatenanted into `build/app.js` where 'app.js' is the `mainFile` in `package.json` 
(inferred from package's name by default)
* CSS/LESS/SASS are compliled and concatened into `build/app.css`
* In production mode all source is minified and source maps generated.

## Handlebars Templates

A Handlebar template is any file ending in `.hbs` it is available in the `TEMPLATES` global without the extension.  
A Handlebar partial is any file begining with `_` and ending in `.hbs` and is automatically registered  

## Build steps:
* export your `NPM_TOKEN`
* Copy and rename the seed_package.json to package.json (only when bootstraping new projects)
* Run `npm run setup` to install and build all required dependencies 
* Run `yarn upgrade @egis/build-tools && npm run update` to upgrade build-tools version in client project to the latest one.  
* Run `yarn add --dev my-package` to add a dependency to build-tools.  
* Run `yarn add --dev my-package && npm run update` to add/override a dependency in client project.  
* Run `yarn upgrade my-package && npm run update` to upgrade a dependency in client project.  
* Run `yarn upgrade my-package` to upgrade a dependency in build-tools. Then upgrade build-tools version in client project to use it (see above).
* Run `npm run dev` to  build files suitable for wathcing and startup a watch server
* Run `npm run build` to build a package suitable for production
* Run `npm run test` to run karma test suites


## Customizing builds using bower.json and package.json

### bower.json
All bower dependencies with main files are concatenanted together, this can be overriden in bower.json as follows:

```json 
"overrides": {
           "bootstrap": {
               "main": [
                    "dist/js/bootstrap.js",
                    "dist/css/bootstrap.css", 
                    "dist/css/bootstrap.css.map"
               ]
           },
 }   
```

To exclude certain large libraries from concatenantion list in exclude, the main files will be concated together and placed in build/<libray name>
```json
   "standalone": ["handsontable", "codemirror"]
```

To exclude libraries that have already been packaged elsewhere:
```json
"excludes": ["jquery"]
```

To copy entire directories from dependencies:

```json
"directories": {
    "fontawesome": "fonts/*",
    "bootstrap": "fonts/*"
  },
```

To create a plugin package:

```json
"plugin": "PortalApp",
```
This will create a .zip instead of a .war and place all the compiled .js file in to a subdirectory *System/plugins/{plugin}*

### Browsersync

For frontend development env our browsersync integration may be helpful. It:
* injects CSS changes immediately
* auto-reloads page in browsers if JS files are changed - including your mobile device's browser 
* supports running multiple modules in dev mode in parallel

In each *build-tools* project:  
```bash
npm run dev
```
And then after 1 or more `npm run dev` servers are running:  
```
npm run browsersync
```

If your files are being served from anything other then **localhost** e.g. **192.168.0.10**: 

```bash
npm run dev -- --host=192.168.0.10
npm run browsersync -- --proxied-host=192.168.99.10
```
