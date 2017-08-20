(function () {
    angular.module("app")
        .component("searchVideoProviders", {
            templateUrl: 'js/components/searchVideoProviders.html',
            bindings: {

            },
            controller: function ($http, $cookieStore) {
                var ctrl = this;

                ctrl.searchYouTube = searchYouTube;
                ctrl.searchVimeo = searchVimeo;
                ctrl.searchDailymotion = searchDailymotion;

                ctrl.providerVideoList = [];
                ctrl.progressBar = false;

                //YouTube
                const YOUTUBE_SERARCH_API_URL = "https://www.googleapis.com/youtube/v3/search";
                const YOUTUBE_API_KEY = "AIzaSyAODuK_7-4SIKgPBScK0y6pj7CX6s7E8X8";
                const YOUTUBE_RETURN_FIELDS = "items(id,snippet(title,description,thumbnails/high/url))";

                //Vimeo
                const VIMEO_SERARCH_API_URL = "https://api.vimeo.com/videos";
                const VIMEO_CLIENT_IDENTIFIER = "ef063f042ae1bca6baa3114e36a9218e4290bde5";
                const VIMEO_CLIENT_SECRET = "h/8ZgbQMhXbCqHEuPoXQv/2sAIHcL73zoo+4Hw4b5T964jZcJ7Dz0dx27gb2qeyMPn3i8W/w8mLQBqDuM7PMVjswoi/JzEGgPL5w1MQ06ggBvNm7EVDtNGskDiu4BBIZ";
                const VIMEO_AUTHORIZE_URL = "https://api.vimeo.com/oauth/authorize/client";
                const VIMEO_ACCESS_TOKEN_URL = "https://api.vimeo.com/oauth/access_token";
                const VIMEO_RETURN_FIELDS = "uri,name,link,description,tags.name,pictures.sizes.link";
                const VIMEO_TOKEN = "24649bd87ad57cf0331a1a5754464bf1";

                //Dailymotion
                const DAILYMOTION_SERARCH_API_URL = "https://api.dailymotion.com/videos";
                const DAILYMOTION_RETURN_FIELDS = "description,id,tags,thumbnail_360_url,title";

                //var vimeoToken = generateVimeoToken();
                var vimeoToken = VIMEO_TOKEN;

                function generateVimeoToken() {
                    var base64Credential = btoa(VIMEO_CLIENT_IDENTIFIER + ':' + VIMEO_CLIENT_SECRET);
                    var req = {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': undefined,
                            'Authorization': 'Basic ' + base64Credential
                        },
                        url: VIMEO_AUTHORIZE_URL,
                        data: {
                            'grant_type': 'client_credentials',
                        }
                    };

                    return $http(req)
                        .then(function (response) {
                            //$cookieStore.put('vimeoToken', response.data.access_token);
                            console.log(response.data.access_token);
                            return response.data.access_token;
                        }, function () {
                            // Error handler
                        }).finally(function () {
                            // Always execute this on both error and success
                        });
                }


                //Search YouTube
                function searchYouTube() {
                    ctrl.providerVideoList = [];
                    ctrl.progressBar = true;

                    var req = {
                        method: 'GET',
                        url: YOUTUBE_SERARCH_API_URL,
                        params: {
                            'maxResults': '25',
                            'part': 'snippet',
                            'fields': YOUTUBE_RETURN_FIELDS,
                            'q': ctrl.searchVideoTerm,
                            'type': 'video',
                            'key': YOUTUBE_API_KEY
                        }
                    };

                    $http(req)
                        .then(function (response) {
                            angular.forEach(response.data.items, function (item) {
                                var video = {
                                    provider: "youtube",
                                    id: item.id.videoId,
                                    title: item.snippet.title,
                                    description: item.snippet.description,
                                    thumbnail: item.snippet.thumbnails.high.url
                                }
                                ctrl.providerVideoList.push(video);
                            });
                            //ctrl.text = ctrl.providerVideoList;
                        }, function (error) {
                            // Error handler
                            ctrl.text = error.data;
                        }).finally(function () {
                            // Always execute this on both error and success
                            ctrl.progressBar = false;
                        });
                }



                //Search Vimeo
                function searchVimeo() {
                    ctrl.providerVideoList = [];
                    ctrl.progressBar = true;

                    //vimeoToken.then(function (vimeoToken) {
                    var req = {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': undefined
                        },
                        url: VIMEO_SERARCH_API_URL,
                        params: {
                            'fields': VIMEO_RETURN_FIELDS,
                            'per_page': '25',
                            'query': ctrl.searchVideoTerm,
                            'access_token': vimeoToken // $cookieStore.get('vimeoToken');
                        }
                    };

                    $http(req)
                        .then(function (response) {
                            angular.forEach(response.data.data, function (item) {
                                var video = {
                                    provider: "vimeo",
                                    id: item.uri.split('/videos/')[1],
                                    title: item.name,
                                    description: item.description,
                                    thumbnail: item.pictures.sizes[3].link,
                                    tags: item.tags
                                }
                                ctrl.providerVideoList.push(video);
                            });
                            //ctrl.text = response.data;
                        }, function (error) {
                            // Error handler
                            ctrl.text = error.data.error;
                        }).finally(function () {
                            // Always execute this on both error and success
                            ctrl.progressBar = false;
                        });
                    //});
                }



                //Search Dailymotion
                function searchDailymotion() {
                    ctrl.providerVideoList = [];
                    ctrl.progressBar = true;

                    var req = {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': undefined
                        },
                        url: DAILYMOTION_SERARCH_API_URL,
                        params: {
                            'limit': '25',
                            'fields': DAILYMOTION_RETURN_FIELDS,
                            'search': ctrl.searchVideoTerm,
                        }
                    };

                    $http(req)
                        .then(function (response) {
                            angular.forEach(response.data.list, function (item) {
                                var video = {
                                    provider: "dailymotion",
                                    id: item.id,
                                    title: item.title,
                                    description: item.description,
                                    thumbnail: item.thumbnail_360_url,
                                    tags: item.tags
                                }
                                ctrl.providerVideoList.push(video);
                            });
                            //ctrl.text = response.data;
                        }, function (error) {
                            // Error handler
                            ctrl.text = error.data;
                        }).finally(function () {
                            // Always execute this on both error and success
                            ctrl.progressBar = false;
                        });
                }
            }
        });
})();
