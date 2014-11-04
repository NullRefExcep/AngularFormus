# AngularFormus
[![Bower version](https://img.shields.io/badge/bower-v0.0.2-brightgreen.svg)](https://github.com/NullRefExcep/AngularFormus/releases)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://tldrlegal.com/license/mit-license)

Easy and extensible forms generator for AngularJS
## Usage
Form directive render form by configuration:
```html
<formus-form name="form.name" 
    model="form.data" 
    fieldsets="form.fieldsets" 
    config="form.config">
</formus-form>
```
### Install
```
$ bower install -S angular-formus
```
Add a `<script>` to your `index.html`:
```html
<script src="/bower_components/angular-formus/dist/formus.min.js"></script>
```
and add Formus module as dependency to Your application:
```js
angular.module('app', ['formus']);
```

### Form configuration

Example:
```js
form = {
    name: "systemParametersForm",
    fieldsets: {
        fields: [{
            "name": "movePayments",
            "label": "Move Payments Straight To Cash",
            "input": "checkbox"
        }, {
            "name": "cancelPendingAfter",
            "label": "Automatically Cancel Pending Mode Bookings after",
            "input": "textbox",
            "suffix": "days"
        }]
    },
    config: {
        class: 'some-css-class',
        submit: {
            title: 'Save',
            handler: function() {
                console.log('I\'m submitted');
            }
        }
    }
}
```
### Field configuration
Form must has one general field, which contain others fields
Example of field declaration:
```js
{
  name:'nameOfFieldInModel', // string
  label: 'label', // string
  fields: [] //array of objects
  input:'typeOfInput' // string 
}
```
Each field can contain own nested fields.
All field attributes are optional except `input`
If `name` attributes don't set, that field must conatain nested fields (attribute `fields`)
You can add custom attributes, they are available in view at object config
For field can be override linker. E.g:
```js
{
  name:'name',
  linker:function($scope, $element, $attr, $http /**Some other services**){}
}
```

### Available inputs 
- fieldset (container for other fields)
- textbox
- texarea
- select
- checkbox 

### Customization

Formus allow customize all elements of module

#### Templates

You can add or override own input templates, just register template in FormusTemplatesProvider:
```js
app.config(['FormusTemplatesProvider', function (FormusTemplatesProvider) {
  FormusTemplatesProvider.setTemplateUrl('color', 'views/formus/inputs/color.html');
  FormusTemplatesProvider.setTemplateUrl('group', 'views/formus/inputs/group.html');
  FormusTemplatesProvider.setTemplateUrl('file', 'views/formus/inputs/file.html');
  FormusTemplatesProvider.setTemplateUrl('gallery', 'views/formus/inputs/gallery.html');
}]);
```

#### Validation
Formus allow validate inputs. Validators list can setted to every field. For example:
```js
{
  name: 'title',
  input: 'textbox',
  validators: {
    required: true /** Key - validator name, Value - options 
  }
}
``` 
Available validators contained in FormusValidator service.
Example of adding custom validator:
```js
app.config(['FormusValidatorProvider', function (FormusValidatorProvider) {
  FormusValidatorProvider.set('numeric', function (value, config, arg) {
    if (value) {
      if (!tools.validateNumerical(value)) {
        return config.label + ' must be numerical';
      }
      if (typeof(arg) === 'object') {
        if ((angular.isDefined(arg.min)) && (value < arg.min)) {
          return config.label + ' must be > ' + arg.min;
        }
      }
    }
    return null;
  });
}]);
```
Validator function can takes three params:
- field value
- field config
- validator options

This validator can take options as object with property `min`, e.g:
```js
validators: {numeric: {min:0}}
```

##### Events
Formus has validation event on end validation:
```js
$rootScope.$on('Formus.validatedForm', function(event, name, isValid) {
  /*Some stuff*/
});
``` 
Alos You can validate form without submit:
```js
$rootScope.$broadcast('Formus.validateForm', 'myFormName');
```

#### Display back-end errors
For showing errors that return from server You can use attribute `errors` in `formus-form` directive.
Errors must be object with properties named as form fields and errors it's array of strings, e.g: 
```js
{
  name:['Name must be longer']
}
```
FormusHelper has special method for extracting errors from response, it compatibility with Yii2 response.
Example of setting errors:
```js
form.config.submit.handler = function() {
  return save().then(function() {
     $state.go('^.list');
  }).catch(function(response) {
    form.errors = FormusHelper.extractBackendErrors(response);
  });
};
```

#### Default Configurations

FormusConfig service allows to set default configurations for every type of input.
Setter take two params:
- name of filed
- callback which must return config object

```js
app.config(['FormusConfigProvider', function (FormusConfigProvider) {
  FormusConfigProvider.set('datetime', function () {
    return {
      minView: 0,
      startView: 0,
      dataType: 'number',
      dateFormat: 'shortDate'
    }
  });
}]);
```

### Features

#### Nested fields:

You can create form with nested fields:
```js
form = {
    fieldsets: {
        fields: [
            {"name": "val0", "label": "Text Value", "input": "checkbox"},
            {"name": "someExtend", "fields": [
                    {"name": "val1", "label": "Nested Value #1", "input": "textbox"},
                    {"name": "val2", "label": "Nested Value #2", "input": "select","items":  [
                            {"value":1, "title":"opt 1"},
                            {"value":2, "title":"opt 2"}
                        ]
                    },
                ]
            }
        ]
    }
};
```
As result get model:
```js
{
    val0: true,
    someExtend:{
        val1: 'some text',
        val2: 2
    }
}

```
Also You can use dot notation:
```js
form = {
    fieldsets: {
        fields: [
            {"name": "base.first", "label": "Some Value", "input": "textbox"},
            {"name": "base.second", "label": "Some Value#2", "input": "textbox"},
            {"name": "other.value", "label": "Some Value#3", "input": "checkbox"},
        ]
    }
};
```
Result model:
```js
{
    base:{
        first: 'text val',
        first: 'text val2',
    },
    other:{
        value: false
    }
}
```

#### Forms Container

For comfortable work with large number of forms You can use FormusContainer.
This service provide global storage for form configs.
Configuration:
```js
var formsConfiguration = {form1:{/**...**/}, form2:{/**...**/}};
app.constant('FORMS_CONFIG', formsConfiguration);

app.config(['FormusContainerProvider', 'FORMS_CONFIG', function (FormusContainerProvider, FORMS_CONFIG) {
  FormusContainerProvider.setContainer(FORMS_CONFIG);
}]);
```
After configuration You can use FormusContainer in controller:
```js
var myCtrl = function($scope, FormusContainer){
    $scope.form = FormusContainer.get('form1');
}
```
Before get form config, FormusContainer merge it with default. This allow You to declare only necessary properties of forms. Not declared properties will have default values.
To change the default values must be configured FormusConfig (set with key `form`):
```js
app.config(['FormusConfigProvider', function (FormusConfigProvider) {
  FormusConfigProvider.set('form', function () {
    return {
        name: 'default-name',
        fieldset: { fields: [] },
        data: {},
        config: {
            buttons: [],
            submit: { title: 'Save', handler: function() {} }
        }
    }
  });
}]);
```
#### Linkers

You can set custom linkers for special input types:
```js
app.config(['FormusLinkerProvider', function (FormusLinkerProvider) {
    FormusLinkerProvider.setLinker('gallery', function ($scope, $element, fileUpload) {
        $scope.uploadImage = function () {
          if (fileUpload.isValid($element.find('.imgFileInput'))) {
            alert('Select file');
          } else {
            fileUpload.upload($element.find('.imgFileInput')).then(function (response) {
              $scope.model.push(response.data.url);
            });
          }
        };
        $scope.removeImage = function (index) {
          $scope.model.splice(index, 1);
        };
        $scope.afterLoadTemplate = function () {
          if (!Array.isArray($scope.model)) {
            $scope.model = [];
          }
        }
    });
}]);
```
It's easy way to create Your custom input types

## License
The MIT License


