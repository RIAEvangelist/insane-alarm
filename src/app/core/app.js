/**
 * @fileOverview app framework
 * @module core
 */

/**
 * check for chrome variable to be defnined (safary)
 */
if (typeof chrome === 'undefined') {
    chrome = false;
}

/**
 * @class app
 * @type Function|app_L10.appAnonym$2
 */
var app = (
    function(){

/************\
    Scope
\************/
        var config={
            corePath: 'app/core/',
            modulesPath : 'app/module/',
        };


        var modules,
            constructors={},
            moduleQueue = {},
            events=[],
            dataStore={
                hasWebkitSpeech:(document.createElement('input').hasOwnProperty('webkitSpeech')),
                hasSpeech:(document.createElement('input').hasOwnProperty('speech')),
                HTML:{},
                JS:{},
                CSS:{}
            };

        if (!history) {
            history = {};
        }

        if (!history.pushState) {
            history.pushState = function (stateObject, screen) {
                history.state = stateObject;
            };
            history.state = {};
        }

        /**
         * set config object base on user config properties
         *
         * @memberOf app
         * @function setConfig
         * @param {object} userConfig
         * @returns {void}
         */
        function setConfig(userConfig) {
            for (var property in userConfig) {
                if (userConfig.hasOwnProperty('property')) {
                    config[property] = userConfig[property];
                } else {
                    return;
                }
            }
        }

/************\
    Modules
\************/
        /**
         * get module list base on html class element
         *
         * @memberOf app
         * @function getModules
         * @returns {void}
         */
        function getModules() {
            modules = document.getElementsByClassName('appModule');
        }

        /**
         * method to build modules
         *
         * @memberOf app
         * @function buildModules
         * @param {object} elements
         * @returns {void}
         */
        function buildModules(elements) {
            if (!elements) {
                elements = modules;
                if (!elements) {
                    elements = [];
                }
            }

            if (!elements[0]) {
                elements = [elements];
            }

            if( !elements[0].getAttribute) {
                return;
            }

            var moduleCount=elements.length;

            for(var i=0; i<moduleCount; i++){
                var el=elements[i];
                var moduleType=el.getAttribute('data-moduletype');

                if(!constructors[moduleType]){
                    (
                        function (config, moduleType, moduleQueue, el) {
                            setTimeout(
                                function(){
                                    if(moduleQueue[moduleType]) {
                                        return;
                                    }

                                    var module = config.modulesPath + moduleType + '/module';
                                    moduleQueue[moduleType] = true;

                                    var js = document.createElement('script');
                                    js.async = true;
                                    js.setAttribute('src', module + '.js');
                                    document.head.appendChild(js);
                                    dataStore.JS[moduleType] = js.outerHTML;

                                    if (el.getAttribute('data-css') != 'true') {
                                        return;
                                    }

                                    var css = document.createElement('link');
                                    css.rel = 'stylesheet';
                                    css.type = 'text/css';
                                    css.setAttribute('href', module + '.css');
                                    document.head.appendChild(css);
                                    dataStore.CSS[moduleType] = css.outerHTML;
                                },
                                0
                            );
                        }
                    )(config,moduleType,moduleQueue,el);

                    if(el.getAttribute('data-html')=='true') {
                        fetchModuleHTML(moduleType);
                    }
                    continue;
                }

                if (app.data.HTML[moduleType]) {
                    new HTMLLoaded(el, moduleType);
                }

                if (
                    (el.innerHTML !== '' && el.getAttribute('data-html') == 'true') ||
                    el.getAttribute('data-html') != 'true')
                {
                    constructors[moduleType](el);
                    continue;
                } else {
                    (
                        function(){
                            setTimeout(
                                function(){
                                    //console.log(el);
                                    buildModules(el);
                                },
                                50
                            );
                        }
                    )(el);
                }
            }
        }

        /**
         * @memberOf app
         * @function fetchModuleHTML
         * @param {type} moduleType
         * @returns {undefined}
         */
        function fetchModuleHTML(moduleType){
            var xmlhttp;
            xmlhttp = new XMLHttpRequest();
            (
                function () {
                    xmlhttp.onreadystatechange = function () {
                        if (
                            xmlhttp.readyState == 4 &&
                            (
                                xmlhttp.status === 200 ||
                                xmlhttp.status === 0
                            )
                        ) {
                            dataStore.HTML[moduleType] = xmlhttp.responseText;
                            new HTMLLoaded(
                                document.querySelectorAll('[data-moduletype="' + moduleType + '"]'),
                                moduleType
                            );
                        }
                    };
                }
            )(moduleType);

            xmlhttp.open('GET', config.modulesPath + moduleType + '/module.html', true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.send();
        }

        /**
         * @memberOf app
         * @function HTMLLoaded
         * @param {array} modules
         * @param {string} moduleType
         * @returns {void}
         */
        function HTMLLoaded(modules, moduleType) {
            if (!modules.length) {
                modules = [modules];
            }
            var totalModules = modules.length;
            for (var i = 0; i < totalModules; i++) {
                var module = modules[i];
                module.innerHTML = dataStore.HTML[moduleType];
                findAndInitDynamicModules(module);
            }

            return false;
        }

        /**
         * @memberOf app
         * @function deferredLoad
         * @param {string} type
         * @returns {void}
         */
        function deferredLoad(type) {
            buildModules(document.querySelectorAll('[data-moduletype="' + type + '"]'));
        }

        /**
         * render compiled app
         * @memberOf app
         * @function appendDOMNode
         * @returns {void}
         */
        function renderCompiledApp(){
            var modules=Object.keys(constructors);
            for(var i=0; i<modules.length; i++){
                constructors[modules[i]](
                    document.getElementById(modules[i]+'-module')
                );
            }
        }

        /**
         *
         * @memberOf app
         * @function appendDOMNode
         * @param {object} el
         * @returns {undefined}
         */
        function appendDOMNode(el){
            (
                function () {
                    setTimeout(
                        function () {
                            document.querySelector(
                                el.getAttribute('data-dompath')
                                ).appendChild(el);
                        }, 0
                    );
                }
            )(el);
        }

        /**
         * @memberOf core
         * @function showModuleGroup
         * @param {string} screen : the name of the screen or group of modules
         * from the app.data.layout object you wish to see
         * @param {object} stateObject : defaults to {screen:the passed screen name}
         * @returns {undefined}
         */
        function showModuleGroup(screen,stateObject){
            if(!app.data.layout) {
                return;
            }
            if (!screen) {
                screen = app.data.layout.startAt;
            }
            if (!stateObject) {
                stateObject = {
                    screen: screen
                };
            }
            if (!stateObject.screen) {
                stateObject.screen = screen;
            }
            var modules=document.getElementsByClassName('appModule');
            var screenContains = Object.keys(
                app.data.layout.modules.ui[screen]
            );

            for(var i=0; i<modules.length; i++){
                var type=modules[i].getAttribute(
                    'data-moduletype'
                );
                //console.log(type)
                if(screenContains.indexOf(type)>-1){
                    modules[i].classList.remove('hidden');
                    continue;
                }

                modules[i].classList.add('hidden');
            }

            triggerEvent(
                'app.navigated',
                stateObject
            );

            history.pushState(
                stateObject,
                screen,
                '#'+screen
            );
        }

        // if app.navigate event triggered, we want to show module group
        registerEvent('app.navigate', showModuleGroup);

        window.addEventListener(
            'popstate',
            function(e){
                var state = e.state;
                if (!state) {
                    state = {};
                }

                if (!state.screen) {
                    state.screen = document.location.hash.slice(1);
                }

                showModuleGroup(state.screen, state);
            }
        );

        /**
         * initialize layout base on the layout object injected
         *
         * @memberOf app
         * @function layoutAppt
         * @param {object} layout object that represent layout and logic
         * @returns {void}
         * @see app.layout.json
         * @see loadLayout
         */
        function layoutApp(layout) {

            if (!layout.lib) {
                layout.lib = [];
            }

            if (!layout.modules) {
                layout.modules = {};
            }

            for (var i = 0; i < layout.lib.length; i++) {
                var lib;
                switch (layout.lib[i].type) {
                    case 'css' :
                        lib = document.createElement('link');
                        lib.setAttribute('href', layout.lib[i].path);
                        lib.setAttribute('rel', 'stylesheet');
                        dataStore.CSS[layout.lib[i].path] = lib.outerHTML;
                        break;
                    case 'js':
                        lib = document.createElement('script');
                        lib.setAttribute('async', true);
                        lib.setAttribute('src', layout.lib[i].path);
                        dataStore.JS[layout.lib[i].path] = lib.outerHTML;
                        break;
                }
                document.head.appendChild(lib);
            }

            // building logic modules
            for (var j = 0; j < layout.modules.logic.length; j++) {
                appendDOMNode(
                    createModuleElement(layout.modules.logic[j], 'false', 'false')
                );
            }

            // check if dataStore compiled is set, if not try to retrieve it from the html element
            dataStore.compiled = document.querySelector('html').classList.contains('compiled-app');
            if(dataStore.compiled) {
              return;
            }

            var fullList = {};
            var screenList = Object.keys(layout.modules.ui);
            for (var k = 0; k < screenList.length; k++) {
                var screenModules = Object.keys( layout.modules.ui[screenList[k]] );
                for (var l = 0; l < screenModules.length; l++) {
                    fullList[screenModules[l]] = true;
                }
            }

            var layoutModules = Object.keys(fullList);
            for (var n = 0; n < layoutModules.length; n++) {
                var tempNewModule = createModuleElement( layoutModules[n] );
                appendDOMNode(tempNewModule);
            }
        }

        /**
         * method to create html module element
         *
         * @memberOf app
         * @function createModuleElement
         * @param {string} name modurle name
         * @param {string} html html for the module
         * @param {string} css css file
         * @returns {app_L14.createModuleElement.newModule|Element}
         */
        function createModuleElement(name, html, css) {
            var newModule = document.createElement('div');
            if(!html) {
                html='true';
            }
            if(!css) {
                css='true';
            }
            newModule.id=name+'-module';
            newModule.classList.add(
                'appModule',
                'hidden',
                name+'-module'
            );

            newModule.setAttribute(
                'data-dompath',
                'body'
            );
            newModule.setAttribute(
                'data-moduletype',
                name
            );
            newModule.setAttribute(
                'data-html',
                html
            );
            newModule.setAttribute(
                'data-css',
                css
            );

            return newModule;
        }

        /**
         * @memberOf app
         * @param {string} moduleType
         * @returns {Boolean}
         */
        function checkModuleExists(moduleType){
            return !!!constructors[moduleType];
        }

        /**
         * @memberOf app
         * @param {object} parent
         * @returns {void}
         */
        function findAndInitDynamicModules(parent){
            buildModules(parent.querySelectorAll('[data-moduletype]'));
        }

        /**
         * @memberOf app
         * @function addConstructor
         * @param {string} type
         * @param {function} moduleInit
         * @returns {void}
         */
        function addConstructor(type, moduleInit){
            if(constructors[type]) {
                return;
            }

            constructors[type] = moduleInit;
            if(document.readyState == 'complete') {
                deferredLoad(type);
            }
        }

        /**
         * @memberOf app
         * @function initModules
         * @returns {void}
         */
        function initModules(){
            switch(document.readyState){
                case 'interactive' :
                    //dom not yet ready
                    break;
                case 'complete' :
                    getModules();
                    buildModules();
                    break;
            }
        }

/************\
    Utils
\************/

        /*
         * @memberOf app
         * @function fillTemplate
         * @param {string} id of element to fetch innerHTML as contents for template or raw string to be used as template if rawString set to true
         * @param {object} values should contain the key value pairs for all template Data
         * @param {bool} rawString use id as a raw html string
         * @param {bool} asString return as string or not
         * @returns {DomElement|string} if asString is false or not specified will return Filled out Template Element, if asString is true will return a filled out template string
         */
        function fillTemplate(id, values, rawString, asString) {
            var template = id;

            if (!id) {
                throw new AppError('Templates must specify either id or a string+rawString flag', 'app.template');
            }
            if(!rawString) {
                template=document.getElementById(id).innerHTML;
            }

            var keys=Object.keys(values);
            for(var i=0; i<keys.length; i++){
                var regEx=new RegExp(
                    '\\$\\{'+keys[i]+'\\}',
                    'g'
                );

                template=template.replace(
                    regEx,values[keys[i]]
                );
            }

            var completeTemplate=template;

            if (!asString) {
                completeTemplate = document.createElement('div');
                completeTemplate.innerHTML = template;
                completeTemplate = completeTemplate.querySelector('*');
            }

            return completeTemplate;
        }

        /*
         * @memberOf app
         * @param {string} type
         * @returns {string} compiledApp
         */
        function getCurrentCompiledState(type, saveName) {
            var html='<html class="compiled-app"><head>${head}</head><body>${body}</body></html>';
            var defaults = '<script src="app/core/app.js"></script>' +
                '<script src="app/core/app.layout.js"></script>';

            if (type === 'test') {
                defaults += '<link rel="stylesheet" type="text/css" href="jasmine/lib/jasmine-2.0.2/jasmine.css">' +
                    '<script type="text/javascript" src="jasmine/lib/jasmine-2.0.2/jasmine.js"></script>' +
                    '<script type="text/javascript" src="jasmine/lib/jasmine-2.0.2/jasmine-html.js"></script>' +
                    '<script type="text/javascript" src="jasmine/lib/jasmine-2.0.2/boot.js"></script>' +
                    '<script src="app/core/app.test.js"></script>';
            }

            this.body='';
            this.head='';
            var list=[
                'HTML',
                'CSS',
                'JS'
            ];

            /**
             * compile module
             * @param {string} name
             * @param {string} content
             * @returns {void}
             */
            function compileModule(name, content){

                var module=createModuleElement(name);
                module.innerHTML=content;
                this.body+=module.outerHTML;
            }

            for(var j=0; j<list.length; j++){
                var keys=Object.keys(dataStore[list[j]]);
                for(var i=0; i<keys.length;i++){
                    if (list[j] != 'HTML') {
                        //console.log(list[j],keys[i]);
                        this.head += dataStore[
                            list[j]
                        ][
                            keys[i]
                        ];
                        continue;
                    }

                    compileModule.call(
                        this,
                        keys[i],
                        dataStore[
                            list[j]
                        ][
                            keys[i]
                        ]
                    );
                }
            }

            var compiledApp = fillTemplate(
                html,
                {
                    head:defaults+this.head,
                    body:this.body
                },
                true,
                true
            ).replace(
                /\s+/g,
                ' '
            );

            if(saveName){
                var download = document.createElement('a');
                download.href='data:application/octet-stream,' + encodeURIComponent(compiledApp);
				download.download = saveName+'.html';
				download.click();
            }

            return compiledApp;
        }

/************\
    Error
\************/

        /**
         * global application error
         * @memberOf module:core
         * @class AppError
         * @param {string} message error messaage
         * @param {string} type error type
         * @returns {AppError}
         */
        function AppError(message, type) {
            this.name = 'AppError';
            this.message = message || 'Application Error Message';
            this.type = type || 'Generic Application Error'; // possible error types are User, Api, etc...
        }
        AppError.prototype = new Error();
        AppError.prototype.constructor = AppError;
        window.AppError = AppError;

/************\
    Storage
\************/
        /**
         * @class Storage
         * @memberOf app
         * @returns {app_L14.Storage.storage}
         */
        function Storage(){

            /**
             * interface to the storage class
             * @memberOf Storage
             * @type object
             */
            var storage = {
                get: false,
                set: false,
                remove: false,
                clear: false
            };

            /**
             * @memberOf Storage
             * @param {object} callback
             * @returns {void}
             */
            function fetchAllData(callback){
                var response={};
                for (var key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                       response[key] = localStorage.getItem(key);
                    }
                }
                runCallback(callback, response);
            }

            /**
             * use local storage functionality
             * @memberOf Storage
             * @param {string} command
             * @param {object} data
             * @param {function} callback
             * @returns {void}
             */
            function useLocalStorage(command, data, callback) {
                if(!command || !data) {
                    return ;
                }

                var response = {};
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (command !== 'setItem') {
                            response[key] = localStorage[command](key);
                            continue;
                        }
                        response[key] = localStorage[command](key, data[key]);
                    }
                }

                if (command != 'getItem') {
                    response = undefined;
                }
                runCallback(callback,response);
            }

            /**
             * @memberOf Storage
             * @param {object|function} callback
             * @param {object} response
             * @returns {void}
             */
            function runCallback(callback, response) {
                if (!callback) {
                    return;
                }
                callback(response);
            }

            /**
             * @memberOf Storage
             * @param {object|function} data data to be retrieved
             * @param {object} callback
             * @returns {void}
             */
            function html5get(data, callback){
                if(!callback) {
                    return;
                }
                if (data === null) {
                    fetchAllData(callback);
                    return;
                }

                if(typeof data === 'string'){
                    var response={};
                    response[data]=localStorage.getItem(data);
                    runCallback(
                        callback,
                        response
                    );
                    return;
                }

                useLocalStorage('getItem',data,callback);
            }

            /**
             * @memberOf Storage
             * @param {mix} data data to be retrieved
             * @param {object|function} callback
             * @returns {void}
             */
            function html5set(data, callback) {
                useLocalStorage('setItem', data, callback);
            }

            /**
             * remove datat by key
             *
             * @memberOf Storage
             * @function html5remove
             * @param {mix} data
             * @param {object|function} callback
             * @returns {void}
             */
            function html5remove(data, callback) {
                if (typeof data === 'string') {
                    localStorage.removeItem(data);
                    runCallback(
                        callback,
                        undefined
                        );
                    return;
                }
                useLocalStorage('remove', data, callback);
            }

            /**
             * clear local storage
             *
             * @memberOf Storage
             * @param {object|function} callback
             * @returns {void}
             */
            function html5clear(callback) {
                localStorage.clear();
                runCallback(
                    callback,
                    undefined
                    );
            }

            /**
             * get data from chrome local storage
             *
             * @memberOf Storage
             * @param {mix} data
             * @param {object|function} callback
             * @returns {void}
             */
            function chromeGet(data,callback){
                chrome.storage.local.get(data,callback);
            }

            /**
             * set chrome local storage data
             * @param {mix} data
             * @param {object|function} callback
             * @returns {void}
             */
            function chromeSet(data,callback){
                chrome.storage.local.set(data,callback);
            }

            /**
             *
             * @param {type} data
             * @param {type} callback
             * @returns {undefined}
             */
            function chromeRemove(data,callback){
                chrome.storage.local.remove(data,callback);
            }

            function chromeClear(callback){
                chrome.storage.local.clear();
            }

            if (localStorage) {
                storage.get = html5get;
                storage.set = html5set;
                storage.remove = html5remove;
                storage.clear = html5clear;
            }

            if (window.chrome) {
                if (!chrome.storage && !localStorage) {
                    console.log('no supported storage methods');
                    return storage;
                }
                if (!chrome.storage) {
                    return storage;
                }
                storage.get = chromeGet;
                storage.set = chromeSet;
                storage.remove = chromeRemove;
                storage.clear = chromeClear;
            }

            return storage;
        }


