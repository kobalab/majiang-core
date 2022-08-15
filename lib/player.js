/*
 *  Majiang.Player
 */
"use strict";

const Majiang = {
  Shoupai: require("./shoupai"),
  He: require("./he"),
  Game: require("./game"),
  Board: require("./board"),
  Util: Object.assign(require("./xiangting"), require("./hule")),
};

module.exports = class Player {
  /**
   * _model に空の卓情報をもつインスタンスを生成する。
   */
  constructor() {
    /**
     * Majiang.Board で設定する 卓情報。
     */
    this._model = new Majiang.Board();
  }

  /**
   * msg に対応するメソッドを呼び出す。
   * @param {Majiang.Message} msg
   * @param {function} callback
   */
  action(msg, callback) {
    /**
     * Majiang.Player#action 呼び出し時に指定された応答送信用関数。
     */
    this._callback = callback;

    if (msg.kaiju) this.kaiju(msg.kaiju);
    else if (msg.qipai) this.qipai(msg.qipai);
    else if (msg.zimo) this.zimo(msg.zimo);
    else if (msg.dapai) this.dapai(msg.dapai);
    else if (msg.fulou) this.fulou(msg.fulou);
    else if (msg.gang) this.gang(msg.gang);
    else if (msg.gangzimo) this.zimo(msg.gangzimo, true);
    else if (msg.kaigang) this.kaigang(msg.kaigang);
    else if (msg.hule) this.hule(msg.hule);
    else if (msg.pingju) this.pingju(msg.pingju);
    else if (msg.jieju) this.jieju(msg.jieju);
  }

  get shoupai() {
    return this._model.shoupai[this._menfeng];
  }
  get he() {
    return this._model.he[this._menfeng];
  }
  get shan() {
    return this._model.shan;
  }
  get hulepai() {
    return (
      (Majiang.Util.xiangting(this.shoupai) == 0 &&
        Majiang.Util.tingpai(this.shoupai)) ||
      []
    );
  }

  /**
   * kaiju から 卓情報 を初期化し、Majiang.Player#action_kaiju を呼び出し応答を返す。
   * @param {Majiang.Message} kaiju メッセージ#開局
   */
  kaiju(kaiju) {
    /**
     * メッセージ#開局 で通知された自身の席順(0: 仮東、1: 仮南、2: 仮西、3: 仮北)。
     */
    this._id = kaiju.id;
    /**
     * メッセージ#開局 で通知された対局の ルール。
     */
    this._rule = kaiju.rule;
    this._model.kaiju(kaiju);

    if (this._callback) this.action_kaiju(kaiju);
  }

  /**
   * qipai から 卓情報 を設定し、Majiang.Player#action_qipai を呼び出し応答を返す。
   * @param {Majiang.Message} qipai メッセージ#配牌
   */
  qipai(qipai) {
    this._model.qipai(qipai);
    /**
     * 現在の局の自風。(0: 東、1: 南、2: 西、3: 北)
     */
    this._menfeng = this._model.menfeng(this._id);
    /**
     * 第一ツモ巡の間は true。
     */
    this._diyizimo = true;
    /**
     * 現在の局で全ての対局者が行ったカンの総数。
     */
    this._n_gang = 0;
    /**
     * 自身のフリテン状態。ロン和了可能なら true。
     */
    this._neng_rong = true;

    if (this._callback) this.action_qipai(qipai);
  }

  /**
   * zimo から 卓情報 を設定し、Majiang.Player#action_zimo を呼び出し応答を返す。 gangzimo が真の場合は槓自摸を表す。
   * @param {Majiang.Message} zimo メッセージ#自摸 (もしくは メッセージ#槓自摸)
   * @param {boolean} gangzimo
   */
  zimo(zimo, gangzimo) {
    this._model.zimo(zimo);
    if (gangzimo) this._n_gang++;

    if (this._callback) this.action_zimo(zimo, gangzimo);
  }

  /**
   * dapai から 卓情報 を設定し、Majiang.Player#action_dapai を呼び出し応答を返す。
   * @param {Majiang.Message} dapai メッセージ#打牌
   */
  dapai(dapai) {
    if (dapai.l == this._menfeng) {
      if (!this.shoupai.lizhi) this._neng_rong = true;
    }

    this._model.dapai(dapai);

    if (this._callback) this.action_dapai(dapai);

    if (dapai.l == this._menfeng) {
      this._diyizimo = false;
      if (this.hulepai.find((p) => this.he.find(p))) this._neng_rong = false;
    } else {
      let s = dapai.p[0],
        n = +dapai.p[1] || 5;
      if (this.hulepai.find((p) => p == s + n)) this._neng_rong = false;
    }
  }

  /**
   * fulou から 卓情報 を設定し、Majiang.Player#action_fulou を呼び出し応答を返す。
   * @param {Majiang.Message} fulou メッセージ#副露
   */
  fulou(fulou) {
    this._model.fulou(fulou);

    if (this._callback) this.action_fulou(fulou);

    this._diyizimo = false;
  }

  /**
   * gang から 卓情報 を設定し、Majiang.Player#action_gang を呼び出し応答を返す。
   * @param {Majiang.Message} gang メッセージ#槓
   */
  gang(gang) {
    this._model.gang(gang);

    if (this._callback) this.action_gang(gang);

    this._diyizimo = false;
    if (gang.l != this._menfeng && !gang.m.match(/^[mpsz]\d{4}$/)) {
      let s = gang.m[0],
        n = +gang.m.substr(-1) || 5;
      if (this.hulepai.find((p) => p == s + n)) this._neng_rong = false;
    }
  }

  /**
   * kaigang から 卓情報 を設定する。
   * @param {Majiang.Message} kaigang メッセージ#開槓
   */
  kaigang(kaigang) {
    this._model.kaigang(kaigang);
  }

  /**
   * hule から 卓情報 を設定し、Majiang.Player#action_hule を呼び出し応答を返す。
   * @param {Majiang.Message} hule メッセージ#和了
   */
  hule(hule) {
    this._model.hule(hule);
    if (this._callback) this.action_hule(hule);
  }

  /**
   * pingju から 卓情報 を設定し、Majiang.Player#action_pingju を呼び出し応答を返す。
   * @param {Majiang.Message} pingju メッセージ#流局
   */
  pingju(pingju) {
    this._model.pingju(pingju);
    if (this._callback) this.action_pingju(pingju);
  }

  /**
   * Majiang.Player#action_jieju を呼び出し応答を返す。
   * @param {*} paipu 牌譜
   */
  jieju(paipu) {
    /**
     * メッセージ#終局 で伝えられた対戦結果の 牌譜。
     */
    this._paipu = paipu;
    if (this._callback) this.action_jieju(paipu);
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-get_dapai を呼び出し、shoupai が打牌可能な牌の一覧を返す。
   * @param {Majiang.Shoupai} shoupai
   * @returns {string[]} 牌の配列
   */
  get_dapai(shoupai) {
    return Majiang.Game.get_dapai(this._rule, shoupai);
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-get_chi_mianzi を呼び出し、shoupai が p でチー可能な面子の一覧を返す。
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p 牌
   * @returns {string[]} 面子の配列
   */
  get_chi_mianzi(shoupai, p) {
    return Majiang.Game.get_chi_mianzi(
      this._rule,
      shoupai,
      p,
      this.shan.paishu
    );
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-get_peng_mianzi を呼び出し、shoupai が p でポン可能な面子の一覧を返す。
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p 牌
   * @returns {string[]} 面子の配列
   */
  get_peng_mianzi(shoupai, p) {
    return Majiang.Game.get_peng_mianzi(
      this._rule,
      shoupai,
      p,
      this.shan.paishu
    );
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-get_gang_mianzi を呼び出し、shoupai がカン可能な面子の一覧を返す。 p が指定された場合は大明槓、null の場合は暗槓と加槓が対象になる。
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p 牌
   * @returns {string[]} 面子の配列
   */
  get_gang_mianzi(shoupai, p) {
    return Majiang.Game.get_gang_mianzi(
      this._rule,
      shoupai,
      p,
      this.shan.paishu,
      this._n_gang
    );
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-allow_lizhi を呼び出し、shoupai からリーチ可能か判定する。 p が null のときはリーチ可能な打牌一覧を返す。 p が牌のときは p を打牌してリーチ可能なら true を返す。
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p 牌
   * @returns {boolean}
   */
  allow_lizhi(shoupai, p) {
    return Majiang.Game.allow_lizhi(
      this._rule,
      shoupai,
      p,
      this.shan.paishu,
      this._model.defen[this._id]
    );
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-allow_hule を呼び出し、shoupai で和了可能か判定する。 p が null のときはツモ和了可能なら true を返す。 p が牌のときは p でロン和了可能なら true を返す。
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p 牌
   * @param {*} hupai
   * @returns {boolean}
   */
  allow_hule(shoupai, p, hupai) {
    hupai = hupai || shoupai.lizhi || this.shan.paishu == 0;
    return Majiang.Game.allow_hule(
      this._rule,
      shoupai,
      p,
      this._model.zhuangfeng,
      this._menfeng,
      hupai,
      this._neng_rong
    );
  }

  /**
   * ルール と 卓情報 を使用して Majiang.Game#static-allow_pingju を呼び出し、shoupai で九種九牌流局可能か判定する。
   * @param {Majiang.Shoupai} shoupai
   * @returns {boolean}
   */
  allow_pingju(shoupai) {
    return Majiang.Game.allow_pingju(this._rule, shoupai, this._diyizimo);
  }
};
