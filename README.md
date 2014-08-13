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


