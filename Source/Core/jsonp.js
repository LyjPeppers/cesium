/*global define*/
define([
        './defaultValue',
        './DeveloperError',
        '../ThirdParty/when'
    ], function(
        defaultValue,
        DeveloperError,
        when) {
    "use strict";

    function pushQueryParameter(array, name, value) {
        array.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
    }

    /**
     * Requests a resource using JSONP.
     *
     * @exports jsonp
     *
     * @param {String} url The URL to request.
     * @param {Object} [options.parameters] Any extra query parameters to append to the URL.
     * @param {String} [options.callbackParameterName='callback'] The callback parameter name that the server expects.
     * @param {Object} [options.proxy] A proxy to use for the request. This object is expected to have a getURL function which returns the proxied URL, if needed.
     *
     * @returns {Promise} a promise that will resolve to the requested data when loaded.
     */
    var jsonp = function(url, options) {
        if (typeof url === 'undefined') {
            throw new DeveloperError('url is required.');
        }

        options = defaultValue(options, {});

        var deferred = when.defer();

        //generate a unique function name
        var functionName;
        do {
            functionName = 'jsonp' + Math.random().toString().substring(2, 8);
        } while (typeof window[functionName] !== 'undefined');

        //assign a function with that name in the global scope
        window[functionName] = function(data) {
            deferred.resolve(data);

            try {
                delete window[functionName];
            } catch (e) {
                window[functionName] = undefined;
            }
        };

        var callbackParameterName = defaultValue(options.callbackParameterName, 'callback');
        var queryParts = [];
        pushQueryParameter(queryParts, callbackParameterName, functionName);

        var parameters = defaultValue(options.parameters, {});
        for ( var name in parameters) {
            if (parameters.hasOwnProperty(name)) {
                pushQueryParameter(queryParts, name, parameters[name]);
            }
        }

        if (queryParts.length > 0) {
            if (url.indexOf('?') === -1) {
                url += '?';
            } else {
                url += '&';
            }

            url += queryParts.join('&');
        }

        var proxy = options.proxy;
        if (typeof proxy !== 'undefined') {
            url = proxy.getURL(url);
        }

        var script = document.createElement('script');
        script.async = true;
        script.src = url;

        var head = document.getElementsByTagName('head')[0];
        script.onload = function() {
            script.onload = undefined;
            head.removeChild(script);
        };

        head.appendChild(script);

        return deferred.promise;
    };

    return jsonp;
});