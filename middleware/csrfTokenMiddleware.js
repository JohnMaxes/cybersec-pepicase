const crypto = require('crypto');

function generateCsrfToken(userToken) {
    const salt = 'mywebsite';
    return crypto.createHmac('sha256', userToken).update(salt).digest('hex');
}
function validateCsrfToken(userToken, receivedCsrfToken) {
    const expectedToken = generateCsrfToken(userToken);
    return crypto.timingSafeEqual(
      Buffer.from(expectedToken),
      Buffer.from(receivedCsrfToken)
    );
}
module.exports = {generateCsrfToken, validateCsrfToken}