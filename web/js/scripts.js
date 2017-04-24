if (typeof pistol88 == "undefined" || !pistol88) {
    var pistol88 = {};
}

pistol88.cart = {
    init: function () {

        cartElementsCount = '[data-role=cart-element-count]';
        buyElementButton = '[data-role=cart-buy-button]';
        deleteElementButton = '[data-role=cart-delete-button]';
        truncateCartButton = '[data-role=truncate-cart-button]';

        pistol88.cart.csrf = jQuery('meta[name=csrf-token]').attr("content");
        pistol88.cart.csrf_param = jQuery('meta[name=csrf-param]').attr("content");

        jQuery(document).on('change', cartElementsCount, function () {

            var self = this,
                url = jQuery(self).data('href');

            if (jQuery(self).val() < 0) {
                jQuery(self).val('0');
                return false;
            }

            cartElementId = jQuery(self).data('id');
            cartElementCount = jQuery(self).val();
            
            pistol88.cart.changeElementCost(cartElementId, cartElementCount);
            pistol88.cart.changeElementCount(cartElementId, cartElementCount, url);
        });
        
        jQuery(document).on('spinstop', '.pistol88-cart-element-count.spinner', function () {

            var self = this,
                url = jQuery(self).data('href');

            if (jQuery(self).attr('aria-valuenow') < 0) {
                jQuery(self).attr('aria-valuenow').val('0');
                return false;
            }

            cartElementId = jQuery(self).data('id');
            cartElementCount = jQuery(self).attr('aria-valuenow');
            
            pistol88.cart.changeElementCost(cartElementId, cartElementCount);
            pistol88.cart.changeElementCount(cartElementId, cartElementCount, url);
        }); 

        jQuery(document).on('click', buyElementButton, function () {

            var self = this,
                url = jQuery(self).data('url'),
                itemModelName = jQuery(self).data('model'),
                itemId = jQuery(self).data('id'),
                itemCount = jQuery(self).data('count'),
                itemPrice = jQuery(self).data('price'),
                itemOptions = jQuery(self).data('options');

            pistol88.cart.addElement(itemModelName, itemId, itemCount, itemPrice, itemOptions, url);

            return false;
        });

        jQuery(document).on('click', truncateCartButton, function () {

            var self = this,
                url = jQuery(self).data('url');

            pistol88.cart.truncate(url);
            
            return false;
        });

        jQuery(document).on('click', deleteElementButton, function (e) {

            e.preventDefault();

            var self = this,
                url = jQuery(self).data('url'),
                elementId = jQuery(self).data('id');

            pistol88.cart.deleteElement(elementId, url);

            if (lineSelector = jQuery(self).data('line-selector')) {
                jQuery(self).parents(lineSelector).last().hide('slow');
            }

            return false;
        });
        
        jQuery(document).on('click', '.pistol88-arr', this.changeInputValue);
        jQuery(document).on('change', '.pistol88-cart-element-before-count', this.changeBeforeElementCount);
        jQuery(document).on('spinstop', '.pistol88-cart-element-before-count.spinner', this.changeBeforeElementCountAria);
        jQuery(document).on('change', '.pistol88-option-values-before', this.changeBeforeElementOptions);
        jQuery(document).on('change', '.pistol88-option-values', this.changeElementOptions);

        return true;
    },
    elementsListWidgetParams: [],
    jsonResult: null,
    csrf: null,
    csrf_param: null,
    changeElementOptions: function () {
        jQuery(document).trigger("changeCartElementOptions", this);

        var id = jQuery(this).data('id');

        var options = {};

        if (jQuery(this).is('select')) {
            var els = jQuery('.pistol88-cart-option' + id);
        }
        else {
            var els = jQuery('.pistol88-cart-option' + id + ':checked');
            console.log('radio');
        }

        jQuery(els).each(function () {
            var name = jQuery(this).data('id');

            options[id] = jQuery(this).val();
        });

        var data = {};
        data.CartElement = {};
        data.CartElement.id = id;
        data.CartElement.options = JSON.stringify(options);

        pistol88.cart.sendData(data, jQuery(this).data('href'));

        return false;
    },
    changeBeforeElementOptions: function () {
        var id = jQuery(this).data('id');
        var filter_id = jQuery(this).data('filter-id');
        var buyButton = jQuery('.pistol88-cart-buy-button' + id);

        var options = jQuery(buyButton).data('options');
        if (!options) {
            options = {};
        }

        options[filter_id] = jQuery(this).val();

        jQuery(buyButton).data('options', options);
        jQuery(buyButton).attr('data-options', options);

        jQuery(document).trigger("beforeChangeCartElementOptions", options);

        return true;
    },
    deleteElement: function (elementId, url) {

        pistol88.cart.sendData({elementId: elementId}, url);

        return false;
    },
    changeInputValue: function () {
        var val = parseInt(jQuery(this).siblings('input').val());
        var input = jQuery(this).siblings('input');

        if (jQuery(this).hasClass('pistol88-downArr')) {
            if (val <= 0) {
                return false;
            }
            jQuery(input).val(val - 1);
        }
        else {
            jQuery(input).val(val + 1);
        }

        jQuery(input).change();

        return false;
    },
    changeBeforeElementCount: function () {
        if (jQuery(this).val() <= 0) {
            jQuery(this).val('0');
        }

        var id = jQuery(this).data('id');
        var buyButton = jQuery('.pistol88-cart-buy-button' + id);
        jQuery(buyButton).data('count', jQuery(this).val());
        jQuery(buyButton).attr('data-count', jQuery(this).val());

        return true;
    },
    changeBeforeElementCountAria: function () {
		if ($(this).attr('aria-valuenow') <= 0) {
            $(this).attr('aria-valuenow').val('0');
        }
	
        var id = $(this).data('id');
        var buyButton = $('.pistol88-cart-buy-button' + id);
        $(buyButton).data('count', $(this).attr('aria-valuenow'));
        $(buyButton).attr('data-count', $(this).attr('aria-valuenow'));

        return true;
    },
    changeElementCount: function (cartElementId, cartElementCount, url) {

        var data = {};
        data.CartElement = {};
        data.CartElement.id = cartElementId;
        data.CartElement.count = cartElementCount;

        pistol88.cart.sendData(data, url);

        return false;
    },
    changeElementCost: function(cartElementId, cartElementCount) {
        var newCost = jQuery('.pistol88-cart-element-price'+cartElementId).html() * cartElementCount;
        jQuery('.pistol88-cart-element-cost'+cartElementId).html(newCost);
    },
    addElement: function (itemModelName, itemId, itemCount, itemPrice, itemOptions, url) {

        var data = {};
        data.CartElement = {};
        data.CartElement.model = itemModelName;
        data.CartElement.item_id = itemId;
        data.CartElement.count = itemCount;
        data.CartElement.price = itemPrice;
        data.CartElement.options = itemOptions;

        pistol88.cart.sendData(data, url);

        return false;
    },
    truncate: function (url) {
        pistol88.cart.sendData({}, url);
        return false;
    },
    changeElementCost: function(cartElementId, cartElementCount) {
        var newCost = jQuery('.pistol88-cart-element-price'+cartElementId).html() * cartElementCount;
		jQuery('.pistol88-cart-element-cost'+cartElementId).html(newCost);
    },
    sendData: function (data, link) {
        if (!link) {
            link = '/cart/element/create';
        }

        jQuery(document).trigger("sendDataToCart", data);

        data.elementsListWidgetParams = pistol88.cart.elementsListWidgetParams;
        data[pistol88.cart.csrf_param] = pistol88.cart.csrf;

        jQuery('.pistol88-cart-block').css({'opacity': '0.3'});
        jQuery('.pistol88-cart-count').css({'opacity': '0.3'});
        jQuery('.pistol88-cart-price').css({'opacity': '0.3'});

        jQuery.post(link, data,
            function (json) {
                jQuery('.pistol88-cart-block').css({'opacity': '1'});
                jQuery('.pistol88-cart-count').css({'opacity': '1'});
                jQuery('.pistol88-cart-price').css({'opacity': '1'});

                if (json.result == 'fail') {
                    console.log(json.error);
                }
                else {
                    pistol88.cart.renderCart(json);
                }

            }, "json");

        return false;
    },
    renderCart: function (json) {
        if (!json) {
            var json = {};
            jQuery.post('/cart/default/info', {},
                function (answer) {
                    json = answer;
                }, "json");
        }

        jQuery('.pistol88-cart-block').replaceWith(json.elementsHTML);
        jQuery('.pistol88-cart-count').html(json.count);
        jQuery('.pistol88-cart-price').html(json.price);

        jQuery(document).trigger("renderCart", json);

        return true;
    },
};

pistol88.cart.init();
