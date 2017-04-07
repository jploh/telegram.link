//     telegram.link
//     Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://telegram.link


// Dependencies:
var api = require('../api');
var utility = require('../utility');


// ***

// This module wraps API methods required to the user to gain the authorization.

// See [User Authorization](https://core.telegram.org/api/auth)
// and [Api Methods](https://core.telegram.org/methods#registration-authorization)

// Access only via Client object (like client.auth) and `auth` instance property

function Auth(client) {
    this.client = client;
}


// ***

// **Event: **`'method name'`

// Each of the following methods emits an event with the same name when done, an `error` event otherwise.


// ***
// auth.**sendCode(phone_number, current_number, allow_flashcall, [callback])**

// Send a text message with the confirmation code required for registration to the given phone number.

// [Click here for more details](https://core.telegram.org/method/auth.sendCode)

// The code:
Auth.prototype.sendCode = function (phone_number, current_number, allow_flashcall, callback) {
    if (callback) {
        this.client.once('sendCode', callback);
    }
    var props = {
        phone_number: phone_number,
        allow_flashcall: allow_flashcall,
        current_number: current_number ? new api.type.BoolTrue() : new api.type.BoolFalse(),
        api_id: this.client._app.id,
        api_hash: this.client._app.hash
    };
    if (this.client.isReady(true)) {
        try {
            api.service.auth.sendCode({
                props: props,
                channel: this.client._channel,
                callback: utility.createEventEmitterCallback('sendCode', this.client)
            });
        } catch (err) {
            this.client.emit('error', err);
        }
    }
};


// ***
// auth.**sendCall(phone_number, phone_code_hash, [callback])**

// Return a Promise to make a voice call to the passed phone number.
// A robot will repeat the confirmation code from a previously sent SMS message.

// [Click here for more details](https://core.telegram.org/method/auth.sendCall)

// The code:
Auth.prototype.sendCall = function (phone_number, phone_code_hash, callback) {
    return utility.callService(api.service.auth.sendCall, this.client, this.client._channel, callback, arguments);
};


// ***
// auth.**signIn(phone_number, phone_code_hash, phone_code, [callback])**

// Return a Promise to sign in a user with a validated phone number.

// [Click here for more details](https://core.telegram.org/method/auth.signIn)

// The code:
Auth.prototype.signIn = function (phone_number, phone_code_hash, phone_code, callback) {
    return utility.callService(api.service.auth.signIn, this.client, this.client._channel, callback, arguments);
};


// ***
// auth.**signUp(phone_number, phone_code_hash, phone_code, first_name, last_name, [callback])**

// Return a Promise to register a validated phone number in the system.

// [Click here for more details](https://core.telegram.org/method/auth.signUp)

// The code:
Auth.prototype.signUp = function (phone_number, phone_code_hash, phone_code, first_name, last_name, callback) {
    return utility.callService(api.service.auth.signUp, this.client, this.client._channel, callback, arguments);
};

// ***
// auth.**checkPhone(phone_number, [callback])**

// Return a Promise to get the information on whether the passed phone number was registered.

// [Click here for more details](https://core.telegram.org/method/auth.checkPhone)

// The code:
Auth.prototype.checkPhone = function (phone_number, callback) {
    return utility.callService(api.service.auth.checkPhone, this.client, this.client._channel, callback, arguments);
};

// ***
// auth.**checkPassword(password_hash, [callback])**

// Return a Promise to get the information on whether the passed password hash was registered.

// [Click here for more details](https://core.telegram.org/method/auth.checkPassword)

// The code:
Auth.prototype.checkPassword = function (password_hash, callback) {
  return utility.callService(api.service.auth.checkPassword, this.client, this.client._channel, callback, arguments);
};

// Export the class.
module.exports = exports = Auth;
