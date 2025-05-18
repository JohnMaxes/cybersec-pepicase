var totalPrice = 0;
var item_count = 0;
$(document).ready(function() {
    console.log(cart_items);
    cart_items.forEach(item => print(item.product_id, item.name, item.price, item.image, item.quantity, item.size, item.cart_item_id))
});

function print(id, name, price, pathing, quantity, model, cart_item_id) {
    var model_value = model.toString();
    console.log(model_value);
    var quantity_value = parseInt(quantity);
    var price_value = parseFloat(price);
    var product_div = $('<div>').addClass('d-flex product-item')
    .css({
        'width': '100%',
        'height': '25vh',
        'text-align': 'left',
        'margin-top': '3vh'
    });
  
    var image_div = $('<div>').addClass('d-flex align-items-center justify-content-center image-container')
    .css({
        'height': '100%',
        'width': '26%',
        'background-color': '#C4C4C4',
        'border-radius': '10px'
    });
  
    var image_link = $('<a>').attr('href', `/product/${id}`)
    .addClass('image-link')
    .css('height', '95%');
  
    var image = $('<img>').attr('src', pathing + '.svg')
    .addClass('product-image')
    .css({
        'height': '100%',
        'width': 'auto'
    });
  
    var info_div = $('<div>').addClass('product-info')
    .css({
        'margin-left': '3%',
        'width': '71%',
        'height': '100%',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'space-between'
    });
  
    var product_name = $('<a>').attr('href', `/product/${id}`)
    .addClass('product-name')
    .css('color', 'black')
    .css('text-decoration', 'none')
    .css('font-size', '22px')
    .text(name);
  
    var model = $('<div>').addClass('product-model')
    .css('font-size', '15px')
    .html(`Model: <strong>${model}</strong> <> Price of each: <strong>${price}$</strong>`);
  
    var quantityDiv = $('<div>').addClass('product-quantity d-flex flex-row')
    .css('font-size', '15px');

    var decreaseBtn = $('<div>').addClass('btn btn-dark').text('-');
    var quantityText = $('<div>').addClass('quantity-text d-flex justify-content-center align-items-center')
        .css('width', '10%')
        .css('border-top', '2px solid black')
        .css('border-bottom', '2px solid black')
        .text(quantity);
    var increaseBtn = $('<div>').addClass('btn btn-dark').text('+');

    quantityDiv.append(increaseBtn, quantityText, decreaseBtn);
  
    var priceDiv = $('<div>').addClass('product-price')
    .addClass('lexend-tera')
    .css('font-size', '20px')
    .text(`${parseFloat(price) * quantity_value}$`);
  
    var remove_link = $('<div>').addClass('remove-link')
    .css({
        'text-decoration': 'underline',
        'height': 'fit-content',
        'margin-top': '1%',
        'margin-left': 'auto'
    })
    .text('Remove');
  
    image_link.append(image);
    image_div.append(image_link);
    info_div.append(product_name, model, quantityDiv, priceDiv);
    info_div.append(remove_link);
    product_div.append(image_div, info_div);

    totalPrice += price_value * quantity_value;

    $('#cart-items').append(product_div);
    $('#totalPrice').text(totalPrice.toFixed(2) + "$");
    $('#subTotal').text(totalPrice.toFixed(2) + "$");

    item_count += quantity_value;
    remove_link.click(function() {
        if(remove_link.text() == 'Remove') {
            remove_link.text('Click here again to remove');
            remove_link.css('color', 'red');
            setTimeout(function() {
                remove_link.text('Remove');
                remove_link.css('color', 'black');
            }, 1500);
        } else {
            item_count -= quantity_value;
            $('#cart_amount').text(item_count);
            product_div.remove();
            totalPrice -= price_value * quantity_value;
            var protocol = 'delete';
            initiate_post_request(protocol, quantity_value, cart_item_id);
            $('#subTotal').text(totalPrice.toFixed(2) + "$");
            $('#totalPrice').text(totalPrice.toFixed(2) + "$");
            if(item_count == 0) $('#cart-items').html(`<h1 style = "margin-top: 10vh;">Your cart has been emptied!</h1>`);
        }
    })

    increaseBtn.click(function() {
        quantity_value++;
        item_count ++;
        $('#cart_amount').text(item_count);
        totalPrice += price_value;
        var protocol = 'modify';
        initiate_post_request(protocol, quantity_value, cart_item_id);
        quantityText.text(quantity_value);
        priceDiv.text((price_value * quantity_value) + "$");
        $('#totalPrice').text(totalPrice.toFixed(2) + "$");
        $('#subTotal').text(totalPrice.toFixed(2) + "$");    
    });

    decreaseBtn.click(function() {
        quantity_value--;
        item_count --;
        totalPrice -= price_value;
        $('#cart_amount').text(item_count);
        if(quantity_value == 0) {
            var protocol = 'delete';
            initiate_post_request(protocol, quantity_value, cart_item_id);
            product_div.remove();
        } else {
            var protocol = 'modify';
            initiate_post_request(protocol, quantity_value, cart_item_id);
            quantityText.text(quantity_value);
            priceDiv.text((price_value * quantity_value) + "$");
        }
        $('#totalPrice').text(totalPrice.toFixed(2) + "$");
        $('#subTotal').text(totalPrice.toFixed(2) + "$");
        if(item_count == 0) $('#cart-items').html(`<h1 style = "margin-top: 10vh;">Your cart has been emptied!</h1>`);
    });
}


function initiate_post_request(protocol, quantity, cart_item_id) {
    $.ajax({
        type: "POST",
        url: "/cart",
        data: {
            protocol: protocol,
            cart_item_id: cart_item_id, 
            quantity: quantity.toString(),
        },
        success: function(response) {
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.log("can't");
        },
     });
}