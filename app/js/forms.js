var formsConfiguration = {
    firstForm: {
        title: 'Info',
        fieldset: {
            fields: [
                {
                    name: 'id',
                    label: ' ID',
                    input: 'textbox',
                    readonly: true,
                    validators: {
                        required: true
                    }
                },
                {
                    name: 'name',
                    label: 'Name',
                    input: 'textbox',
                    validators: {
                        required: true
                    }
                },
                {
                    name: 'website',
                    label: 'Website',
                    input: 'textbox',
                    validators: {
                        required: true,
                        url: true
                    }
                },
                {
                    name: 'address',
                    label: 'Address',
                    input: 'textarea',
                    validators: {
                        required: true
                    }
                },
                {
                    name: 'phone',
                    label: 'Phone',
                    input: 'textbox',
                    validators: {
                        required: true,
                        phone: true
                    }
                },
                {
                    name: 'fax',
                    label: 'Fax',
                    input: 'textbox',
                    validators: {
                        required: true,
                        phone: true
                    }
                },
                {
                    name: 'currency',
                    label: 'Currency',
                    input: 'select',
                    items: [
                        {value: 'aud', title: 'AUD'},
                        {value: 'usa', title: 'USA'}
                    ],
                    validators: {
                        required: true
                    }
                },
                {
                    name: 'timezone',
                    label: 'Timezone',
                    input: 'select',
                    validators: {
                        required: true
                    },
                    items: [
                        {
                            value: 1,
                            title: 'ACT'
                        },
                        {
                            value: 2,
                            title: 'North'
                        },
                        {
                            value: 3,
                            title: 'NSW'
                        },
                        {
                            value: 4,
                            title: 'Queensland'
                        },
                        {
                            value: 5,
                            title: 'South'
                        },
                        {
                            value: 6,
                            title: 'Victoria'
                        },
                        {
                            value: 7,
                            title: 'West'
                        }
                    ]
                }
            ]
        }
    },
}