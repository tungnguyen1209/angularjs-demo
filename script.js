var angularJsDemo = angular.module('angularJsDemo', ['angularJsDemo.post.controller']);

// post controller module
angular.module('angularJsDemo.post.controller', ['angularJsDemo.post.service'])
    .controller('postController', function postController($scope, postService) {
        $scope.allPosts = [];
        $scope.posts = [];
        $scope.perPage = 10;
        $scope.numberPages = 0;
        $scope.currentEditPost = {};
        $scope.listPagination = []
        $scope.isSaving = false;
        $scope.curPage = 1;
        $scope.searchKey = "";
        $scope.postResults = [];
        var postsData = postService.getAllPosts();

        postsData.then(
            function (posts) {
                var postData = posts.data;
                $scope.allPosts = angular.copy(postData);
                $scope.postResults = angular.copy(postData);
                $scope.numberPages = Math.ceil(postData.length / $scope.perPage);
                for (var i = 1; i <= $scope.numberPages; i++) {
                    $scope.listPagination.push({
                        page: i,
                        active: i == $scope.curPage
                    })
                }

                $scope.posts = postData.splice(($scope.curPage - 1) * $scope.perPage, $scope.perPage);
            },
            function () {
                alert('Something went wrong!');
            }
        );

        $scope.addPost = function () {
            document.getElementById('myModal').style.display = 'flex';
        }

        $scope.edit = function (post) {
            $scope.currentEditPost = angular.copy(post);
            document.getElementById('myModal').style.display = 'flex';
        }

        $scope.cancel = function () {
            document.getElementById('myModal').style.display = 'none';
        }

        $scope.toPage = function (page) {
            $scope.curPage = angular.copy(page);
            var posts = angular.copy($scope.allPosts);
            $scope.posts = posts.splice(($scope.curPage - 1) * $scope.perPage, $scope.perPage);
            const curPageIndex = $scope.listPagination.findIndex(obj => obj.active == true);
            const pageIndex = $scope.listPagination.findIndex(obj => obj.page == page);
            $scope.listPagination[curPageIndex].active = false;
            $scope.listPagination[pageIndex].active = true;
        }

        $scope.save = function () {
            $scope.isSaving = true;
            var postData = angular.copy($scope.currentEditPost);
            if (postData.id) {
                postService.savePost(postData, postData.id).then(function (response) {
                    if (response.status === 200) {
                        const postUpdatedIndex = $scope.posts.findIndex(obj => obj.id == postData.id);
                        $scope.posts[postUpdatedIndex] = response.data;
                        $scope.isSaving = false;
                        document.getElementById('myModal').style.display = 'none';
                        $scope.currentEditPost = {};
                    } else {
                        alert('Something went wrong!');
                    }
                })
            } else {
                postService.savePost(postData).then(function (response) {
                    if (response.status === 201) {
                        $scope.isSaving = false;
                        $scope.allPosts.unshift(response.data);
                        $scope.numberPages = Math.ceil($scope.allPosts.length / $scope.perPage);
                        $scope.listPagination = [];
                        for (var i = 1; i <= $scope.numberPages; i++) {
                            $scope.listPagination.push({
                                page: i,
                                active: i == $scope.curPage
                            })
                        }

                        var posts = angular.copy($scope.allPosts);
                        $scope.posts = posts.splice(($scope.curPage - 1) * $scope.perPage, $scope.perPage);
                        document.getElementById('myModal').style.display = 'none';
                        $scope.currentEditPost = {};
                    } else {
                        alert('Something went wrong!');
                    }
                })
            }
        }
        
        $scope.remove = function (post) {
            var deletePost = postService.deletePost(post.id);
            deletePost.then(function (response) {
                if (response.status === 200) {
                    $scope.allPosts = $scope.allPosts.filter((postItem) => postItem.id != post.id);
                    $scope.numberPages = Math.ceil($scope.allPosts.length / $scope.perPage);
                    $scope.listPagination = [];
                    for (var i = 1; i <= $scope.numberPages; i++) {
                        $scope.listPagination.push({
                            page: i,
                            active: i == $scope.curPage
                        })
                    }

                    var posts = angular.copy($scope.allPosts);
                    $scope.posts = posts.splice(($scope.curPage - 1) * $scope.perPage, $scope.perPage);
                } else {
                    alert('Something went wrong!');
                }
            })
        }

        $scope.searchPost = function () {
            $scope.allPosts = $scope.postResults.filter((postItem) => (postItem.title.includes($scope.searchKey) || postItem.body.includes($scope.searchKey)));
            $scope.numberPages = Math.ceil($scope.allPosts.length / $scope.perPage);
            $scope.listPagination = [];
            for (var i = 1; i <= $scope.numberPages; i++) {
                $scope.listPagination.push({
                    page: i,
                    active: i == $scope.curPage
                })
            }

            var postResults = angular.copy($scope.allPosts);
            $scope.posts = postResults.splice(($scope.curPage - 1) * $scope.perPage, $scope.perPage);
        }
});

// post service module
angular.module('angularJsDemo.post.service', [])
    .service('postService', function postService($http) {
        this.getAllPosts = function () {
            return $http.get('https://jsonplaceholder.typicode.com/posts');
        }

        this.savePost = function (postData, postId = undefined) {
            if (!postId) {
                return $http.post('https://jsonplaceholder.typicode.com/posts', postData);
            }

            return $http.patch('https://jsonplaceholder.typicode.com/posts/' + postId, postData);
        }

        this.deletePost = function (postId) {
            return $http.delete('https://jsonplaceholder.typicode.com/posts/' + postId);
        }
});


