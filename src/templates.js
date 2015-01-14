/**
 * Provide container for templates by input types
 */
formus.provider('FormusTemplates', function() {
    var q, cache, http, log;
    var templateMap = {
        form: 'formus/form.html',
        wrapper: 'formus/inputs/wrapper.html',
        radio: 'formus/inputs/radio.html',
        checkbox: 'formus/inputs/checkbox.html',
        checklist: 'formus/inputs/checklist.html',
        hidden: 'formus/inputs/hidden.html',
        select: 'formus/inputs/select.html',
        textarea: 'formus/inputs/textarea.html',
        textbox: 'formus/inputs/textbox.html',
        fieldset: 'formus/inputs/fieldset.html',
        button: 'formus/inputs/button.html',
        label: 'formus/inputs/label.html',
        message: 'formus/inputs/message.html',
    };

    /**
     * @param name string | object (name: Url)
     * @param templateUrl
     */
    var setTemplateUrl = function(name, templateUrl) {
        if (typeof name === 'string') {
            templateMap[name] = templateUrl;
        } else {
            angular.forEach(name, function(templateUrl, name) {
                setTemplateUrl(name, templateUrl);
            });
        }
    };

    /**
     * Check if exist template with name
     * @param name
     */
    var has = function(name) {
        return typeof(templateMap[name]) !== 'undefined';
    };

    /**
     * @param name
     * @returns string
     */
    var getTemplateUrl = function(name) {
        return templateMap[name];
    };

    /**
     * Load template by url
     * @param templateUrl
     */
    var load = function(templateUrl) {
        var deferred = q.defer();
        http.get(templateUrl, {
            cache: cache
        }).then(function(response) {
            deferred.resolve(response.data);
        }, function() {
            log.error('Problem with loading template for ' + templateUrl);
            deferred.reject();
        });
        return deferred.promise;
    };

    /**
     * Get template by name
     * @param name
     */
    var get = function(name) {
        return load(getTemplateUrl(name));
    };

    return {
        setTemplateUrl: setTemplateUrl,
        $get: ['$q', '$http', '$templateCache', '$log',
            function($q, $http, $templateCache, $log) {
                q = $q;
                http = $http;
                cache = $templateCache;
                log = $log;
                return {
                    has: has,
                    get: get,
                    load: load,
                    getUrl: getTemplateUrl
                };
            }
        ]
    };
});
