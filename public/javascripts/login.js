let buttonRef = document.querySelector('#button');
let usernameRef = document.querySelector('#username');
let passwordRef = document.querySelector('#password');
async function process() {
    buttonRef.innerHTML = '<i style="color: black" class="fas fa-spinner fa-spin"></i>';
    const formData = {
        username: usernameRef.value,
        password: passwordRef.value,
    }
    console.log(formData);
    await fetch(window.location.href , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
    .then(async res => {
        if (res.redirected) window.location.href = res.url;
        else if (res.status === 200) {
            const data = await res.json();
            window.location.href = '../login?error=' + encodeURIComponent(data.error);
        }
    })
    .catch( error => console.error('Error:', error) );
}