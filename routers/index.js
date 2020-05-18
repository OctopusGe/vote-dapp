module.exports = function(app){

  // nodemon start

  /* user路由 */
  app.use('/api/user/login', require('./user/login'));
  app.use('/api/user/register', require('./user/register'));
  app.use('/api/user/vote', require('./user/vote'));
  app.use('/api/user/getBalance', require('./user/getBalance'));
  app.use('/api/user/getUserInfo', require('./user/getUserInfo'));
  app.use('/api/user/getUserVoted', require('./user/getUserVoted'));
  app.use('/register', require('./user/register2'));
  // app.use('/api/user/register', require('./users/register'))
  // app.use('/api/user/getUserInfo', require('./users/getUserInfo'))
  // app.use('/api/user/updateUserInfo', require('./users/updateUserInfo'))

  /* vote */
  app.use('/api/vote/createVote', require('./vote/createVote'));
  app.use('/api/vote/getVoteInfo', require('./vote/getVoteInfo'));
  app.use('/api/vote/buyToken', require('./vote/buyToken'));
  app.use('/api/vote/getVoteInfoList', require('./vote/getVoteInfoList'));


  /* common路由 */
  // app.use('/api/common/getOrgInfo', require('./common/getOrgInfo'))
  // app.use('/api/common/getMedicalServiceInfo', require('./common/getMedicalServiceInfo'))
  // app.use('/api/common/transferFromUser', require('./common/transferFromUser'))
  // app.use('/api/common/transferFromOrg', require('./common/transferFromOrg'))
  // app.use('/api/common/getServiceAndOrg', require('./common/getServiceAndOrg'))
  // app.use('/api/common/uploadOrgHealthData', require('./common/uploadOrgHealthData'))
  // app.use('/api/common/uploadUserHealthData', require('./common/uploadUserHealthData'))
};
