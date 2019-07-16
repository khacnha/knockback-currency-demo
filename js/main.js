requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        //requirejs
        text: 'requirejs/text',
        json: 'requirejs/json',

        jquery: 'jquery',
        // knockback
        knockout: 'knockout',
        backbone: 'backbone',
        knockback: 'knockback',

        underscore: 'lodash',
        bootstrap: 'bootstrap/js/bootstrap.min'
    },
    shim: {
        jquery: {
            exports: '$',
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        knockback: {
            deps: ['backbone', 'knockout'],
            exports: 'kb'
        },
        bootstrap: ['jquery']
    }
});
requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};
// Start the main app logic.
requirejs(['jquery', 'knockout', 'backbone', 'knockback', 'underscore'],
    function ($, ko, backbone, kb, _) {
        /**COMPONENT FORM**/
        const FormCurrencyVM = kb.ViewModel.extend({
            constructor: function (params, componentInfo) {
                // console.log(params);
                var self = this;

                var CurrencyExModel = backbone.Model.extend({
                    defaults: {
                        unit: null,
                        rate: 1
                    },
                    idAttribute: "unit"
                });

                self.price = ko.observable(1.00);
                self.formatPrice = ko.pureComputed({
                    read: function () {
                        return '$' + self.price().toFixed(2);
                    },
                    write: function (value) {
                        value = parseFloat(value.replace(/[^\.\d]/g, ""));
                        self.price(isNaN(value) ? 0 : value);
                    }
                });

                self.selectedCurrency = ko.observable();
                self.currencyExchange = kb.collectionObservable();
                require(['json!../../data/currency.json'], function(currency){
                    console.log(currency);
                    _.each(currency.rates, function (r,u) {
                        self.currencyExchange.collection().add(new CurrencyExModel({unit: u, rate: r}));
                    })
                });
                self.priceConvert = ko.pureComputed(function () {
                    if(self.selectedCurrency()){
                        var currentEx = self.currencyExchange.collection().find(function(item){
                            return item.get('unit') === self.selectedCurrency();
                        });
                        return currentEx.get('rate') * self.price();
                    }else{
                        return null;
                    }
                });
            },
            dispose: function () {
                // var self = this;
                console.log('Destroy ViewModel: FormCurrencyVM');

                //Destroy: computed

                //Destroy: subscribe

                //Clear clearInterval/clearTimeout
            }
        });
        ko.components.register('currency-form', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    return new FormCurrencyVM(params, componentInfo);
                }
            },
            template: {require: 'text!../app/files/component-currency-form.html'}
        });
        /**COMPONENT CONTAINER**/
        const ContainerVM = kb.ViewModel.extend({
            constructor: function (params, componentInfo) {
                // console.log(params, componentInfo)
                var self = this;

                self.isFormShower = ko.observable(false);
                self.onOffFormShower = function () {
                    self.isFormShower(!self.isFormShower());
                };
            },
            dispose: function () {
                console.log('Destroy ViewModel: ContainerVM');
                //Destroy: computed

                //Destroy: subscribe

                //Clear clearInterval/clearTimeout
            }
        });
        ko.components.register('currency-convert', {
            viewModel: {
                createViewModel: function(params, componentInfo) {
                    return new ContainerVM(params, componentInfo);
                }
            },
            template: {require: 'text!../app/files/component-currency-widget.html'}
        });

        /**CUSTOM BINDING**/
        ko.bindingHandlers.fadeVisible = {
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                let shouldDisplay = ko.unwrap(valueAccessor()),
                    $el = $(element);
                $el.toggle(shouldDisplay);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    console.log('Destroy custom binding');
                });
            },
            update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                let shouldDisplay = ko.unwrap(valueAccessor());
                shouldDisplay ? $(element).fadeIn() : $(element).fadeOut();
            }
        };
        ko.applyBindings();
    });