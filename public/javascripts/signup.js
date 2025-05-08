// nhấn vào con mắt sẽ hiện ra password
document.getElementById('toggle_password').addEventListener('click', function() {
    let passwordInput = document.getElementById('password');
    if (passwordInput.type == 'password') passwordInput.type = 'text';
    else passwordInput.type = 'password';
}); 
document.getElementById('toggle_confirm_password').addEventListener('click', function() {
    let passwordInput = document.getElementById('confirm_password');
    if (passwordInput.type == 'password') passwordInput.type = 'text';
    else passwordInput.type = 'password';
});

// kiểm tra email
function checkEmail() {
    let email = document.getElementById('email').value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let checkEmailDiv = document.getElementById('check_email').querySelector('span');

    if (emailPattern.test(email) && email !== '') {
        checkEmailDiv.innerText = 'Valid email address';
        checkEmailDiv.style.color = 'green';
        checkEmailDiv.style.fontFamily = "Lexend";
        return true;
    } else {
        checkEmailDiv.innerText = 'Invalid email address. Please enter again!';
        checkEmailDiv.style.color = 'red';
        checkEmailDiv.style.fontFamily = "Lexend";
        return false;
    }
}
function handleFocus() {
    let checkEmailDiv = document.getElementById('check_email').querySelector('span');
    checkEmailDiv.innerHTML = ''; // Xóa thông báo khi phần tử nhận được focus
}

document.getElementById('email').addEventListener('blur', checkEmail);
document.getElementById('email').addEventListener('focus', handleFocus);

// Kiểm tra mật khẩu
function check() {
    let password = document.getElementById("password").value;
    let trigger_password = document.getElementById("check_password").querySelector('span');
    const regex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/;

    if (password.match(regex)) {
        trigger_password.style.color = "green";
        trigger_password.style.fontFamily = "Lexend";
        trigger_password.innerText = "Valid password.";
        return true;
    } else {
        trigger_password.style.color = "red";
        trigger_password.style.fontFamily = "Lexend";
        trigger_password.innerText = "Password is too weak. Please enter again!";
        return false;
    }
}
function handlePass() {
    let checkpassword = document.getElementById('check_password').querySelector('span');
    checkpassword.innerText = ''; // Xóa thông báo khi phần tử nhận được focus
}
document.getElementById('password').addEventListener('blur', check);
document.getElementById('password').addEventListener('focus', handlePass);

function check_confirm_password() {
    let password = document.getElementById("password").value;
    let confirm_password = document.getElementById("confirm_password").value;
    let trigger_confirm_password = document.getElementById("check_confirm_password").querySelector('span');
    if(password.value !== '' && confirm_password === password) {
        trigger_confirm_password.innerText = "";
        return true;
    }
    else {
        trigger_confirm_password.style.color = "red";
        trigger_confirm_password.style.fontFamily = "Lexend";
        trigger_confirm_password.innerText = "Invalid password reconfirmation!";
        return false;
    }
}
function handleConfirm() {
    let checkconfirmpassword = document.getElementById('check_confirm_password').querySelector('span');
    checkconfirmpassword.innerText = ''; // Xóa thông báo khi phần tử nhận được focus
}
document.getElementById('confirm_password').addEventListener('blur', check_confirm_password);
document.getElementById('confirm_password').addEventListener('focus', handleConfirm);

// kiểm tra form khi nhấn submit
function checkForm(event) {
    event.preventDefault();
    let emailValid = checkEmail();
    let passwordValid = check();
    let confirmPasswordValid = check_confirm_password();

    if (emailValid && passwordValid && confirmPasswordValid) {
        document.getElementById("myForm").submit();
        return true;
    } else return false;
}