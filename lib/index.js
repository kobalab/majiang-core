/*!
 *  @kobalab/majiang-core v0.2.10
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-core/blob/master/LICENSE
 */

"use strict";

import rule from './rule';
import Shoupai from './shoupai'
import Shan from './shan'
import He from './he'
import Board from './board'
import Game from './game'
import Player from './player'
import Util from './util'

// ESM 部分導入に対応。用例：
// import { Game } from '@kobalab/majiang-core';
export {
    rule,
    Shoupai,
    Shan,
    He,
    Board,
    Game,
    Player,
    Util
};

// ESM や CommonJS 全体導入に対応。用例：
// import Majiang from '@kobalab/majiang-core';     // ESM
// const Majiang = require('@kobalab/majiang-core') // CommonJS
export default {
    rule,
    Shoupai,
    Shan,
    He,
    Board,
    Game,
    Player,
    Util
};
