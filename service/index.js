/* service入口文件 */

//var adminService = require('./adminService');
var userService = require('./userService');
var voteService = require('./voteService');
//var orgService= require('./orgService');
var commonService = require('./commonService');

//exports.adminService = adminService;
exports.userService = userService;
exports.voteService = voteService;
//exports.orgService = orgService;
exports.commonService = commonService;