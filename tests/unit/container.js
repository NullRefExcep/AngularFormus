describe('Formus Container', function() {
    var container;
    var forms = {
        parent: {
            custom: 'Value',
            config: {
                submit: {
                    class: 'btn',
                    title: 'Find'
                }
            }
        },
        child: {
            parent: 'parent',
            config: {
                submit: {
                    class: 'btn btn-primary'
                }
            }
        }
    };

    beforeEach(module('formus', function(FormusContainerProvider) {
        FormusContainerProvider.setContainer(forms);
    }));

    beforeEach(inject(function(FormusContainer) {
        container = FormusContainer;
    }));

    it('should extend form config from parent', function() {
        var form = container.get('child');
        expect(form.config.submit.title).toBe(forms.parent.config.submit.title);
        expect(form.custom).toBe(forms.parent.custom);
        expect(form.name).toBe('child');
    });
});
