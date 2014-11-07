var app = angular.module('app', [
    'formus'
]);

app.constant('FORMS_CONFIG', formsConfiguration);

/** Set source of forms configuration */
app.config(['FormusContainerProvider', 'FORMS_CONFIG', function(FormusContainerProvider, FORMS_CONFIG) {
    FormusContainerProvider.setContainer(FORMS_CONFIG);
}]);

app.controller('MainCtrl', function($scope, FormusContainer, FormusHelper, FORMS_CONFIG, $http) {
    var form = $scope.form = FormusContainer.get('firstForm');
    $scope.src = FORMS_CONFIG.firstForm;
    form.config.buttons[0].handler = function() {
        $http.get('https://api.github.com/users').success(function(data) {
            form.fieldset.fields[4].items = FormusHelper.extractItems(data, 'id', 'login');
        });
    };
});

app.config(['FormusValidatorProvider', function(FormusValidatorProvider) {
    FormusValidatorProvider.set('match', function(value, config, arg) {
        var re;
        if (typeof(arg) === 'string') {
            re = new RegExp(arg);
        }
        if (arg instanceof RegExp) {
            re = arg;
        }
        if (!re.test(value)) {
            return config.label + ' is invalid';
        }
        return null;
    });
}]);

$(function() {
    hljs.configure({language: "javascript"});

    $('.code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
});