var total;
var starArr = [];
var current_sizing = 0, previous_sizing, finalized_size;
var amount = parseInt(cart_amount);
var current_stars = 0;

$(document).ready(function() {
    console.log('ready');
    let price = 9.99
    total = quantity * price;
    if(is_deleted !== null) $("#add_to_cart_button").text("Unavailable");
    else $("#add_to_cart_button").text("Add to Cart - $" + total + " USD");
    $(".sizing").each( function() { $(this).val($(this).text()) } );
    
    $(".sizing").click(function() {
        if (this === current_sizing) return;
        else if (current_sizing === 0) {
            $(this).css("background-color", "#FFE57A");
            current_sizing = this;
            finalized_size = $(this).val();
        } else {
            previous_sizing = current_sizing;
            $(this).css("background-color", "#FFE57A");
            current_sizing = this;
            $(previous_sizing).css("background-color", "white");
            finalized_size = $(this).val();
        }
    });
    if(is_deleted == null) $("#curr_quantity").text(quantity);
    var starArr = $(".review_star");
    console.log(starArr);
    
    $(".review_star").click(function() {
        if(user !== null) {
            current_stars = $(this).data("value");
            for (let u = 0; u < current_stars; u++)
                $(starArr[u]).prop("src", "/images/review_star_shaded.svg");
            for (let u = 5; u > current_stars - 1; u--)
                $(starArr[u]).prop("src", "/images/review_star.svg");
        }
         else window.location.href = "/login";
    });

    if(is_deleted == null) {
        $("#add_to_cart_button").click(function() {
            if(user == null) return;
            else if(finalized_size == null) $("#combotext").text("Please pick a size!");
            else $.ajax({
                type: "POST",
                url: "./add-to-cart",
                data: {
                    product_id: product_id,
                    user_id: user,
                    size: finalized_size,
                    quantity: quantity,
                    name: product_name,
                    price: price,
                },
                success: function(response) {
                    console.log(response)
                    $("#combotext").css("color", "green");
                    $("#combotext").text("You have added " + quantity + " items to your cart successfully!");
                    amount += parseInt(quantity);
                    indiv_amount += parseInt(quantity);
                    $('#cart_amount').text(amount);
                    $('#indiv_amount').text('Currently in cart: ' + indiv_amount);
                },
                error: function(xhr, status, error) {
                    var errorMessage;
                    if (xhr.responseJSON && xhr.responseJSON.message) errorMessage = xhr.responseJSON.message;
                    else errorMessage = xhr.statusText || error;
                    console.log(error);
                    console.error("Error adding item to cart: ", errorMessage);
                }
            });
        });
    }
    else $('#feedback-container').text('No one has commented on this product... Be the first!');
});

$('#favorite').click(function() { if(user == null) window.location.href = "/login" } );

$('#review_content').click(function() { if(user == null) window.location.href = "/login" })

if(is_deleted == null) {
    function add() {
        quantity++;
        $("#curr_quantity").text(quantity);
        total = price * quantity;
        $("#add_to_cart_button").text("Add to Cart - $" + total + " USD");
    }
    function minus() {
        if(quantity > 1) {
            quantity--;
            $("#curr_quantity").text(quantity);
            total = price * quantity;
            $("#add_to_cart_button").text("Add to Cart - $" + total + " USD");        
        }
    }
}

/*
$(window).on('beforeunload', function() {
    if(isFavoritedNow !== isFavorited)
        $.post('http://localhost/pepicase/public/product/toggleFavorite', {
            product: product_id,
            user_id: user,
        })
});

function printFeedback(name, rating, comment, date) {
    var $block = $('<div>', {
        class: 'lexend shadow',
        css: {
        'width': '100%',
        'padding': '10px',
        'margin': '10px auto',
        'border': '1px solid #ccc'
        }
    });

    var $feedbackHeader = $('<div>', { class: 'feedback-header'}).append(
        $('<div>', { style: 'font-weight: bold; font-size: 20px;' }).text(name),
        $('<div>', { style: 'font-size: 15px; color: #666;' }).text(date)
    );

    var $feedbackRating = $('<div>', { class: 'feedback-rating' });
    var index = 0;
    for ( ;index < rating; index++) $feedbackRating.append(
        $('<img>', { src: '/pepicase/public/pics/review_star_shaded.svg', style: 'height: 20px; width:auto;'}) 
    );
    for(;index < 5; index++) {
        $feedbackRating.append( $('<img>', { src: '/pepicase/public/pics/review_star.svg', style: 'height: 20px; width:auto;' } ) );
    }

    var $feedbackComment = $('<div>', { class: 'feedback-comment' }).text(comment);
    $block.append($feedbackHeader, $feedbackRating, $feedbackComment);
    $('#feedback-container').append($block);
};

function printFeedback_Top(name, rating, comment, date) {
  var $block = $('<div>', {
    class: 'lexend shadow',
    css: {
      'width': '100%',
      'padding': '10px',
      'margin': '10px auto',
      'border': '1px solid #ccc'
    }
  });

  var $feedbackHeader = $('<div>', {
    class: 'feedback-header'
  }).append(
    $('<div>', {
      style: 'font-weight: bold; font-size: 20px;'
    }).text(name),
    $('<div>', {
      style: 'font-size: 15px; color: #666;'
    }).text(date)
  );

  var $feedbackRating = $('<div>', {
    class: 'feedback-rating'
  });
  var index = 0;
  for (;index < rating; index++) 
  {
    $feedbackRating.append(
      $('<img>', {
        src: '/pepicase/public/pics/review_star_shaded.svg',
        style: 'height: 20px; width:auto;'
      })
    );
  }
  for(;index < 5; index++)
  {
    $feedbackRating.append(
      $('<img>', {
        src: '/pepicase/public/pics/review_star.svg',
        style: 'height: 20px; width:auto;'
      })
    );
  }

  var $feedbackComment = $('<div>', {
    class: 'feedback-comment'
  }).text(comment);

  $block.append($feedbackHeader, $feedbackRating, $feedbackComment);
  $('#feedback-container').prepend($block);
}; 

if(is_deleted == null)
$('#post_comment').click(function() {
    if(user !== null) {
        if(current_stars == 0) $('#comment_alert').text('Please rate the product with stars!');
        else if($('#review_content').val().trim() == '') $('#comment_alert').text('Please give your thoughts about the product!');
        else {
            $.ajax({
            type: "POST",
            url: "http://localhost/pepicase/public/post_comment",
            data: {
                product_id: product_id,
                user_id: user,
                comment: $('#review_content').val().toString(),
                stars: current_stars,
            },
            success: function(response) {
                console.log(response);
                printFeedback_Top('You!',current_stars, $('#review_content').val().toString(),'Just now');
                current_stars = 0;
                $('#review_content').val() = '';
            },
            error: function(xhr, status, error) { console.log("can't") },
            });
        } 
    }
    else window.location.href = 'http://localhost/pepicase/public/login';
    }
);
*/