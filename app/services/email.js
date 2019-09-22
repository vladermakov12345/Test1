//-- not used
module.exports = function(mod){
    var emailService = function (dataFactory) {
        this.validate = function (emailToValidate) {
            var re = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
            return re.test(emailToValidate);
        };

        this.send = function(emaildata) {
            //validate
            if (!emaildata)
                return { success: false, error: 'Invalid email sent'};

            if (!this.validate(emaildata.email_to))
                return { success: false, error: 'Recipient email is not valid'};

            if (!this.validate(emaildata.email_from))
                return { success: false, error: 'Sender email is not valid'};

            if (!emaildata.email_message || emaildata.email_message.length===0)
                return { success: false, error: 'Message must contain text'};

            if (emaildata.email_message.length>500)
                return { success: false, error: 'Message must be less than 500 characters.'};

            //send it
            return dataFactory.SendEmail('http://localhost:3000', emaildata)
                .then(function (response) {
                    return { success: response.data.success, error: response.data.error};
                }, function (error) {
                    return { success: false, error: error};
                });
        };
    };

    emailService.$inject = ['dataFactory'];
    mod.service('emailService', emailService);
};
