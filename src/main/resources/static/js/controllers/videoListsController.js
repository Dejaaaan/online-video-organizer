(function () {
    angular.module('app')
        .controller('VideoListsController', VideoListsController);

    VideoListsController.$inject = ['$location', '$http', '$route', '$window', 'VideoListsService', 'VideoService', 'UserService'];

    function VideoListsController($location, $http, $route, $window, VideoListsService, VideoService, UserService) {

        var videoListsCtrl = this;
        videoListsCtrl.addVideoList = addVideoList;
        videoListsCtrl.deleteVideoList = deleteVideoList;
        videoListsCtrl.editVideoList = editVideoList;
        videoListsCtrl.saveVideoList = saveVideoList;
        videoListsCtrl.selectVideo = selectVideo;
        videoListsCtrl.selectVideoList = selectVideoList;
        videoListsCtrl.selectedVideoList = selectedVideoList;
        videoListsCtrl.operation;
        videoListsCtrl.getVideosByVideoList = getVideosByVideoList;
        videoListsCtrl.addVideo = addVideo;
        videoListsCtrl.saveVideo = saveVideo;
        videoListsCtrl.deleteVideo = deleteVideo;
        videoListsCtrl.orderBy = orderBy;
        videoListsCtrl.order = 'id';
        videoListsCtrl.reverseOrder = false;

        videoListsCtrl.scrollbarsConfig = {
            axis: 'y',
            autoHideScrollbar: true,
            alwaysShowScrollbar: 1,
            theme: 'rounded-dots-dark',
            advanced: {
                updateOnContentResize: true
            },
            //setHeight: $window.innerHeight - 153,
            scrollInertia: 500,
        }

        init();

        function init() {
            videoListsCtrl.videoLists = {};
            videoListsCtrl.videos;
            videoListsCtrl.loggedInUser = {
                id: UserService.getLoggedInUserId()
            };
            if (videoListsCtrl.loggedInUser) {
                getVideoListsByUserId(videoListsCtrl.loggedInUser);
            }
        }
       
        function orderBy(order) {
        	videoListsCtrl.reverseOrder = (videoListsCtrl.order === order) ? !videoListsCtrl.reverseOrder : false;
        	videoListsCtrl.order = order;
        }

        function addVideoList() {
            videoListsCtrl.operation = "Add";
            videoListsCtrl.videoList = {
                visible: true
            };
            videoListsCtrl.addVideoListsForm.$setPristine();
        }

        function editVideoList(videoList) {
            videoListsCtrl.operation = "Edit";
            videoListsCtrl.videoList = angular.copy(videoList);
        }

        function saveVideoList(videoList) {
            videoList.user = videoListsCtrl.loggedInUser;
            VideoListsService.saveVideoList(videoList).then(function (response) {
                getVideoListsByUserId(videoListsCtrl.loggedInUser);
                $('#add-lists-modal').modal('hide');
            }, function (error) {

            })
        }

        function selectVideoList(videoList) {
            videoListsCtrl.videoList = videoList;
        }

        function selectedVideoList() {
            return videoListsCtrl.videoList;
        }

        function deleteVideoList() {
            VideoListsService.deleteVideoList(videoListsCtrl.videoList.id).then(function (response) {
                getVideoListsByUserId(videoListsCtrl.loggedInUser);
            }, function (error) {

            });
            videoListsCtrl.videoList = {};
        }


        function getVideoListsByUserId(loggedInUser) {
            VideoListsService.getVideoListsByUserId(loggedInUser.id).then(handleSuccessVideoLists);
        }


        function handleSuccessVideoLists(response, status) {
            videoListsCtrl.videoLists = response.data;
        }

        function getVideosByVideoList(videoListId) {
            VideoService.getVideosByVideoListId(videoListId).then(function (response) {
                videoListsCtrl.videos = response.data;
            })
        }

        function addVideo(video) {
            if(!video.id)
                video.visible = true;
            videoListsCtrl.video = video;
            $('#add-video-modal').modal('show');
        }

        function saveVideo(video) {
            if (!video.videoTag) {
                video.videoTag = [];
            }
            video.videoList = videoListsCtrl.videoList;
            video.user = {
                id: UserService.getLoggedInUserId()
            };
            console.log(video);
            VideoService.saveVideo(video).then(function (response) {
                console.log(response.data);
                getVideoListsByUserId(videoListsCtrl.loggedInUser);
                getVideosByVideoList(videoListsCtrl.videoList.id);
            });
            $('#add-video-modal').modal('hide');
        }

        function selectVideo(video) {
            videoListsCtrl.video = video;
        }
        
        function deleteVideo() {
            VideoService.deleteVideo(videoListsCtrl.video.id).then(function (response) {
                getVideosByVideoList(videoListsCtrl.video.videoList.id);
            }, function (error) {

            });
            //videoListsCtrl.video = {};
        }

    }

})();
