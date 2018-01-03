'use strict';


module.exports = function(Appuser) {

    /**
     * DB operation for fetching a single user details
     * @method searchUsr
     * @param {String} userId - user id in DB
     * @return {Promise} which resolves to object or reject with an error
     */
    let searchUsr = (userId) => {

        return new Promise((resolve, reject) => {
            Appuser.findOne({"where":{"id":userId}},function (err, res) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    };

    /**
     * DB operation for fetching  a list of user details
     * @method searchUsers
     * @param {Array} userIds
     * @return {Promise} which resolves to object or reject with an error
     */
    let searchUsers = (userIds) => {

        return new Promise((resolve, reject) => {
            Appuser.find({"where":{"id":{"inq":userIds}}},function (err, res) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    };

    /**
     * DB operation for updating user model with new tweet
     * @method updateUsr
     * @param {Object} userObj - user model object
     * @param {String} text - Tweet text
     * @return {Promise} which resolves to object or reject with an error
     */
    let updateUsr = (userObj, text) => {

        return new Promise((resolve, reject) => {
            userObj.tweets.push({"text" :text, "date_time": new Date()});
            Appuser.updateAll({id: userObj.id}, userObj, function (err, res) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    };

    /**
     * DB operation for updating following status for user
     * @method updateUsrFollow
     * @param {Object} userObj - user model object
     * @param {String} followUsrId - user Id of person to follow
     * @return {Promise} which resolves to object or reject with an error
     */
    let updateUsrFollow = (userObj, followUsrId) => {

        return new Promise((resolve, reject) => {
            userObj.following.push({"userId": followUsrId});
            Appuser.updateAll({id: userObj.id},userObj,function (err, res) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    };


    /**
     * DB operation for updating follower status for user
     * @method updateUsrFollower
     * @param {Object} userObj - user model object
     * @param {String} followUsrId - user Id of person to follow
     * @return {Promise} which resolves to object or reject with an error
     */
    let updateUsrFollower = (userObj, followUsrId) => {

        return new Promise((resolve, reject) => {
            userObj.followers.push({"userId": followUsrId});
            Appuser.updateAll({id: userObj.id}, userObj,function (err, res) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    };

    /**
     * Utility function for checking if user is already being followed
     * @method isAlreadyFollowing
     * @param {Object} usr - user model object
     * @param {String} followUsrId - user Id of person to follow
     * @return {Boolean}
     */
    let isAlreadyFollowing = (usr, followUsrId) => {
        return usr.following.some(function (followingUsrId) {
            return (followUsrId.toString() == followingUsrId.userId.toString())
        });
    };

    let getCurrentUserId = (options) => {
        const token = options && options.accessToken;
        return token.userId.toString();
    };


    /**
     * Add new tweet for given user
     * @method addTweet
     * @param {String} userId - logging in user ID
     * @param {String} text tweet text
     * @return {Promise} which resolves to object or reject with an error
     */
    async function addTweet(userId, text) {
        let usr = await searchUsr(userId);
        await updateUsr(usr, text);
        return "updated";
    };

    /**
     * Update status for user being followed
     * @method followUsr
     * @param {String} userId       logged in user
     * @param {String} followUsrId  user id to be followed
     * @return {Promise} which resolves to object or reject with an error
     */
    async function followUsr(userId, followUsrId) {

        let usr = await searchUsr(userId);
        if(usr){
            if(!isAlreadyFollowing(usr, followUsrId)){
                await updateUsrFollow(usr, followUsrId);
                let followerUsr = await searchUsr(followUsrId);

                await updateUsrFollower(followerUsr, userId);
                return "updated";
            }
            else {
                return "Already Existing";
            }
        }
        else{
            return "No user found";
        }
    };


    /**
     * Fetch list of all followers
     * @method listOfFollowers
     * @param {String} userId  logging in user ID
     * @return {Promise} which resolves to object or reject with an error
     */
    async function listOfFollowers(userId) {
        let usr = await searchUsr(userId);
        if(usr && usr.followers && usr.followers.length){
            let arrUsers = [];
            usr.followers.map(function (follower) {
                arrUsers.push(follower.userId);
            });
            let usrs = await searchUsers(arrUsers);

            return usrs;
        }

        return {};
    };

    /**
     * Fetch list of user given user is following
     * @method listOfFollowing
     * @param {String} userId - logging in user ID
     * @return {Promise} which resolves to object or reject with an error
     */
    async function listOfFollowing(userId) {
        let usr = await searchUsr(userId);
        if(usr && usr.following && usr.following.length){
            let arrUsers = [];
            usr.following.map(function (following) {
                arrUsers.push(following.userId);
            });
            let usrs = await searchUsers(arrUsers);

            return usrs;
        }

        return {};
    };

    /**
     * Get list of tweets for logged in user
     * @method tweets
     * @param {String} userId  - logged in user id
     * @return {Promise} which resolves to object or reject with an error
     */
    async function tweets(userId) {

        let usr = await searchUsr(userId);
        let usrFollowing = await listOfFollowing(userId);

        let arrTweet = [];

        if(usr.tweets){
          arrTweet.push(usr.tweets);
        }
        if(Object.keys(usrFollowing).length !== 0){
            usrFollowing.map(function (userObj) {
                if(userObj.tweets){
                    arrTweet.push(userObj.tweets);
                }
            });
        } 

        return arrTweet;
    };


    /**
     * Add new tweet for given user
     * @method addTweet
     * @param {Object} options
     * @param {String} text tweet text
     * @param {requestCallback} cb - The callback that handles the response.
     */
    Appuser.tweet = function(options, text, cb) {
        let userId = getCurrentUserId(options);
        addTweet(userId, text).then(function (res) {
          cb(null, res);
        });
    };

    /**
     * Update status for user being followed
     * @method follow
     * @param {Object} options
     * @param {String} followUsrId User ID to follow
     * @param {requestCallback} cb - The callback that handles the response.
     */
    Appuser.follow = function(options, followUsrId, cb) {
        let userId = getCurrentUserId(options);
        followUsr(userId, followUsrId).then(function (res) {
            cb(null, res);
        });

    };


    /**
     * Fetch list of all followers
     * @method listOfFollowers
     * @param {Object} options
     * @param {requestCallback} cb - The callback that handles the response.
     */
    Appuser.listOfFollowers = function (options, cb) {
        let userId = getCurrentUserId(options);
        listOfFollowers(userId).then(function (res) {
            cb(null, res);
        });
    };

    /**
     * Fetch list of user given user is following
     * @method listOfFollowing
     * @param {Object} options
     * @param {requestCallback} cb - The callback that handles the response.
     */
    Appuser.listOfFollowing = function (options, cb) {
        let userId = getCurrentUserId(options);
        listOfFollowing(userId).then(function (res) {
            cb(null, res);
        });
    };

    /**
     * Get list of tweets for logged in user
     * @method tweets
     * @param {Object} options
     * @param {requestCallback} cb - The callback that handles the response.
     */
    Appuser.tweets = function (options, cb) {
        let userId = getCurrentUserId(options);
        tweets(userId).then(function (res) {
            cb(null, res);
        });
    };

    /**
     * Remote method for adding new tweet
     */
    Appuser.remoteMethod('tweet',{
        accepts: [
            {"arg": "options", "type": "object", "http": "optionsFromRequest"},
            {"arg": "text", "type": "string"}
        ],
        returns: {arg: 'response', type: 'string'}
    });

    /**
     * Remote method for viewing user tweets
     */
    Appuser.remoteMethod('tweets',{
        accepts: [
            {"arg": "options", "type": "object", "http": "optionsFromRequest"}
        ],
        http: {verb: 'get'},
        returns: {arg: 'response', type: 'string'}
    });

    /**
     * Remote method for following a given user
     */
    Appuser.remoteMethod('follow',{
        accepts: [
            {"arg": "options", "type": "object", "http": "optionsFromRequest"},
            {"arg": "text", "type": "string"}
        ],
        returns: {arg: 'response', type: 'string'}
    });

    /**
     * Remote method for fetching list of followers for a given user
     */
    Appuser.remoteMethod('listOfFollowers',{
        accepts: [
            {"arg": "options", "type": "object", "http": "optionsFromRequest"}
        ],
        returns: {arg: 'response', type: 'string'}
    });

    /**
     * Remote method for fetching list user following
     */
    Appuser.remoteMethod('listOfFollowing',{
        accepts: [
            {"arg": "options", "type": "object", "http": "optionsFromRequest"}
        ],
        returns: {arg: 'response', type: 'string'}
    });
};
