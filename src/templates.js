/**
 * Provide container for templates by input types
 */
formus.provider('FormusTemplates', function() {
    var q, cache, http, log;
    var templateMap = {
        radio: 'views/formus/inputs/radio.html',
        checkbox: 'views/formus/inputs/checkbox.html',
        checklist: 'views/formus/inputs/checklist.html',
        hidden: 'views/formus/inputs/hidden.html',
        select: 'views/formus/inputs/select.html',
        textarea: 'views/formus/inputs/textarea.html',
        textbox: 'views/formus/inputs/textbox.html',
        fieldset: 'views/formus/inputs/fieldset.html',
        message: 'views/formus/inputs/message.html',
        datetime: 'views/formus/inputs/datetime.html',
        label: 'views/formus/inputs/label.html',
        ckeditor: 'views/formus/inputs/ckeditor.html'
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
                    getTemplateUrl: getTemplateUrl
                };
            }
        ]
    };
});
