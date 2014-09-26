AngularFormus
=============
Form generator for AngularJS

Usage:
----
```

    <formus-form name="form.name"
                 model="form.data"
                 fieldsets="form.fieldsets"
                 config="form.config">
    </formus-form>
```
Install:
-------
```
bower install -S angular-formus

```

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular-formus/dist/formus.min.js"></script>
```

Available inputs:
----------------
- textbox
- texarea
- select
- radio
- checkbox
- checklist
- datetime
- message
- hidden

You can add own input types, just register template in FormusTemplatesProvider:
```
app.config(['FormusTemplatesProvider', function (FormusTemplatesProvider) {
  FormusTemplatesProvider.setTemplateUrl('color', 'views/formus/inputs/color.html');
  FormusTemplatesProvider.setTemplateUrl('group', 'views/formus/inputs/group.html');
  FormusTemplatesProvider.setTemplateUrl('file', 'views/formus/inputs/file.html');
  FormusTemplatesProvider.setTemplateUrl('gallery', 'views/formus/inputs/gallery.html');
}]);
```

Form configuration:
------------------
Example:
```
form = {
        name: "systemParametersForm",
        fieldsets: [
            {
                fields: [
                    {
                        "name": "movePayments",
                        "label": "Move Payments Straight To Cash",
                        "input": "checkbox"
                    },
                    {
                        "name": "cancelPendingAfter",
                        "label": "Automatically Cancel Pending Mode Bookings after",
                        "input": "textbox",
                        "suffix": "days"
                    }
                ]
            }
        ],
        config: {
            class: 'some-css-class',
            submit: {
                title: 'Save',
                handler: function () {
                  console.log('I\'m submited');
                }
            }
        }
      },
```
Nested fields:
-------------


