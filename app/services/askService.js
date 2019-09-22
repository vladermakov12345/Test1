(function() {
    //TODO: var confirmEmailService
    var askService = function ($http) {

        var vm = this;

        var complete = false;
        var urlBase = "http://localhost:3000/Providers";
        var urlSubmit = urlBase + "/RequestRecommendations";

        vm.addContact = addContact;
        vm.removeContact = removeContact;
        vm.contactAlreadyExists = contactAlreadyExists;
        vm.setProviderType = setProviderType;
        vm.getProviderType = getProviderType;
        vm.getContacts = getContacts;
        vm.setMessage = setMessage;
        vm.getMessage = getMessage;
        vm.setName = setName;
        vm.setLocation = setLocation;
        vm.setEmail = setEmail;
        vm.setPassword = setPassword;
        //vm.getCredentials = getCredentials;
        vm.getUser = getUser;
        vm.setAccesstype = setAccesstype;
        vm.getAccesstype = getAccesstype;
        vm.setAcceptTerms = setAcceptTerms;
        vm.submit = submit;
        vm.isComplete = isComplete;

        //define expeected model
        var model = {
            providerType: '',
            contacts: [],
            message: '',
            user: {
                name: {
                    salutation: '',
                    first: '',
                    last: ''
                },
                location: {
                    city: '',
                    state: ''
                },
                email: '',
                password: '',
                acceptTerms: false
            },
            accesstype: '',
            confirmationCode: ''

            //future
            //acceptFromContactsOfContacts: false,
        };

        //provider type
        function setProviderType(newValue){
            model.providerType = newValue;
        }
        function getProviderType() {
            return model.providerType;
        }

        //contacts
        function addContact(contact){
            //validation
            if (!contact) return;
            if (!contact.first || !contact.last || !contact.email) return;
            if (contactAlreadyExists(contact.email)) return "A contact with this email already exists.";

            //add
            model.contacts.push(contact);
        }
        function removeContact(email) {
            for(var i=0;i<model.contacts.length;i++) {
                if (model.contacts[i].email === email) {
                    return model.contacts.splice(i, 1);
                }
            }
        }
        function contactAlreadyExists(contactEmail){
            for(var i=0;i<model.contacts.length;i++) {
                if (model.contacts[i].email === contactEmail) {
                    return true;
                }
            }
            return false;
        }
        function getContacts() {
            return model.contacts;
        }

        //message
        function setMessage(message){
            model.message = message;
        }
        function getMessage() {
            return model.message;
        }

        //name
        function setName(name) {
            model.user.name.first = name.first;
            model.user.name.last = name.last;
        }

        //location
        function setLocation(location) {
            model.user.location = location;
        }

        //email
        function setEmail(email) {
            model.user.email = email;
        }

        //credentials
        function setPassword(password) {
            model.user.password = password;
        }
        //function getCredentials(){
        //    return new {
        //        email: model.user.email,
        //        password: model.user.password
        //    };
        //}

        //user
        function getUser() {
            return model.user;
        }

        //access type
        function setAccesstype(accessType) {
          model.accesstype = accessType;
        }
        function getAccesstype() {
          return model.accesstype;
        }

        //accept terms
        function setAcceptTerms(terms){
            model.acceptTerms = terms;
        }

        //future
        //this.acceptFromContactsOfContacts = function(toggle) {
        //    if (model.acceptFromContactsOfContacts !== toggle) return;
        //    model.acceptFromContactsOfContacts = toggle;
        //};

        function submit() {
            complete = true;

            var data = JSON.stringify({
                   model: model
               });

            var req = {
                method: 'POST',
                url: urlSubmit,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            return $http(req);
        }

        function isComplete(){
            return false;
        }
    };

    askService.$inject = ['$http'];
    angular.module('app').service('askService', askService);
})();