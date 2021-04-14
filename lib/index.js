/*!
 *  majiang-core v0.0.1
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-core/blob/master/LICENSE
 */

"use strict";

const util = require('./xiangting');
util.hule        = require('./hule').hule;
util.hule_mianzi = require('./hule').hule_mianzi;

module.exports = {
    rule:    require('./rule'),
    Shoupai: require('./shoupai'),
    Shan:    require('./shan'),
    He:      require('./he'),
    Game:    require('./game'),
    Util:    util,
}
