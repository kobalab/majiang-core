/*
 *  Majiang.Game
 */
"use strict";

const Majiang = {
  rule: require("./rule"),
  Shoupai: require("./shoupai"),
  Shan: require("./shan"),
  He: require("./he"),
  Util: Object.assign(require("./xiangting"), require("./hule")),
};

module.exports = class Game {
  /**
   *players で指定された4名を対局者とし、rule で指定されたルールにしたがい対局を行う。 対局終了時に callback で指定した関数が呼ばれる(対局の牌譜が引数で渡される)。 title で牌譜に残すタイトルを指定できる。 rule を省略した場合は、Majiang.rule() の呼び出しで得られるルールの初期値が採用される。
   * @param {Majiang.Player[]} players
   * @param {function} callback
   * @param {Majiang.Rule} rule
   * @param {string} title
   */
  constructor(players, callback, rule, title) {
    /**
     *インスタンス生成時に指定された Majiang.Player の配列。
     * @type {Majiang.Player[]}
     */
    this._players = players;
    /**
     *インスタンス生成時に指定された対局終了時に呼び出す関数。
     * @type {function}
     */
    this._callback = callback || (() => {});
    /**
     *インスタンス生成時に指定された ルール。
     * @type {Majiang.Rule}
     */
    this._rule = rule || Majiang.rule();
    /**
     * 卓情報
     */
    this._model = {
      title: title || "電脳麻将\n" + new Date().toLocaleString(),
      player: ["私", "下家", "対面", "上家"],
      qijia: 0,
      zhuangfeng: 0,
      jushu: 0,
      changbang: 0,
      lizhibang: 0,
      defen: [0, 0, 0, 0].map((x) => this._rule["配給原点"]),
      shan: null,
      shoupai: [],
      he: [],
      player_id: [0, 1, 2, 3],
    };

    /**
     * 卓情報 を描画するクラス。 Majiang.Game からは適切なタイミングでメソッドを呼び出して描画のきっかけを与える。
     */
    this._view;

    /**
     *Majiang.Game#call_players を呼び出した際の type を保存する。
     */
    this._status;
    /**
     * 対局者からの応答を格納する配列。 Majiang.Game#call_players 呼び出し時に配列を生成する。
     */
    this._reply = [];

    /**
     * true の場合、同期モードとなり、setTimeout() による非同期呼び出しは行わない。
     */
    this._sync = false;
    /**
     * 関数が設定されている場合、Majiang.Game#next 呼び出しの際にその関数を呼び出して処理を停止する。
     */
    this._stop = null;
    /**
     * 局の進行速度。0～5 で指定する。初期値は 3。 指定された速度 × 200(ms) で Majiang.Game#next を呼び出すことで局の進行速度を調整する。
     */
    this._speed = 3;
    /**
     * ダイアログへの応答速度(ms)。初期値は 0。 指定された時間後に Majiang.Game#next を呼び出す。
     */
    this._wait = 0;
    /**
     * 非同期で Majiang.Game#next を呼び出すタイマーのID。 値が設定されていれば非同期呼出し待ちであり、clearTimeout() を呼び出せば非同期呼出しをキャンセルできる。
     */
    this._timeout_id;
  }

  get model() {
    return this._model;
  }
  set view(view) {
    this._view = view;
  }
  get speed() {
    return this._speed;
  }
  set speed(speed) {
    this._speed = speed;
  }
  set wait(wait) {
    this._wait = wait;
  }

  /**
   * インスタンス変数 _paipu の適切な位置に摸打情報を追加する。
   * @param {*} paipu 牌譜の摸打情報
   */
  add_paipu(paipu) {
    this._paipu.log[this._paipu.log.length - 1].push(paipu);
  }

  /**
   * timeout で指定した時間(ms)休止した後に callback を呼び出す。 ゲームに「タメ」を作るためにチー/ポンなどの発声のタイミングで呼び出される。 timeout の指定がない場合は、インスタンス変数 _speed に応じて待ち時間を決定するが、最低でも 500ms は待ち合わせる。
   * @param {function} callback
   * @param {number} timeout
   * @returns
   */
  delay(callback, timeout) {
    if (this._sync) return callback();

    timeout =
      this._speed == 0
        ? 0
        : timeout == null
        ? Math.max(500, this._speed * 200)
        : timeout;
    setTimeout(callback, timeout);
  }

  /**
   * 非同期モードの対局を停止する。 停止の際に callback を呼び出す。
   * @param {function} callback
   */
  stop(callback = () => {}) {
    this._timeout_id = clearTimeout(this._timeout_id);
    this._stop = callback;
  }

  /**
   * 非同期モードの対局を再開する。
   * @returns
   */
  start() {
    if (this._timeout_id) return;
    this._stop = null;
    this._timeout_id = setTimeout(() => this.next(), 0);
  }

  /**
   * 対局者に msg を通知する。対局者からの応答はない。 type は メッセージ の種別を示す。
   * @param {string} type
   * @param {Majiang.Message} msg
   */
  notify_players(type, msg) {
    for (let l = 0; l < 4; l++) {
      let id = this._model.player_id[l];
      if (this._sync) this._players[id].action(msg[l]);
      else
        setTimeout(() => {
          this._players[id].action(msg[l]);
        }, 0);
    }
  }

  /**
   * 対局者に msg を通知する。 対局者からの応答を待って、Majiang.Game#next が非同期に呼び出される。 type は メッセージ の種別を示す。 timeout で Majiang.Game#next 呼び出しまでの待ち時間(ms)を指定し、局の進行速度を調整することもできる。 timeout の指定がない場合は、インスタンス変数 _speed に応じて待ち時間を決定する。
   * @param {string} type
   * @param {Majiang.Message} msg
   * @param {number} timeout
   */
  call_players(type, msg, timeout) {
    timeout =
      this._speed == 0 ? 0 : timeout == null ? this._speed * 200 : timeout;
    this._status = type;
    this._reply = [];
    for (let l = 0; l < 4; l++) {
      let id = this._model.player_id[l];
      if (this._sync)
        this._players[id].action(msg[l], (reply) => this.reply(id, reply));
      else
        setTimeout(() => {
          this._players[id].action(msg[l], (reply) => this.reply(id, reply));
        }, 0);
    }
    if (!this._sync) this._timeout_id = setTimeout(() => this.next(), timeout);
  }

  /**
   * 対局者が応答の際に呼び出す。 id は対局者の席順(0〜3)、reply は応答内容。
   * @param {number} id
   * @param {Majiang.Message} reply
   * @returns
   */
  reply(id, reply) {
    this._reply[id] = reply || {};
    if (this._sync) return;
    if (this._reply.filter((x) => x).length < 4) return;
    if (!this._timeout_id) this._timeout_id = setTimeout(() => this.next(), 0);
  }

  /**
   * 対局者からの応答を読み出し、対局の次のステップに進む。
   * @returns
   */
  next() {
    this._timeout_id = clearTimeout(this._timeout_id);
    if (this._reply.filter((x) => x).length < 4) return;
    if (this._stop) return this._stop();

    if (this._status == "kaiju") this.reply_kaiju();
    else if (this._status == "qipai") this.reply_qipai();
    else if (this._status == "zimo") this.reply_zimo();
    else if (this._status == "dapai") this.reply_dapai();
    else if (this._status == "fulou") this.reply_fulou();
    else if (this._status == "gang") this.reply_gang();
    else if (this._status == "gangzimo") this.reply_zimo();
    else if (this._status == "hule") this.reply_hule();
    else if (this._status == "pingju") this.reply_pingju();
    else this._callback(this._paipu);
  }

  /**
   * デバッグ用。同期モードで対局を開始する。 対局終了まで一切の非同期呼び出しは行わず、無停止で対局を完了する。
   * @returns
   */
  do_sync() {
    ge;
    this._sync = true;

    this.kaiju();

    for (;;) {
      if (this._status == "kaiju") this.reply_kaiju();
      else if (this._status == "qipai") this.reply_qipai();
      else if (this._status == "zimo") this.reply_zimo();
      else if (this._status == "dapai") this.reply_dapai();
      else if (this._status == "fulou") this.reply_fulou();
      else if (this._status == "gang") this.reply_gang();
      else if (this._status == "gangzimo") this.reply_zimo();
      else if (this._status == "hule") this.reply_hule();
      else if (this._status == "pingju") this.reply_pingju();
      else break;
    }

    this._callback(this._paipu);

    return this;
  }

  /**
   * 非同期モードで対局を開始する。 qijia で起家を指定することもできる(0〜3)。 qijia を指定しない場合はランダムに起家を決定する。
   * @param {0|1|2} qijia
   */
  kaiju(qijia) {
    this._model.qijia = qijia == null ? Math.floor(Math.random() * 4) : qijia;
    this._paipu = {
      title: this._model.title,
      player: this._model.player,
      qijia: this._model.qijia,
      log: [],
      defen: this._model.defen.concat(),
      point: [],
      rank: [],
    };

    /**
     * 最終局(オーラス)の局数。東風戦の場合、初期値は 3。東南戦なら 7。 延長戦により最終局が移動する場合はこの値を変更する。
     */
    this._max_jushu = this._rule["場数"] == 0 ? 0 : this._rule["場数"] * 4 - 1;

    let msg = [];
    for (let id = 0; id < 4; id++) {
      msg[id] = JSON.parse(
        JSON.stringify({
          kaiju: {
            id: id,
            rule: this._rule,
            title: this._paipu.title,
            player: this._paipu.player,
            qijia: this._paipu.qijia,
          },
        })
      );
    }
    this.call_players("kaiju", msg, 0);

    if (this._view) this._view.kaiju();
  }

  /**
   * 配牌の局進行
   * @param {Majiang.Shan} shan 牌山
   */
  qipai(shan) {
    let model = this._model;

    model.shan = shan || new Majiang.Shan(this._rule);
    let qipai = [];
    for (let l = 0; l < 4; l++) {
      qipai[l] = [];
      for (let i = 0; i < 13; i++) {
        qipai[l].push(model.shan.zimo());
      }
      model.shoupai[l] = new Majiang.Shoupai(qipai[l]);
      model.he[l] = new Majiang.He();
      model.player_id[l] = (model.qijia + model.jushu + l) % 4;
    }
    model.lunban = -1;

    /**
     *第一ツモ巡の間は true。
     */
    this._diyizimo = true;
    /**
     *四風連打の可能性がある間は true。
     */
    this._fengpai = this._rule["途中流局あり"];

    /**
     * 最後に打牌した 牌。次の打牌で上書きする。
     */
    this._dapai = null;
    /**
     * 現在処理中のカンの 面子。開槓すると null に戻す。
     */
    this._gang = null;

    /**
     * 各対局者(その局の東家からの順)のリーチ状態を示す配列。 0: リーチなし、1: 通常のリーチ、2: ダブルリーチ。
     */
    this._lizhi = [0, 0, 0, 0];
    /**
     *各対局者が一発可能かを示す配列。 添え字は手番(0: 東、1: 南、2: 西、3: 北)。
     */
    this._yifa = [0, 0, 0, 0];
    /**
     * 各対局者が行ったカンの数。 添え字は手番(0: 東、1: 南、2: 西、3: 北)。
     */
    this._n_gang = [0, 0, 0, 0];
    /**
     * 各対局者のフリテン状態。 添え字は手番(0: 東、1: 南、2: 西、3: 北)。 ロン和了可能なら true。
     */
    this._neng_rong = [1, 1, 1, 1];

    /**
     * 和了応答した対局者の手番(0: 東、1: 南、2: 西、3: 北)の配列。 南家、西家のダブロンの時は [ 1, 2 ] となる。
     */
    this._hule = [];
    /**
     * 処理中の和了が槍槓のとき qiangang、嶺上開花のとき lingshang、それ以外なら null。
     */
    this._hule_option = null;
    /**
     * 途中流局の処理中のとき true。
     */
    this._no_game = false;
    /**
     *連荘の処理中のとき true。
     */
    this._lianzhuang = false;
    /**
     * 現在処理中の局開始時の積み棒の数。
     */
    this._changbang = model.changbang;
    /**
     * 現在処理中の和了、あるいは流局で移動する点数の配列。 添え字は手番(0: 東、1: 南、2: 西、3: 北)。
     */
    this._fenpei = null;

    this._paipu.defen = model.defen.concat();
    this._paipu.log.push([]);
    let paipu = {
      qipai: {
        zhuangfeng: model.zhuangfeng,
        jushu: model.jushu,
        changbang: model.changbang,
        lizhibang: model.lizhibang,
        defen: model.player_id.map((id) => model.defen[id]),
        baopai: model.shan.baopai[0],
        shoupai: model.shoupai.map((shoupai) => shoupai.toString()),
      },
    };
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
      for (let i = 0; i < 4; i++) {
        if (i != l) msg[l].qipai.shoupai[i] = "";
      }
    }
    this.call_players("qipai", msg, 0);

    if (this._view) this._view.redraw();
  }

  /**
   *ツモの局進行を行う。
   */
  zimo() {
    let model = this._model;

    model.lunban = (model.lunban + 1) % 4;

    let zimo = model.shan.zimo();
    model.shoupai[model.lunban].zimo(zimo);

    let paipu = { zimo: { l: model.lunban, p: zimo } };
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
      if (l != model.lunban) msg[l].zimo.p = "";
    }
    this.call_players("zimo", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   *dapai で指定された牌を打牌する局進行を行う。
   * @param {string} dapai 牌
   */
  dapai(dapai) {
    let model = this._model;

    this._yifa[model.lunban] = 0;

    if (!model.shoupai[model.lunban].lizhi)
      this._neng_rong[model.lunban] = true;

    model.shoupai[model.lunban].dapai(dapai);
    model.he[model.lunban].dapai(dapai);

    if (this._diyizimo) {
      if (!dapai.match(/^z[1234]/)) this._fengpai = false;
      if (this._dapai && this._dapai.substr(0, 2) != dapai.substr(0, 2))
        this._fengpai = false;
    } else this._fengpai = false;

    if (dapai.substr(-1) == "*") {
      this._lizhi[model.lunban] = this._diyizimo ? 2 : 1;
      this._yifa[model.lunban] = this._rule["一発あり"];
    }

    if (
      Majiang.Util.xiangting(model.shoupai[model.lunban]) == 0 &&
      Majiang.Util.tingpai(model.shoupai[model.lunban]).find((p) =>
        model.he[model.lunban].find(p)
      )
    ) {
      this._neng_rong[model.lunban] = false;
    }

    this._dapai = dapai;

    let paipu = { dapai: { l: model.lunban, p: dapai } };
    this.add_paipu(paipu);

    if (this._gang) this.kaigang();

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("dapai", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   * fulou で指定された面子を副露する局進行を行う。 大明槓は副露に含める。
   * @param {string} fulou 面子
   */
  fulou(fulou) {
    let model = this._model;

    this._diyizimo = false;
    this._yifa = [0, 0, 0, 0];

    model.he[model.lunban].fulou(fulou);

    let d = fulou.match(/[\+\=\-]/);
    model.lunban = (model.lunban + "_-=+".indexOf(d)) % 4;

    model.shoupai[model.lunban].fulou(fulou);

    if (fulou.match(/^[mpsz]\d{4}/)) {
      this._gang = fulou;
      this._n_gang[model.lunban]++;
    }

    let paipu = { fulou: { l: model.lunban, m: fulou } };
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("fulou", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   * gang で指定された面子で加槓あるいは暗槓する局進行を行う。
   * @param {string} gang 面子
   */
  gang(gang) {
    let model = this._model;

    model.shoupai[model.lunban].gang(gang);

    let paipu = { gang: { l: model.lunban, m: gang } };
    this.add_paipu(paipu);

    if (this._gang) this.kaigang();

    this._gang = gang;
    this._n_gang[model.lunban]++;

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("gang", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   * リンシャン牌ツモの局進行を行う。
   */
  gangzimo() {
    let model = this._model;

    this._diyizimo = false;
    this._yifa = [0, 0, 0, 0];

    let zimo = model.shan.gangzimo();
    model.shoupai[model.lunban].zimo(zimo);

    let paipu = { gangzimo: { l: model.lunban, p: zimo } };
    this.add_paipu(paipu);

    if (!this._rule["カンドラ後乗せ"] || this._gang.match(/^[mpsz]\d{4}$/))
      this.kaigang();

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
      if (l != model.lunban) msg[l].gangzimo.p = "";
    }
    this.call_players("gangzimo", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   * 開槓の局進行を行う。
   * @returns
   */
  kaigang() {
    this._gang = null;

    if (!this._rule["カンドラあり"]) return;

    let model = this._model;

    model.shan.kaigang();
    let baopai = model.shan.baopai.pop();

    let paipu = { kaigang: { baopai: baopai } };
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.notify_players("kaigang", msg);

    if (this._view) this._view.update(paipu);
  }

  /**
   *和了の局進行を行う。
   */
  hule() {
    let model = this._model;

    if (this._status != "hule") {
      model.shan.close();
      this._hule_option =
        this._status == "gang"
          ? "qianggang"
          : this._status == "gangzimo"
          ? "lingshang"
          : null;
    }

    let menfeng = this._hule.length ? this._hule.shift() : model.lunban;
    let rongpai =
      menfeng == model.lunban
        ? null
        : (this._hule_option == "qianggang"
            ? this._gang[0] + this._gang.substr(-1)
            : this._dapai.substr(0, 2)) +
          "_+=-"[(4 + model.lunban - menfeng) % 4];
    let shoupai = model.shoupai[menfeng].clone();
    let fubaopai = shoupai.lizhi ? model.shan.fubaopai : null;

    let param = {
      rule: this._rule,
      zhuangfeng: model.zhuangfeng,
      menfeng: menfeng,
      hupai: {
        lizhi: this._lizhi[menfeng],
        yifa: this._yifa[menfeng],
        qianggang: this._hule_option == "qianggang",
        lingshang: this._hule_option == "lingshang",
        haidi:
          model.shan.paishu > 0 || this._hule_option == "lingshang"
            ? 0
            : !rongpai
            ? 1
            : 2,
        tianhu: !(this._diyizimo && !rongpai) ? 0 : menfeng == 0 ? 1 : 2,
      },
      baopai: model.shan.baopai,
      fubaopai: fubaopai,
      jicun: { changbang: model.changbang, lizhibang: model.lizhibang },
    };
    let hule = Majiang.Util.hule(shoupai, rongpai, param);

    if (this._rule["連荘方式"] > 0 && menfeng == 0) this._lianzhuang = true;
    if (this._rule["場数"] == 0) this._lianzhuang = false;
    this._fenpei = hule.fenpei;

    let paipu = {
      hule: {
        l: menfeng,
        shoupai: rongpai
          ? shoupai.zimo(rongpai).toString()
          : shoupai.toString(),
        baojia: rongpai ? model.lunban : null,
        fubaopai: fubaopai,
        fu: hule.fu,
        fanshu: hule.fanshu,
        damanguan: hule.damanguan,
        defen: hule.defen,
        hupai: hule.hupai,
        fenpei: hule.fenpei,
      },
    };
    for (let key of ["fu", "fanshu", "damanguan"]) {
      if (!paipu.hule[key]) delete paipu.hule[key];
    }
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("hule", msg, this._wait);

    if (this._view) this._view.update(paipu);
  }

  /**
   * 流局の局進行を行う。 name が指定された場合は途中流局とする。 shoupai には流局時に公開した 牌姿 を指定する。
   * @param {string} name
   * @param {string[]} shoupai 牌姿の配列
   */
  pingju(name, shoupai = ["", "", "", ""]) {
    let model = this._model;

    let fenpei = [0, 0, 0, 0];

    if (!name) {
      let n_tingpai = 0;
      for (let l = 0; l < 4; l++) {
        if (
          this._rule["ノーテン宣言あり"] &&
          !shoupai[l] &&
          !model.shoupai[l].lizhi
        )
          continue;
        if (
          !this._rule["ノーテン罰あり"] &&
          (this._rule["連荘方式"] != 2 || l != 0) &&
          !model.shoupai[l].lizhi
        ) {
          shoupai[l] = "";
        } else if (
          Majiang.Util.xiangting(model.shoupai[l]) == 0 &&
          Majiang.Util.tingpai(model.shoupai[l]).length > 0
        ) {
          n_tingpai++;
          shoupai[l] = model.shoupai[l].toString();
          if (this._rule["連荘方式"] == 2 && l == 0) this._lianzhuang = true;
        } else {
          shoupai[l] = "";
        }
      }
      if (this._rule["流し満貫あり"]) {
        for (let l = 0; l < 4; l++) {
          let all_yaojiu = true;
          for (let p of model.he[l]._pai) {
            if (p.match(/[\+\=\-]$/)) {
              all_yaojiu = false;
              break;
            }
            if (p.match(/^z/)) continue;
            if (p.match(/^[mps][19]/)) continue;
            all_yaojiu = false;
            break;
          }
          if (all_yaojiu) {
            name = "流し満貫";
            for (let i = 0; i < 4; i++) {
              fenpei[i] +=
                l == 0 && i == l
                  ? 12000
                  : l == 0
                  ? -4000
                  : l != 0 && i == l
                  ? 8000
                  : l != 0 && i == 0
                  ? -4000
                  : -2000;
            }
          }
        }
      }
      if (!name) {
        name = "荒牌平局";
        if (this._rule["ノーテン罰あり"] && 0 < n_tingpai && n_tingpai < 4) {
          for (let l = 0; l < 4; l++) {
            fenpei[l] = shoupai[l] ? 3000 / n_tingpai : -3000 / (4 - n_tingpai);
          }
        }
      }
      if (this._rule["連荘方式"] == 3) this._lianzhuang = true;
    } else {
      this._no_game = true;
      this._lianzhuang = true;
    }

    if (this._rule["場数"] == 0) this._lianzhuang = true;

    this._fenpei = fenpei;

    let paipu = {
      pingju: { name: name, shoupai: shoupai, fenpei: fenpei },
    };
    this.add_paipu(paipu);

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("pingju", msg, this._wait);

    if (this._view) this._view.update(paipu);
  }

  /**
   *対局終了の判断を行う。
   */
  last() {
    let model = this._model;

    model.lunban = -1;
    if (this._view) this._view.update();

    if (!this._lianzhuang) {
      model.jushu++;
      model.zhuangfeng += (model.jushu / 4) | 0;
      model.jushu = model.jushu % 4;
    }

    let jieju = false;
    let guanjun = -1;
    const defen = model.defen;
    for (let i = 0; i < 4; i++) {
      let id = (model.qijia + i) % 4;
      if (defen[id] < 0 && this._rule["トビ終了あり"]) jieju = true;
      if (defen[id] >= 30000 && (guanjun < 0 || defen[id] > defen[guanjun]))
        guanjun = id;
    }

    let sum_jushu = model.zhuangfeng * 4 + model.jushu;

    if (15 < sum_jushu) jieju = true;
    else if ((this._rule["場数"] + 1) * 4 - 1 < sum_jushu) jieju = true;
    else if (this._max_jushu < sum_jushu) {
      if (this._rule["延長戦方式"] == 0) jieju = true;
      else if (this._rule["場数"] == 0) jieju = true;
      else if (guanjun >= 0) jieju = true;
      else {
        this._max_jushu +=
          this._rule["延長戦方式"] == 3
            ? 4
            : this._rule["延長戦方式"] == 2
            ? 1
            : 0;
      }
    } else if (this._max_jushu == sum_jushu) {
      if (
        this._rule["オーラス止めあり"] &&
        guanjun == model.player_id[0] &&
        this._lianzhuang &&
        !this._no_game
      )
        jieju = true;
    }

    if (jieju) this.delay(() => this.jieju(), 0);
    else this.delay(() => this.qipai(), 0);
  }

  /**
   *対局終了の処理を行う。
   */
  jieju() {
    let model = this._model;

    let paiming = [];
    const defen = model.defen;
    for (let i = 0; i < 4; i++) {
      let id = (model.qijia + i) % 4;
      for (let j = 0; j < 4; j++) {
        if (j == paiming.length || defen[id] > defen[paiming[j]]) {
          paiming.splice(j, 0, id);
          break;
        }
      }
    }
    defen[paiming[0]] += model.lizhibang * 1000;
    this._paipu.defen = defen;

    let rank = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      rank[paiming[i]] = i + 1;
    }
    this._paipu.rank = rank;

    const round = !this._rule["順位点"].find((p) => p.match(/\.\d$/));
    let point = [0, 0, 0, 0];
    for (let i = 1; i < 4; i++) {
      let id = paiming[i];
      point[id] = (defen[id] - 30000) / 1000 + +this._rule["順位点"][i];
      if (round) point[id] = Math.round(point[id]);
      point[paiming[0]] -= point[id];
    }
    this._paipu.point = point.map((p) => p.toFixed(round ? 0 : 1));

    let paipu = { jieju: this._paipu };

    let msg = [];
    for (let l = 0; l < 4; l++) {
      msg[l] = JSON.parse(JSON.stringify(paipu));
    }
    this.call_players("jieju", msg, this._wait);

    if (this._view) this._view.summary(this._paipu);
  }

  /**
   * 手番 l からの応答を取得する。
   * @param {number} l
   * @returns {Majiang.Message}
   */
  get_reply(l) {
    let model = this._model;
    return this._reply[model.player_id[l]];
  }

  /**
   * 配牌の局進行メソッドを呼び出す。
   */
  reply_kaiju() {
    this.delay(() => this.qipai(), 0);
  }

  /**
   * ツモの局進行メソッドを呼び出す。
   */
  reply_qipai() {
    this.delay(() => this.zimo(), 0);
  }

  /**
   * ツモ応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   * @returns
   */
  reply_zimo() {
    let model = this._model;

    let reply = this.get_reply(model.lunban);
    if (reply.daopai) {
      if (this.allow_pingju()) {
        let shoupai = ["", "", "", ""];
        shoupai[model.lunban] = model.shoupai[model.lunban].toString();
        return this.delay(() => this.pingju("九種九牌", shoupai), 0);
      }
    } else if (reply.hule) {
      if (this.allow_hule()) {
        if (this._view) this._view.say("zimo", model.lunban);
        return this.delay(() => this.hule());
      }
    } else if (reply.gang) {
      if (this.get_gang_mianzi().find((m) => m == reply.gang)) {
        if (this._view) this._view.say("gang", model.lunban);
        return this.delay(() => this.gang(reply.gang));
      }
    } else if (reply.dapai) {
      let dapai = reply.dapai.replace(/\*$/, "");
      if (this.get_dapai().find((p) => p == dapai)) {
        if (reply.dapai.substr(-1) == "*" && this.allow_lizhi(dapai)) {
          if (this._view) this._view.say("lizhi", model.lunban);
          return this.delay(() => this.dapai(reply.dapai));
        }
        return this.delay(() => this.dapai(dapai), 0);
      }
    }

    let p = this.get_dapai().pop();
    this.delay(() => this.dapai(p), 0);
  }

  /**
   * 打牌応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   * @returns
   */
  reply_dapai() {
    let model = this._model;

    for (let i = 1; i < 4; i++) {
      let l = (model.lunban + i) % 4;
      let reply = this.get_reply(l);
      if (reply.hule && this.allow_hule(l)) {
        if (this._rule["最大同時和了数"] == 1 && this._hule.length) continue;
        if (this._view) this._view.say("rong", l);
        this._hule.push(l);
      } else {
        let shoupai = model.shoupai[l].clone().zimo(this._dapai);
        if (Majiang.Util.xiangting(shoupai) == -1) this._neng_rong[l] = false;
      }
    }
    if (this._hule.length == 3 && this._rule["最大同時和了数"] == 2) {
      let shoupai = ["", "", "", ""];
      for (let l of this._hule) {
        shoupai[l] = model.shoupai[l].toString();
      }
      return this.delay(() => this.pingju("三家和", shoupai));
    } else if (this._hule.length) {
      return this.delay(() => this.hule());
    }

    if (this._dapai.substr(-1) == "*") {
      model.defen[model.player_id[model.lunban]] -= 1000;
      model.lizhibang++;

      if (
        this._lizhi.filter((x) => x).length == 4 &&
        this._rule["途中流局あり"]
      ) {
        let shoupai = model.shoupai.map((s) => s.toString());
        return this.delay(() => this.pingju("四家立直", shoupai));
      }
    }

    if (this._diyizimo && model.lunban == 3) {
      this._diyizimo = false;
      if (this._fengpai) {
        return this.delay(() => this.pingju("四風連打"), 0);
      }
    }

    if (this._n_gang.reduce((x, y) => x + y) == 4) {
      if (Math.max(...this._n_gang) < 4 && this._rule["途中流局あり"]) {
        return this.delay(() => this.pingju("四開槓"), 0);
      }
    }

    if (!model.shan.paishu) {
      let shoupai = ["", "", "", ""];
      for (let l = 0; l < 4; l++) {
        let reply = this.get_reply(l);
        if (reply.daopai) shoupai[l] = reply.daopai;
      }
      return this.delay(() => this.pingju("", shoupai), 0);
    }

    for (let i = 1; i < 4; i++) {
      let l = (model.lunban + i) % 4;
      let reply = this.get_reply(l);
      if (reply.fulou) {
        let m = reply.fulou.replace(/0/g, "5");
        if (m.match(/^[mpsz](\d)\1\1\1/)) {
          if (this.get_gang_mianzi(l).find((m) => m == reply.fulou)) {
            if (this._view) this._view.say("gang", l);
            return this.delay(() => this.fulou(reply.fulou));
          }
        } else if (m.match(/^[mpsz](\d)\1\1/)) {
          if (this.get_peng_mianzi(l).find((m) => m == reply.fulou)) {
            if (this._view) this._view.say("peng", l);
            return this.delay(() => this.fulou(reply.fulou));
          }
        }
      }
    }
    let l = (model.lunban + 1) % 4;
    let reply = this.get_reply(l);
    if (reply.fulou) {
      if (this.get_chi_mianzi(l).find((m) => m == reply.fulou)) {
        if (this._view) this._view.say("chi", l);
        return this.delay(() => this.fulou(reply.fulou));
      }
    }

    this.delay(() => this.zimo(), 0);
  }

  /**
   * 副露応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   * @returns
   */
  reply_fulou() {
    let model = this._model;

    if (this._gang) {
      return this.delay(() => this.gangzimo(), 0);
    }

    let reply = this.get_reply(model.lunban);
    if (reply.dapai) {
      if (this.get_dapai().find((p) => p == reply.dapai)) {
        return this.delay(() => this.dapai(reply.dapai), 0);
      }
    }

    let p = this.get_dapai().pop();
    this.delay(() => this.dapai(p), 0);
  }

  /**
   * 槓応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   * @returns
   */
  reply_gang() {
    let model = this._model;

    if (this._gang.match(/^[mpsz]\d{4}$/)) {
      return this.delay(() => this.gangzimo(), 0);
    }

    for (let i = 1; i < 4; i++) {
      let l = (model.lunban + i) % 4;
      let reply = this.get_reply(l);
      if (reply.hule && this.allow_hule(l)) {
        if (this._rule["最大同時和了数"] == 1 && this._hule.length) continue;
        if (this._view) this._view.say("rong", l);
        this._hule.push(l);
      } else {
        let p = this._gang[0] + this._gang.substr(-1);
        let shoupai = model.shoupai[l].clone().zimo(p);
        if (Majiang.Util.xiangting(shoupai) == -1) this._neng_rong[l] = false;
      }
    }
    if (this._hule.length) {
      return this.delay(() => this.hule());
    }

    this.delay(() => this.gangzimo(), 0);
  }

  /**
   * 和了応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   */
  reply_hule() {
    let model = this._model;

    for (let l = 0; l < 4; l++) {
      model.defen[model.player_id[l]] += this._fenpei[l];
    }
    model.changbang = 0;
    model.lizhibang = 0;

    if (this._hule.length) {
      return this.delay(() => this.hule());
    } else {
      if (this._lianzhuang) model.changbang = this._changbang + 1;
      return this.delay(() => this.last(), 0);
    }
  }

  /**
   * 流局応答の妥当性を確認し、次の局進行メソッドを呼び出す。
   */
  reply_pingju() {
    let model = this._model;

    for (let l = 0; l < 4; l++) {
      model.defen[model.player_id[l]] += this._fenpei[l];
    }
    model.changbang++;

    this.delay(() => this.last(), 0);
  }

  /**
   * Majiang.Game#static-get_dapai を呼び出し、インスタンス変数 _rule にしたがって現在の手番の手牌から打牌可能な牌の一覧を返す。
   * @returns {string[]} 牌の配列
   */
  get_dapai() {
    let model = this._model;
    return Game.get_dapai(this._rule, model.shoupai[model.lunban]);
  }

  /**
   * Majiang.Game#static-get_chi_mianzi を呼び出し、インスタンス変数 _rule にしたがって手番 l が現在の打牌でチー可能な面子の一覧を返す。
   * @param {number} l
   * @returns {string[]} 面子の配列
   */
  get_chi_mianzi(l) {
    let model = this._model;
    let d = "_+=-"[(4 + model.lunban - l) % 4];
    return Game.get_chi_mianzi(
      this._rule,
      model.shoupai[l],
      this._dapai + d,
      model.shan.paishu
    );
  }

  /**
   * Majiang.Game#static-get_peng_mianzi を呼び出し、インスタンス変数 _rule にしたがって手番 l が現在の打牌でポン可能な面子の一覧を返す。
   * @param {number} l
   * @returns {string[]} 面子の配列
   */
  get_peng_mianzi(l) {
    let model = this._model;
    let d = "_+=-"[(4 + model.lunban - l) % 4];
    return Game.get_peng_mianzi(
      this._rule,
      model.shoupai[l],
      this._dapai + d,
      model.shan.paishu
    );
  }

  /**
   * Majiang.Game#static-get_gang_mianzi を呼び出し、インスタンス変数 _rule にしたがってカン可能な面子の一覧を返す。l が指定された場合は大明槓、null の場合は暗槓と加槓が対象になる。
   * @param {number} l
   * @returns {string[]} 面子の配列
   */
  get_gang_mianzi(l) {
    let model = this._model;
    if (l == null) {
      return Game.get_gang_mianzi(
        this._rule,
        model.shoupai[model.lunban],
        null,
        model.shan.paishu,
        this._n_gang.reduce((x, y) => x + y)
      );
    } else {
      let d = "_+=-"[(4 + model.lunban - l) % 4];
      return Game.get_gang_mianzi(
        this._rule,
        model.shoupai[l],
        this._dapai + d,
        model.shan.paishu,
        this._n_gang.reduce((x, y) => x + y)
      );
    }
  }

  /**
   * Majiang.Game#static-allow_lizhi を呼び出し、インスタンス変数 _rule にしたがってリーチ可能か判定する。 p が null のときはリーチ可能な打牌一覧を返す。 p が 牌 のときは p を打牌してリーチ可能なら true を返す。
   * @param {string} p 牌
   * @returns {string[]|boolean} 牌の配列か真偽値
   */
  allow_lizhi(p) {
    let model = this._model;
    return Game.allow_lizhi(
      this._rule,
      model.shoupai[model.lunban],
      p,
      model.shan.paishu,
      model.defen[model.player_id[model.lunban]]
    );
  }

  /**
   * Majiang.Game#static-allow_hule を呼び出し、インスタンス変数 _rule にしたがって和了可能か判定する。 l が null のときは現在の手番がツモ和了可能なら true を返す。 l が指定された場合は手番 l がロン和了可能なら true を返す。
   * @param {number} l
   * @returns {boolean}
   */
  allow_hule(l) {
    let model = this._model;
    if (l == null) {
      let hupai =
        model.shoupai[model.lunban].lizhi ||
        this._status == "gangzimo" ||
        model.shan.paishu == 0;
      return Game.allow_hule(
        this._rule,
        model.shoupai[model.lunban],
        null,
        model.zhuangfeng,
        model.lunban,
        hupai
      );
    } else {
      let p =
        (this._status == "gang"
          ? this._gang[0] + this._gang.substr(-1)
          : this._dapai) + "_+=-"[(4 + model.lunban - l) % 4];
      let hupai =
        model.shoupai[l].lizhi ||
        this._status == "gang" ||
        model.shan.paishu == 0;
      return Game.allow_hule(
        this._rule,
        model.shoupai[l],
        p,
        model.zhuangfeng,
        l,
        hupai,
        this._neng_rong[l]
      );
    }
  }

  /**
   * Majiang.Game#static-allow_pingju を呼び出し、インスタンス変数 _rule にしたがって現在の手番が九種九牌流局可能か判定する。
   * @returns {boolean}
   */
  allow_pingju() {
    let model = this._model;
    return Game.allow_pingju(
      this._rule,
      model.shoupai[model.lunban],
      this._diyizimo
    );
  }

  /**
   *Majiang.Shoupai#get_dapai を呼び出し、rule にしたがって shoupai から打牌可能な牌の一覧を返す。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @returns {string[]}
   */
  static get_dapai(rule, shoupai) {
    if (rule["喰い替え許可レベル"] == 0) return shoupai.get_dapai(true);
    if (
      rule["喰い替え許可レベル"] == 1 &&
      shoupai._zimo &&
      shoupai._zimo.length > 2
    ) {
      let deny =
        shoupai._zimo[0] + (+shoupai._zimo.match(/\d(?=[\+\=\-])/) || 5);
      return shoupai
        .get_dapai(false)
        .filter((p) => p.replace(/0/, "5") != deny);
    }
    return shoupai.get_dapai(false);
  }

  /**
   * Majiang.Shoupai#get_chi_mianzi を呼び出し、rule にしたがって shoupai から p でチー可能な面子の一覧を返す。 paishu には現在の残り牌数を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p
   * @param {number} paishu
   * @returns {string[]}
   */
  static get_chi_mianzi(rule, shoupai, p, paishu) {
    let mianzi = shoupai.get_chi_mianzi(p, rule["喰い替え許可レベル"] == 0);
    if (!mianzi) return mianzi;
    if (
      rule["喰い替え許可レベル"] == 1 &&
      shoupai._fulou.length == 3 &&
      shoupai._bingpai[p[0]][p[1]] == 2
    )
      mianzi = [];
    return paishu == 0 ? [] : mianzi;
  }

  /**
   * Majiang.Shoupai#get_peng_mianzi を呼び出し、rule にしたがって shoupai から p でポン可能な面子の一覧を返す。 paishu には現在の残り牌数を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p
   * @param {number} paishu
   * @returns {string[]}
   */
  static get_peng_mianzi(rule, shoupai, p, paishu) {
    let mianzi = shoupai.get_peng_mianzi(p);
    if (!mianzi) return mianzi;
    return paishu == 0 ? [] : mianzi;
  }

  /**
   * Majiang.Shoupai#get_gang_mianzi を呼び出し、rule にしたがって shoupai からカン可能な面子の一覧を返す。 p が指定された場合は大明槓、null の場合は暗槓と加槓が対象になる。 paishu には現在の残り牌数、n_gang にはその局に行われた槓の数を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p
   * @param {number} paishu
   * @param {number} n_gang
   * @returns {string[]}
   */
  static get_gang_mianzi(rule, shoupai, p, paishu, n_gang) {
    let mianzi = shoupai.get_gang_mianzi(p);
    if (!mianzi || mianzi.length == 0) return mianzi;

    if (shoupai.lizhi) {
      if (rule["リーチ後暗槓許可レベル"] == 0) return [];
      else if (rule["リーチ後暗槓許可レベル"] == 1) {
        let new_shoupai,
          n_hule1 = 0,
          n_hule2 = 0;
        new_shoupai = shoupai.clone().dapai(shoupai._zimo);
        for (let p of Majiang.Util.tingpai(new_shoupai)) {
          n_hule1 += Majiang.Util.hule_mianzi(new_shoupai, p).length;
        }
        new_shoupai = shoupai.clone().gang(mianzi[0]);
        for (let p of Majiang.Util.tingpai(new_shoupai)) {
          n_hule2 += Majiang.Util.hule_mianzi(new_shoupai, p).length;
        }
        if (n_hule1 > n_hule2) return [];
      } else {
        let new_shoupai;
        new_shoupai = shoupai.clone().dapai(shoupai._zimo);
        let n_tingpai1 = Majiang.Util.tingpai(new_shoupai).length;
        new_shoupai = shoupai.clone().gang(mianzi[0]);
        let n_tingpai2 = Majiang.Util.tingpai(new_shoupai).length;
        if (n_tingpai1 != n_tingpai2) return [];
      }
    }
    return paishu == 0 || n_gang == 4 ? [] : mianzi;
  }

  /**
   * rule にしたがって shoupai からリーチ可能か判定する。 p が null のときはリーチ可能な打牌一覧を返す。 p が 牌 のときは p を打牌してリーチ可能なら true を返す。 paishu には現在の残り牌数、defen には現在の持ち点を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p
   * @param {number} paishu
   * @param {number} defen
   * @returns {string[]|boolean}
   */
  static allow_lizhi(rule, shoupai, p, paishu, defen) {
    if (!shoupai._zimo) return false;
    if (shoupai.lizhi) return false;
    if (!shoupai.menqian) return false;

    if (!rule["ツモ番なしリーチあり"] && paishu < 4) return false;
    if (rule["トビ終了あり"] && defen < 1000) return false;

    if (Majiang.Util.xiangting(shoupai) > 0) return false;

    if (p) {
      let new_shoupai = shoupai.clone().dapai(p);
      return (
        Majiang.Util.xiangting(new_shoupai) == 0 &&
        Majiang.Util.tingpai(new_shoupai).length > 0
      );
    } else {
      let dapai = [];
      for (let p of Game.get_dapai(rule, shoupai)) {
        let new_shoupai = shoupai.clone().dapai(p);
        if (
          Majiang.Util.xiangting(new_shoupai) == 0 &&
          Majiang.Util.tingpai(new_shoupai).length > 0
        ) {
          dapai.push(p);
        }
      }
      return dapai.length ? dapai : false;
    }
  }

  /**
   * rule にしたがって shoupai で和了可能か判定する。 p が null のときはツモ和了可能なら true を返す。 p が 牌 のときは p でロン和了可能なら true を返す。 zhuangfeng には場風(0: 東、1: 南、2: 西、3: 北)、menfeng には自風、状況役があるときは hupai に true、フリテンのときは neng_rong に false を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {string} p
   * @param {number} zhuangfeng
   * @param {number} menfeng
   * @param {boolean} hupai
   * @param {boolean} neng_rong
   * @returns {boolean}
   */
  static allow_hule(rule, shoupai, p, zhuangfeng, menfeng, hupai, neng_rong) {
    if (p && !neng_rong) return false;

    let new_shoupai = shoupai.clone();
    if (p) new_shoupai.zimo(p);
    if (Majiang.Util.xiangting(new_shoupai) != -1) return false;

    if (hupai) return true;

    let param = {
      rule: rule,
      zhuangfeng: zhuangfeng,
      menfeng: menfeng,
      hupai: {},
      baopai: [],
      jicun: { changbang: 0, lizhibang: 0 },
    };
    let hule = Majiang.Util.hule(shoupai, p, param);

    return hule.hupai != null;
  }

  /**
   * rule にしたがって shoupai で九種九牌流局可能か判定する。 第一ツモ順の場合は diyizimo に true を指定すること。
   * @param {Majiang.Rule} rule
   * @param {Majiang.Shoupai} shoupai
   * @param {boolean} diyizimo
   * @returns {boolean}
   */
  static allow_pingju(rule, shoupai, diyizimo) {
    if (!diyizimo) return false;
    if (!rule["途中流局あり"]) return false;

    let n_yaojiu = 0;
    for (let s of ["m", "p", "s", "z"]) {
      let bingpai = shoupai._bingpai[s];
      let nn = s == "z" ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
      for (let n of nn) {
        if (bingpai[n] > 0) n_yaojiu++;
      }
    }
    return n_yaojiu >= 9;
  }
};
