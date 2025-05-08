var delete_count = 0;

function check_inf() {
    const fields = {
        fname: { value: $('#fname').val(), regex: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Please enter a valid first name.' },
        lname: { value: $('#lname').val(), regex: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Please enter a valid last name.' },
        email: { value: $('#email').val(), regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Please enter a valid email.'},
        address: { value: $('#address').val(), regex: /^(?=.*[a-zA-ZÀ-ỹ])(?=.*\d)[a-zA-ZÀ-ỹ0-9\s,#\-./]+$/, message: 'Please enter a valid address.' },
        phone: { value: $('#phone').val(), regex: /^\d{6,15}$/, message: 'Please enter a valid telephone number.' }
    };
    if (fields.fname.value.trim() === 'test') return 'None';
    for (const field in fields) {
        const { value, regex, message, not_needed } = fields[field], trimmed = value.trim();
        if (!not_needed && trimmed === '') return message;
        if (trimmed && !regex.test(trimmed)) return message;
    }
    return 'None';
}
function getFormData() {
    return {
        first_name: $('#fname').val().toString(),
        last_name: $('#lname').val().toString(),
        email: $('#email').val().toString(),
        address: $('#address').val().toString(),
        phone: $('#phone').val().toString()
    };
}
$('#save').click(function() {
    $('#inform').text('');
    var error = check_inf();
    if(error == 'None') {
        var data = getFormData();
        if(data == user) console.log('duplicated');
        $.ajax({
            type: "POST",
            url: "../account",
            data: JSON.stringify({
                csrfToken: $('#csrf_token').val().toString(),
                first_name: $('#fname').val().toString(),
                last_name: $('#lname').val().toString(),
                email: $('#email').val().toString(),
                address: $('#address').val().toString(),
                phone: $('#phone').val().toString()
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (response) => {
                console.log(response.responseText);
                $('#inform').css({'color': 'green','font-family': 'Lexend','font-size': '20px'}).text(response.message);
            },
            error: (err) => {
                console.log(err);
                $('#inform').css({'color': 'red', 'font-family': 'Lexend', 'font-size': '20px'}).text('An error has occurred!');
            }
        });
    }
    else $('#inform').css('color','red').text(error);
})
function delete_account() {
    if(delete_count == 0) {
        delete_count++;
        $('#delete_alert').text('Are you sure? No going back...');
        $('#delete').text('Yes...');
        setTimeout(() => {
            delete_count--;
        }, 5000);
    }
    else if(delete_count == 1) $.ajax({
        type: "POST",
        url: "http://localhost/pepicase/public/user/delete_account",
        data: { user_id: user },
        success: function(response) { window.location.href = response; },
        error: $('#delete_alert').text('An error has occurred.'),
    });
}
