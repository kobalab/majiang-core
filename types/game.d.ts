declare namespace Majiang {
  /** 対局終了時に呼ばれた関数 */
  type JiejuCallback = (paipu: Paipu) => void;

  /**
   * 局進行を実現するクラス
   *
   * @remarks
   * インスタンス生成後、{@link Game.kaiju} の呼び出しで対局を開始する。
   * その後は対局者からの応答により非同期に {@link Game.next} が呼ばれることで局が進行する。
   * 対局終了時にはインスタンス生成時に指定したコールバック関数を呼んで処理が終了する。
   *
   * クラスメソッドで進行の妥当性を判断するための関数を提供する。
   * これらのメソッドは {@link Game} 自身が使用するだけでなく、{@link Player} が使用することも想定している。
   */
  class Game {
    /**
     * 指定されたパラメータから対局を生成する。
     * @param players 指定された4名{@link Player | 対局者}の配列
     * @param callback 対局終了時に呼ばれた関数(対局の{@link Paipu | 牌譜}が引数で渡される)。
     * @param rule 指定された{@link Rule | ルール}。省略した場合は、`Majiang.rule()` の呼び出しで得られるルールの初期値が採用される。
     * @param title 牌譜に残すタイトル
     */
    constructor(players: Player[], callback?: JiejuCallback | null, rule?: Rule, title?: string);

    /**
     * {@link Shoupai.get_dapai} を呼び出し、 **`rule`** にしたがって **`shoupai`** から打牌可能な牌の一覧を返す。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @returns 打牌可能な{@link Pai | 牌}の配列
     */
    static get_dapai(rule: Rule, shoupai: Shoupai): Pai[] | null;

    /**
     * {@link Shoupai.get_chi_mianzi} を呼び出し、 **`rule`** にしたがって **`shoupai`** から **`p`** でチー可能な面子の一覧を返す。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param p {@link Pai | 牌}
     * @param paishu 現在の残り牌数
     * @returns チー可能な{@link Menzi | 面子}の配列
     */
    static get_chi_mianzi(rule: Rule, shoupai: Shoupai, p: Pai, paishu: number): Menzi[];

    /**
     * {@link Shoupai.get_peng_mianzi} を呼び出し、 **`rule`** にしたがって **`shoupai`** から **`p`** でポン可能な面子の一覧を返す。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param p {@link Pai | 牌}
     * @param paishu 現在の残り牌数
     * @returns ポン可能な{@link Menzi | 面子}の配列
     */
    static get_peng_mianzi(rule: Rule, shoupai: Shoupai, p: Pai, paishu: number): Menzi[];

    /**
     * {@link Shoupai.get_gang_mianzi} を呼び出し、 **`rule`** にしたがって **`shoupai`** から **`p`** でカン可能な面子の一覧を返す。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param p {@link Pai | 牌}。指定された場合は大明槓、`null` の場合は暗槓と加槓が対象になる。
     * @param paishu 現在の残り牌数
     * @param n_gang その局に行われた槓の数
     * @returns カン可能な{@link Menzi | 面子}の配列
     */
    static get_gang_mianzi(
      rule: Rule,
      shoupai: Shoupai,
      p: Pai | null | undefined,
      paishu: number,
      n_gang?: number,
    ): Menzi[];

    /**
     * **`rule`** にしたがって **`shoupai`** からリーチ可能か判定する。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param p `null` のときはリーチ可能な打牌一覧を返す。{@link Pai | 牌}のときは **`p`** を打牌してリーチ可能なら `true` を返す。
     * @param paishu 現在の残り牌数
     * @param defen 現在の持ち点
     * @returns **`p`** が `null` のときはリーチ可能な打牌の配列。 **`p`** が {@link Pai | 牌} のときは **`p`** を打牌してリーチ可能なら `true` を返す
     */
    static allow_lizhi(
      rule: Rule,
      shoupai: Shoupai,
      p: Pai | null | undefined,
      paishu: number,
      defen: number,
    ): Pai[] | boolean;

    /**
     * **`rule`** にしたがって **`shoupai`** で和了可能か判定する。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param p `null` のときはツモ和了可能なら `true` を返す。{@link Pai | 牌}のときは **`p`** でロン和了可能なら `true` を返す。
     * @param zhuangfeng 場風(`0`: 東、`1`: 南、`2`: 西、`3`: 北)
     * @param menfeng 自風
     * @param hupai 状況役があるときは `true` を指定する
     * @param neng_rong フリテンのときは `false` を指定する
     * @returns ロン和了可能なら `true` を返す。
     */
    static allow_hule(
      rule: Rule,
      shoupai: Shoupai,
      p: Pai | null | undefined,
      zhuangfeng: number,
      menfeng: number,
      hupai: boolean,
      neng_rong: boolean,
    ): boolean;

    /**
     * **`rule`** にしたがって **`shoupai`** で九種九牌流局可能か判定する。
     * @param rule {@link Rule | ルール}
     * @param shoupai {@link Shoupai | 手牌}
     * @param diyizimo 第一ツモ順の場合は `true` を指定する
     */
    static allow_pingju(rule: Rule, shoupai: Shoupai, diyizimo: boolean): boolean;

    /**
     * インスタンス生成時に指定された {@link Player | 対局者} の配列。
     */
    _players: Player[];

    /**
     * インスタンス生成時に指定された対局終了時に呼び出す関数。
     * @see {@link Paipu | 牌譜}
     */
    _callback: JiejuCallback;

    /**
     * インスタンス生成時に指定された{@link Rule | ルール}
     */
    _rule: Rule;

    /**
     * {@link BoardInfo | 卓情報}
     */
    _model: BoardInfo;

    /**
     * {@link BoardInfo | 卓情報}を描画するクラス。
     * @remarks
     * {@link Game} からは適切なタイミングでメソッドを呼び出して描画のきっかけを与える。
     */
    _view: View;

    /**
     * {@link Paipu | 牌譜}
     */
    _paipu: Paipu;

    /**
     * {@link Game.call_players} を呼び出した際の **`type`** を保存する。
     */
    _status: string;

    /**
     * 対局者からの応答を格納する配列。
     * {@link Game.call_players} 呼び出し時に配列を生成する。
     */
    _reply: PlayerMessage[];

    /**
     * 最終局(オーラス)の局数。
     * 東風戦の場合、初期値は `3`。東南戦なら `7`。
     * 延長戦により最終局が移動する場合はこの値を変更する。
     */
    _max_jushu: number;

    /**
     * 第一ツモ巡の間は `true`。
     */
    _diyizimo: boolean;

    /**
     * 四風連打の可能性がある間は `true`。
     */
    _fengpai: boolean;

    /**
     * 最後に打牌した{@link Pai | 牌}。次の打牌で上書きする。
     */
    _dapai: Pai | null;

    /**
     * 現在処理中のカンの{@link Menzi | 面子}。
     * 開槓すると `null` に戻す。
     */
    _gang: Menzi | null;

    /**
     * 各対局者(その局の東家からの順)のリーチ状態を示す配列。
     * `0`: リーチなし、`1`: 通常のリーチ、`2`: ダブルリーチ。
     */
    _lizhi: number[];

    /**
     * 各対局者が一発可能かを示す配列。
     * 添え字は手番(`0`: 東、`1`: 南、`2`: 西、`3`: 北)。
     */
    _yifa: boolean[];

    /**
     * 各対局者が行ったカンの数。
     * 添え字は手番(`0`: 東、`1`: 南、`2`: 西、`3`: 北)。
     */
    _n_gang: number[];

    /**
     * 各対局者のフリテン状態。
     * 添え字は手番(`0`: 東、`1`: 南、`2`: 西、`3`: 北)。
     * ロン和了可能なら `true`。
     */
    _neng_rong: boolean[];

    /**
     * 和了応答した対局者の手番(`0`: 東、`1`: 南、`2`: 西、`3`: 北)の配列。
     * 南家、西家のダブロンの時は `[ 1, 2 ]` となる。
     */
    _hule: number[];

    /**
     * 処理中の和了が槍槓のとき `"qiangang"`、嶺上開花のとき `"lingshang"`、それ以外なら `null`。
     */
    _hule_option: string | null;

    /**
     * 途中流局の処理中のとき `true`。
     */
    _no_game: boolean;

    /**
     * 連荘の処理中のとき `true`。
     */
    _lianzhuang: boolean;

    /**
     * 現在処理中の和了、あるいは流局で移動する点数の配列。
     * 添え字は手番(`0`: 東、`1`: 南、`2`: 西、`3`: 北)。
     */
    _fenpei: number[];

    /**
     * `true` の場合、同期モードとなり、`setTimeout()` による非同期呼び出しは行わない。
     */
    _sync: boolean;

    /**
     * 関数が設定されている場合、{@link Game.next} 呼び出しの際にその関数を呼び出して処理を停止する。
     */
    _stop: (() => void) | null;

    /**
     * 局の進行速度。0～5 で指定する。初期値は 3。
     * 指定された速度 × 200(ms) で {@link Game.next} を呼び出すことで局の進行速度を調整する。
     * @defaultValue `3`
     */
    _speed: number;

    /**
     * ダイアログへの応答速度(ms)。初期値は 0。
     * 指定された時間後に {@link Game.next} を呼び出す。
     * @defaultValue `0`
     */
    _wait: number;

    /**
     * 非同期で {@link Game.next} を呼び出すタイマーのID。
     * 値が設定されていれば非同期呼出し待ちであり、`clearTimeout()` を呼び出せば非同期呼出しをキャンセルできる。
     */
    _timeout_id?: number;

    /**
     * 非同期モードで対局を開始する。
     * @param qijia 起家を指定すること(`0`〜`3`)。指定しない場合はランダムに起家を決定する。
     */
    kaiju(qijia?: number): void;

    /**
     * 対局者が応答の際に呼び出す。
     * @param id  対局者の席順(`0`〜`3`)
     * @param reply {@link PlayerMessage | メッセージ}。応答内容。
     */
    reply(id: number, reply: PlayerMessage): void;

    /**
     * 非同期モードの対局を停止する。
     * @param callback 停止の際に呼び出す関数。
     */
    stop(callback?: () => void): void;

    /**
     * 非同期モードの対局を再開する。
     */
    start(): void;

    /**
     * デバッグ用。同期モードで対局を開始する。
     * 対局終了まで一切の非同期呼び出しは行わず、無停止で対局を完了する。
     */
    do_sync(): void;

    /**
     * インスタンス変数 **`_model`** を返す。
     */
    get model(): BoardInfo;

    /**
     * インスタンス変数 **`_view`** に **`view`** を設定する。
     */
    set view(view: View);

    /**
     * インスタンス変数 **`_speed`** を返す。
     */
    get speed(): number;

    /**
     * インスタンス変数 **`_speed`** に **`speed`** を設定する。
     */
    set speed(speed: number);

    /**
     * インスタンス変数 **`_wait`** に **`wait`** を設定する。
     */
    set wait(wait: number);

    /**
     * 対局者からの応答を読み出し、対局の次のステップに進む。
     * @internal
     */
    next(): void;

    /**
     * 対局者に **`msg`** を通知する。対局者からの応答はない。
     * @param type {@link GameMessage | メッセージ} の種別を示す。
     * @param msg {@link GameMessage | メッセージ}
     * @internal
     */
    notify_players(type: string, msg: GameMessage[]): void;

    /**
     * 対局者に **`msg`** を通知する。
     * 対局者からの応答を待って、{@link Game.next} が非同期に呼び出される。
     * @param type {@link GameMessage | メッセージ} の種別を示す。
     * @param msg {@link GameMessage | メッセージ}
     * @param timeout
     * **`timeout`** で {@link Game.next} 呼び出しまでの待ち時間(ms)を指定し、局の進行速度を調整することもできる。
     * **`timeout`** の指定がない場合は、インスタンス変数 **`_speed`** に応じて待ち時間を決定する。
     * @internal
     */
    call_players(type: string, msg: GameMessage[], timeout?: number): void;

    /**
     * 配牌の局進行を行う。
     * @param shan {@link Shan}。指定されていないの場合ランダムに生成する。
     * @internal
     */
    qipai(shan?: Shan): void;

    /**
     * ツモの局進行を行う。
     * @internal
     */
    zimo(): void;

    /**
     * **`dapai`** で指定された牌を打牌する局進行を行う。
     * @param dapai {@link Pai | 牌}
     * @internal
     */
    dapai(dapai: Pai): void;

    /**
     * **`fulou`** で指定された面子を副露する局進行を行う。
     * @param fulou {@link Menzi | 面子}
     * @internal
     */
    fulou(fulou: Menzi): void;

    /**
     * **`gang`** で指定された面子で加槓あるいは暗槓する局進行を行う。
     * @param gang {@link Menzi | 面子}
     * @internal
     */
    gang(gang: Menzi): void;

    /**
     * リンシャン牌ツモの局進行を行う。
     * @internal
     */
    gangzimo(): void;

    /**
     * 開槓の局進行を行う。
     * @internal
     */
    kaigang(): void;

    /**
     * 和了の局進行を行う。
     * @internal
     */
    hule(): void;

    /**
     * 流局の局進行を行う。
     * @param name 指定された場合は途中流局とする。
     * @param shoupai 流局時に公開した {@link Paizi | 牌姿} を指定する。指定されていないの場合は全員ノーテンの扱る。
     * @internal
     */
    pingju(name: string, shoupai?: Paizi[]): void;

    /**
     * 対局終了の判断を行う。
     * @internal
     */
    last(): void;

    /**
     * 対局終了の処理を行う。
     * @internal
     */
    jieju(): void;

    /**
     * 配牌の局進行メソッドを呼び出す。
     * @internal
     */
    reply_kaiju(): void;

    /**
     * ツモの局進行メソッドを呼び出す。
     * @internal
     */
    reply_qipai(): void;

    /**
     * ツモ応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_zimo(): void;

    /**
     * 打牌応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_dapai(): void;

    /**
     * 副露応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_fulou(): void;

    /**
     * 槓応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_gang(): void;

    /**
     * 和了応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_hule(): void;

    /**
     * 流局応答の妥当性を確認し、次の局進行メソッドを呼び出す。
     * @internal
     */
    reply_pingju(): void;

    /**
     * {@link Game.get_dapai} を呼び出し、インスタンス変数 **`_rule`** にしたがって現在の手番の手牌から打牌可能な牌の一覧を返す。
     * @returns 打牌可能な{@link Pai | 牌}の配列
     * @internal
     */
    get_dapai(): Pai[];

    /**
     * {@link Game.get_chi_mianzi} を呼び出し、インスタンス変数 **`_rule`** にしたがって手番 **`l`** が現在の打牌でチー可能な面子の一覧を返す。
     * @param l 手番
     * @returns チー可能な{@link Menzi | 面子}の配列
     * @internal
     */
    get_chi_mianzi(l: number): Menzi[];

    /**
     * {@link Game.get_peng_mianzi} を呼び出し、インスタンス変数 **`_rule`** にしたがって手番 **`l`** が現在の打牌でポン可能な面子の一覧を返す。
     * @param l 手番
     * @returns ポン可能な{@link Menzi | 面子}の配列
     * @internal
     */
    get_peng_mianzi(l: number): Menzi[];

    /**
     * {@link Game.get_gang_mianzi} を呼び出し、インスタンス変数 **`_rule`** にしたがってカン可能な面子の一覧を返す。
     * @param l 指定された場合は大明槓、`null` の場合は暗槓と加槓が対象になる。
     * @returns カン可能な{@link Menzi | 面子}の配列
     * @internal
     */
    get_gang_mianzi(l?: number | null): Menzi[];

    /**
     * {@link Game.allow_lizhi} を呼び出し、インスタンス変数 **`_rule`** にしたがってリーチ可能か判定する。
     * @param p `null` のときはリーチ可能な打牌一覧を返す。{@link Pai | 牌}のときは **`p`** を打牌してリーチ可能なら `true` を返す。
     * @returns **`p`** が `null` のときはリーチ可能な打牌の配列。 **`p`** が {@link Pai | 牌} のときは **`p`** を打牌してリーチ可能なら `true` を返す
     * @internal
     */
    allow_lizhi(p?: Pai | null): Pai[] | boolean;

    /**
     * {@link Game.allow_hule} を呼び出し、インスタンス変数 **`_rule`** にしたがって和了可能か判定する。
     * @param l
     * **`l`** が `null` のときは現在の手番がツモ和了可能なら `true` を返す。
     * **`l`** が指定された場合は手番 **`l`** がロン和了可能なら `true` を返す。
     * @returns ロン和了可能なら `true` を返す。
     * @internal
     */
    allow_hule(l?: number | null): boolean;

    /**
     * {@link Game.allow_pingju} を呼び出し、インスタンス変数 **`_rule`** にしたがって現在の手番が九種九牌流局可能か判定する。
     * @returns 九種九牌流局可能なら `true` を返す。
     * @internal
     */
    allow_pingju(): boolean;

    /**
     * **`timeout`** で指定した時間(ms)休止した後に **`callback`** を呼び出す。
     * ゲームに「タメ」を作るためにチー/ポンなどの発声のタイミングで呼び出される。
     * **`timeout`** の指定がない場合は、インスタンス変数 **`_speed`** に応じて待ち時間を決定するが、最低でも 500ms は待ち合わせる。
     * @param callback 待ち時間の後で呼び出す関数
     * @param timeout 待ち時間
     * @internal
     */
    delay(callback: () => void, timeout?: number): void;

    /**
     * インスタンス変数 **`_paipu`** の適切な位置に摸打情報を追加する。
     * @param paipu 追加の{@link Paipu | 牌譜}の摸打情報
     * @internal
     */
    add_paipu(paipu: Paipu);

    /**
     * 手番 **`l`** からの応答を取得する。
     * @param l 手番
     * @returns 応答{@link PlayerMessage | メッセージ}
     * @internal
     */
    get_reply(l: number): PlayerMessage;
  }
}
