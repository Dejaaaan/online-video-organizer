(function () {
    angular.module('app')
        .controller('MainController', MainController);

    MainController.$inject = ['$location', '$http', '$route', 'UserService', 'vcRecaptchaService', '$scope'];

    function MainController($location, $http, $route, UserService, vcRecaptchaService, $scope) {

        var self = this;
        self.isActive = isActive;
        self.register = register;
        self.login = login;
        self.logout = logout;
        self.toggleLoginRegister = toggleLoginRegister;
        self.closeRegistrationConfirmation = closeRegistrationConfirmation;
        self.loginOrRegister = "login";
        self.user;
        self.loginError;
        self.registrationError;
        self.registrationMessage;
        self.loginUserForm;
        self.registerUserForm;

        //reCaptcha
        self.publicKey = "6LceCy0UAAAAALAVMh0eYQnnlXsyvWkksQYayaCN";


        init();

        function init() {
            if(localStorage.getItem("base64Credential")) {
                login(localStorage.getItem("base64Credential"));
                self.credentials = {autologin: false};
            }
            if (self.user) {
                $route.reload();
                self.loginUserForm.$setPristine();
            }
        }

        //nav-bar
        function isActive(viewLocation) {
            return viewLocation === $location.path();
        }

        function register(user) {
            var data = {
                'g-recaptcha-response': vcRecaptchaService.getResponse() //send g-captcah-reponse to our server        
            }
            UserService.sendCaptcha(data).then(function (response) {
                if (response.data.success) {
                    saveUser(user);
                } else {
                    self.registrationMessage = "You are a robot!";
                    $('#registrationModal').modal('show');
                }
            }, function (error) {
                self.registrationMessage = "User registration failed!";
                $('#registrationModal').modal('show');
            })
        }

        function saveUser(user) {
            user.status = true;
            user.roles = [{
                "id": 1,
                "type": "ROLE_USER"
            }];
            UserService.saveUser(user).then(function (response) {
                //self.loginOrRegister = "login";
                self.registrationMessage = user.username + "  is registered!";
                $('#registrationModal').modal('show');
            }, function (error) {
                self.registrationError = {};
                angular.forEach(error.data.exceptions, function (e) {
                    errorHandler(e);
                });
            })
            //remove input value after submit
            self.registerUserForm.$setPristine();
        }

        function login(base64Credential) {
            if (!base64Credential) {
                var base64Credential = btoa(self.credentials.username + ':' + self.credentials.password);
            }
            $http.get('users/user', {
                headers: {
                    // setting the Authorization Header
                    'Authorization': 'Basic ' + base64Credential
                }
            }).success(function (res) {
                self.message = '';
                $http.defaults.headers.common['Authorization'] = 'Basic ' + base64Credential;
                if (self.credentials.autologin) {
                    localStorage.setItem("base64Credential", base64Credential);
                }
                self.user = res;
                UserService.setLoggedInUser(res);
                angular.element('#login-register-modal').modal('hide');
                $location.path('playlists');
            }).error(function (error) {
                self.loginError = 'Bad credentials!';
            });
        }

        function toggleLoginRegister(showForm) {
            if (showForm == "register") {
                self.loginUserForm.$setPristine();
                delete self.credentials;
                delete self.loginError;
            } else {
                self.registerUserForm.$setPristine();
                delete self.registerInput;
                delete self.registrationError;
            }
            self.loginOrRegister = showForm;
            // grecaptcha.reset();
        }

        function closeRegistrationConfirmation() {
            if (self.registrationMessage.includes("is registered!")) {
                grecaptcha.reset();
                self.registerUserForm.$setPristine();
                delete self.registrationError;
                self.loginOrRegister = "login";
            }
        }

        function logout() {
            $http.defaults.headers.common['Authorization'] = null;
            UserService.setLoggedInUser(null);
            localStorage.removeItem("base64Credential");
            delete self.user;
            delete self.error;
            delete self.registrationError;
            delete self.loginError;
            $location.path('home');
        }

        function errorHandler(error) {
            switch (error.field) {
                case 'username':
                    self.registrationError.username = error.message;
                    grecaptcha.reset();
                    break;
                case 'email':
                    self.registrationError.email = error.message;
                    grecaptcha.reset();
                    break;
            }
        }

    }

})();
