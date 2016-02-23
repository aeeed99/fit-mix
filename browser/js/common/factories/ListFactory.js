app.factory('ListFactory', function($http, $q, $rootScope) {

    var listFromLocal = JSON.parse(localStorage.getItem('visitingUserList'));

    var likeList = listFromLocal ?
        listFromLocal : {
            like: []
        };

    var saveToLocal = function(list) {
        localStorage.setItem('visitingUserList', JSON.stringify(list));
        return $q.when(list);
    };

    return {
        getCurrentList: function() {
            return likeList;
        },
        addToList: function(likeId) {
            return $q(function(resolve, reject) {
                if(likeList.like.indexOf(likeId) > -1) {
                    reject(new Error('You already liked!'));
                } else {
                    likeList.like.push(likeId);
                    resolve(saveToLocal(likeList));
                }
            });
        },
        updateList: function(likeId) {
            var indexToRemove = likeList.like.indexOf(likeId);
            likeList.like.splice(indexToRemove, 1);
            return saveToLocal(likeList);
        }
    };
});
