app.factory('DataFactory', function($http) {

    var extractData = res => res.data;

    return {
        checkEmailIsValid(email) {
                return $http.get('/api/users/validEmail', {
                        params: {
                            "email": email
                        }
                    })
                    .then(extractData);
            },
            fetchUsers() {
                return $http.get('/api/users/')
                    .then(extractData)
            },
            fetchUser(userId) {
                return $http.get(`/api/users/${userId}`)
                    .then(extractData);
            },
            checkUser(userEmail) {
                if (userEmail) query.user = userEmail;
                return $http.get('/api/users/', {
                        params: query
                    })
                    .then(extractData)
            },
            addUser(user) {
                return $http.post('/api/users/', user)
                    .then(extractData);
            },
            updateUser(userId, update) {
                return $http.put(`/api/users/${userId}`, update)
                    .then(extractData);
            },
            deleteUser(userId) {
                return $http.delete(`/api/users/${userId}`)
                    .then(extractData);
            }
    };
});
