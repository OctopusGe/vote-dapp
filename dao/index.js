/* dao入口文件 */

let userDao= require('./userDao');
let userEthDao= require('./userEthDao');
let voteDao= require('./voteDao');
let voteEthDao= require('./voteEthDao');
let voterDao= require('./voterDao');
let voteTokenDao= require('./voteTokenDao');
let candidateDao= require('./candidateDao');

exports.userDao = userDao;
exports.userEthDao = userEthDao;
exports.voteDao = voteDao;
exports.voteEthDao = voteEthDao;
exports.voterDao = voterDao;
exports.voteTokenDao = voteTokenDao;
exports.candidateDao = candidateDao;