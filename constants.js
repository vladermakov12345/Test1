module.exports = function(mod){
    var self = this;

    //general
    mod.constant('globalConstants', {
        company_name: 'accessibleGO',
        company_location: 'USA',
        // urlGetCurrentUser: self.getUrl('Account/GetCurrentUser'),
        // urlAcctLogin: self.getUrl('Account/Login'),
        // urlAcctLogoff: self.getUrl('Account/Logoff'),
        // urlAcctConfirm: self.getUrl('Account/ConfirmEmail'),
        // urlSendConfirmationEmail: self.getUrl('Account/SendConfirmEmail'),
        // urlForgotPass: self.getUrl('Account/ForgotPassword'),
        ppnCustServicePhoneNumber: '877-477-7441',
        maintenance: 'Site maintenance in progress.  We expect to be back up shortly and apologize for the inconvenience.',
        browserSupport: {
            e:10,
            f:28,
            o:50,
            s:8,
            c:62
        }
    });

    //url
    //TODO: make sure this is replaced with environment service!!!
    // mod.constant('url', {
    //     content: .env.BASEURL_CONTENT,
    //     crm: .env.BASEURL_CRM,
    //     priceline: .env.BASEURL_PRICELINE,
    //     blog: 'https://public-api.wordpress.com/rest/v1.1/sites/accessiblego.wordpress.com'
    // });

    //roles
    //mod.constant('USER_ROLES', {
    //    admin: 'admin',
    //    main: 'main',
    //    provider: 'provider'
    //});

    //events
    mod.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });


};