/************\
    Events
\************/

        /**
         * Register event listener. This will create the event if it does not already exist.
         *
         * @memberOf app
         * @param {string} eventName - name of event to be bound
         * @param {function} handler - function to be executed when event triggered
         * @param {bool} prepend - inject this handler at the beginning of the event chain
         *
         * @returns {void}
         */
        function registerEvent(eventName, handler, prepend) {
            if (!events[eventName]) {
                events[eventName] = [];
            }

            var action='push';

            if(prepend){
              action='unshift';
            }

            events[eventName][action](handler);
        }

        /**
         * remove binding from the event
         *
         * @memberOf app
         * @function removeEvent
         *
         * @param {string} eventName
         * @param {Object} handler
         * @returns {void}
         */
        function removeEvent(eventName, handler){

            if(!handler){
                delete events[eventName];
                return;
            }

            var event=events[eventName];
            if (event) {
                for (var i = 0; i < event.length; i++) {
                    if (event[i] !== handler) {
                        continue;
                    }
                    event.splice(i, 1);
                }
            }
        }

        /**
         * trigger event by name
         *
         * @memberOf app
         * @function triggerEvent
         * @param {string} eventName name of the event to be trigger
         * @returns {void}
         */
        function triggerEvent(eventName) {
            if (!events[eventName]) {
                return;
            }

            var totalEvents = events[eventName].length,
                args = Array.prototype.slice.call(arguments, 1);

            for (var i = 0; i < totalEvents; i++) {
                (
                    function (event) {
                        setTimeout(
                            function () {
                                event.apply(null, args);
                            },
                            0
                        );
                    }
                )(events[eventName][i], args);
            }
        }

        window.exports = addConstructor;

        /**
         * loading layout file
         */
        document.addEventListener(
            'DOMContentLoaded',
            loadAndBuildLayout
        );

        /**
         * load layout data from app.layout.json file
         *
         * @memberOf app
         * @function loadAndBuildLayout
         * @returns {void}
         */
        function loadAndBuildLayout() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', config.corePath + 'app.layout.json', true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        app.data.layout = JSON.parse(xhr.responseText);
                        layoutApp(app.data.layout);

                        // start building modules
                        setTimeout(
                            function () {
                                dataStore.compiled = document.querySelector('html').classList.contains('compiled-app');
                                if (!dataStore.compiled) {
                                    initModules();
                                    return;
                                }
                                renderCompiledApp();
                            },
                        0);

                        // give some time for the layout rendering to occur
                        setTimeout(
                            function () {
                                if (history.state && history.state.screen) {
                                    app.navigate(history.state.screen, history.state);
                                    return;
                                }
                                app.navigate(app.data.layout.startAt);
                            },
                        50);

                    } else {
                        console.error('app.layout.json does not exists or not properly loaded');
                    }
                }
            };
            xhr.send();
        }

        return {
            register        : addConstructor,
            layout          : layoutApp,
            navigate        : showModuleGroup,
            createModule    : createModuleElement,
            build           : buildModules,
            inject          : appendDOMNode,
            config          : setConfig,
            on              : registerEvent,
            off             : removeEvent,
            template        : fillTemplate,
            trigger         : triggerEvent,
            error           : AppError,
            compile         : getCurrentCompiledState,
            exists          : checkModuleExists,
            data            : dataStore,
            storage         : new Storage(),
            _events         : events
        };
    }
)();

