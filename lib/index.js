/*!
 *  @kobalab/majiang-core v1.1.0
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-core/blob/master/LICENSE
 */

"use strict";

module.exports = {
    rule:    require('./rule'),
    Shoupai: require('./shoupai'),
    Shan:    require('./shan'),
    He:      require('./he'),
    Board:   require('./board'),
    Game:    require('./game'),
    Player:  require('./player'),
    Util:    Object.assign(require('./xiangting'),
                           require('./hule'))
}
