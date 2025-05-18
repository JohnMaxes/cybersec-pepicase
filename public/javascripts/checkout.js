var ship = 0;
var discount_ratio = 0;
var discounted = total_price * discount_ratio;
var total = (total_price - discounted + ship).toFixed(2);
var ship_option = 0;
var protocol = 0;
var vnpay_protocol = 0;
var momo_protocol = 2;
var voucher_id = null;

$(document).ready(function() {
    var creditCardBtn = $('#credit-card-btn');
    var codBtn = $('#cod-btn');
    var momoBtn = $('#momo-btn');
    var cardDetails = $('#card-details');
    var cardNumber = $('#card-number');
    var cardExpiryCvc = $('#card-expiry-cvc');
    // var saveCardContainer = $('#save-card-container');

    // Function to hide card details
    function hideCardDetails() {
        cardDetails.addClass('hidden');
        cardNumber.addClass('hidden');
        cardExpiryCvc.addClass('hidden');
        // saveCardContainer.addClass('hidden');
    }

    function removeActiveClass() {
        creditCardBtn.removeClass('active');
        codBtn.removeClass('active');
        momoBtn.removeClass('active');
    }

    hideCardDetails();

    creditCardBtn.click(function() {
        removeActiveClass();
        creditCardBtn.addClass('active');
        cardDetails.removeClass('hidden');
        cardNumber.removeClass('hidden');
        cardExpiryCvc.removeClass('hidden');
        protocol = 'VNPAY';
        console.log(protocol);
    });

    codBtn.click(function() {
        removeActiveClass();
        codBtn.addClass('active');
        hideCardDetails();
        protocol = 'Cash';
        console.log(protocol);
    });

    momoBtn.click(function() {
        removeActiveClass();
        momoBtn.addClass('active');
        hideCardDetails();
        protocol = 'Momo';
        console.log(protocol);
    });

    cart_items.forEach(item => print(item.quantity, item.name, item.price, item.image, item.size))
    $('#Total').text((total) + '$');
    $('#express-ship').on('change', function() {
        if ($(this).is(':checked')) {
          if(ship !== 20 || ship == 0) {
                ship = 20;
                ship_option = "Express";
                total = (total_price - discounted + ship).toFixed(2);
                $('#shipping').text(ship + '$');
                $('#Total').text(total + '$');
            }
        }
      });
    
      $('#standard-ship').on('change', function() {
        if ($(this).is(':checked')) {
            if(ship !== 10 || ship == 0) {
                ship = 10;
                ship_option = "Standard";
                total = (total_price - discounted + ship).toFixed(2);
                $('#shipping').text(ship + '$');
                $('#Total').text(total + '$');
            }
        }
      });
});


function print(quantity, name, price, pathing, size) {
    var block = document.createElement("div");
    block.className = "lexend";
    block.style = "width: 100%;height:fit-content; padding: 0; margin: 0; margin-top: 5vh;"
    block.innerHTML = `
            <div class="cart-item">
                <div class="image-container">
                    <img src="${pathing}.svg" alt="${size}">
                </div>
                <div class="item-details">
                    <div class = "lexend" style="font-size:20px; font-weight:600;">${name}</div>
                    <div class = "lexend" >Model: ${size}</div>
                    <div>Quantity: ${quantity} || <strong>Price of each: ${price}$ </strong></div>
                    <div class = "lexend-tera" style="font-size:20px; font-weight:600;">${quantity*price}$</p>
                </div>
            </div>
        `;
    document.getElementById('item_div').appendChild(block);
};

$('#apply-discount').click(function() {
    var code = $('#discount-code').val();
    console.log(typeof code);

    $.ajax({
        type: "POST",
        url: "/checkout/check-discount",
        data: { voucher_code: code },
        dataType: 'json',
        success: function(response) {
            var discount_ratio = (parseFloat(response.discount_value));
            voucher_id = response.voucher_id ? response.voucher_id : null;
            if (discount_ratio == 0) {
                $('#discount_alert').css('color', 'red');
                $('#discount_alert').text('Discount code has expired or is not valid!');
                if($('#discount').html()) $('#discount').html('');
            } else {
                discounted = (total_price * discount_ratio).toFixed(2);
                $('#discount_alert').css('color', 'green');
                $('#discount_alert').text('Discount code worked!');
                $('#discount').html(`
                    <div style="width: 30%;"><strong>Discounted:</strong></div>
                    <div id ="shipping" class="d-flex flex-row justify-content-end" style ="width:70%;"><strong>-${(discounted)}$</strong></div>
                `
                );
                total = (total_price - discounted + ship).toFixed(2);
                $('#Total').text(total + '$');
            }
        },
        error: function(xhr, status, error) {
            var errorMessage;
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else {
                errorMessage = xhr.statusText || error;
            }
            console.error("Error checking discount: ", errorMessage);
        }
    });
});

