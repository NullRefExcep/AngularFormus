var formsConfiguration = {
    firstForm: {
        title: 'Info',
        config: {
            buttons: [{
                class: 'btn btn-danger',
                title: 'Cancel'
            }],
            submit:{class:'btn btn-primary'}
        },
        fieldset: {
            fields: [{
                name: 'id',
                label: ' ID',
                input: 'textbox',
                readonly: true
            }, {
                name: 'checkValue',
                input: 'checkbox',
                label: 'Check Box',
                default: 'Yes',
                trueValue: 'Yes',
                falseValue: 'No'
            }, {
                name: 'name',
                label: 'Name',
                input: 'textbox',
                validators: {
                    required: true
                }
            }, {
                name: 'website',
                label: 'Website',
                input: 'textbox',
                default: 'mysite.com'
            }, {
                name: 'address',
                label: 'Address',
                input: 'textarea',
                rows: 2,
                validators: {
                    required: true
                }
            }, {
                name: 'currency',
                label: 'Currency',
                input: 'select',
                empty: 'Select ...',
                items: [{
                    value: 'aud',
                    title: 'AUD'
                }, {
                    value: 'usa',
                    title: 'USA'
                }],
                validators: {
                    required: true
                }
            }, {
                name: 'phone',
                label: 'Phone',
                input: 'textbox',
                validators: {
                    required: true,
                    phone: true
                }
            }, {
                name: 'fax',
                label: 'Fax',
                input: 'textbox',
                validators: {
                    required: true,
                    phone: true
                }
            }, {
                name: 'timezone',
                label: 'Timezone',
                input: 'select',
                validators: {
                    required: true
                },
                items: [{
                    value: 1,
                    title: 'ACT'
                }, {
                    value: 2,
                    title: 'North'
                }, {
                    value: 3,
                    title: 'NSW'
                }, {
                    value: 4,
                    title: 'Queensland'
                }, {
                    value: 5,
                    title: 'South'
                }, {
                    value: 6,
                    title: 'Victoria'
                }, {
                    value: 7,
                    title: 'West'
                }]
            }]
        }
    },
}