function infoCheck() {
    var fname = $('#fname').val(), lname = $('#lname').val(), address = $('#address').val(), apartment = $('#apartment').val();
    var country = $('#country').val(), city = $('#city').val(), zipcode = $('#zipcode').val(), area_code = $('#area_code').val();
    var phone = $('#phone').val(), button = $('#save').val(), error = 'None';
    if (fname.trim() === 'test') return error;
    if (fname.trim() === '' || !/^[a-zA-ZÀ-ỹ\s]+$/.test(fname)) return 'Please enter a valid first name.';
    if (lname.trim() === '' || !/^[a-zA-ZÀ-ỹ\s]+$/.test(lname)) return 'Please enter a valid last name.';
    if (address.trim() === '' || !/^(?=.*[a-zA-ZÀ-ỹ])(?=.*\d)[a-zA-ZÀ-ỹ0-9\s,#-./]+$/.test(address)) return 'Please enter a valid address.';
    if (apartment.trim() !== '' && !/^[a-zA-ZÀ-ỹ0-9\s,#-]+$/.test(apartment)) return 'Please enter a valid appartment/suite number.';
    if (country.trim() === '' || !/^[a-zA-ZÀ-ỹ\s]+$/.test(country)) return 'Please enter a valid country.'
    if (city.trim() === '' || !/^[a-zA-ZÀ-ỹ\s]+$/.test(city)) return 'Please enter a valid city.';
    if (zipcode.trim() === '' || !/^\d{5}(?:[-\s]\d{4})?$/.test(zipcode)) return 'Please enter a valid zip code.';
    if (area_code.trim() === '' || !/^\+?\d{1,2}$/.test(area_code)) return 'Please enter a valid area code.';
    if (phone.trim() === '' || !/^\d{6,15}$/.test(phone)) return 'Please enter a valid telephone number.';
    return error;
}

$('#buy').click(function() {
    $('#detail-alert').text('');
    if(infoCheck() == 'None') {
        if(ship_option == 0)  $('#detail-alert').text('PLEASE CHOOSE A SHIPPING OPTION!')
        else {
            note = 'Ship: ' + ship + '$';
            if(voucher_id !== 0) note += '. Discounted: ' + discounted + '$';
            if(protocol == '0') $('#detail-alert').text('PLEASE CHOOSE A PAYMENT METHOD!');
            if(protocol == 'Cash') {
                $.post({
                    url: "/checkout/generate-invoice",
                    data: {
                        total_price: total_price, actual_price: total,
                        voucher_id: voucher_id, user: user, note: note,
                        method: protocol, firstName: $('#fname').val().toString(),
                        lastName: $('#lname').val().toString(),
                        address: $('input[placeholder="Apartment, suite, etc (optional)"]').val().toString() + ' ' 
                        + $('#address').val().toString() + ' ' + $('input[placeholder="City"]').val().toString() + ' '
                        + $('input[placeholder="Country"]').val().toString() + ' ' + $('input[placeholder="Zipcode"]').val().toString(),
                        phone: $('input[placeholder="Area Code (e.g +84)"]').val().toString() + ' ' + $('input[placeholder="Telephone (e.g 0932456783)"]').val().toString(),
                        ship: ship_option, cart_items: JSON.stringify(cart_items),
                    },
                    dataType: 'json',
                    success: function(response) {                        
                        window.location.href = response.url;
                    },
                    error: function(xhr, status, error) {
                        var errorMessage;
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else {
                            errorMessage = xhr.statusText || error;
                        }
                        console.error("Error creating invoice", error);
                    }
                });                 
            }    
        }           
    }
    else $('#detail-alert').text(infoCheck());
})

function getFormData() {
    return {
        firstName: $('#fname').val().toString(),
        lastName: $('#lname').val().toString(),
        address: $('#address').val().toString(),
        apartment: $('#apartment').val().toString(),
        country: $('#country').val().toString(),
        city: $('#city').val().toString(),
        zipCode: $('#zipcode').val().toString(),
        areaCode: $('#area_code').val().toString(),
        phone: $('#phone').val().toString()
    };
  }

var testData = getFormData();
console.log(testData);