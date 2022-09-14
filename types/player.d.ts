declare namespace Majiang {
  /**
   * 対応呼び出し関数
   */
  type ReplyCallback = (reply?: PlayerMessage) => void;

  /**
   * 対局者を実現する基底クラス
   * 唯一のメソッド {@link Player.action} の非同期呼び出しで受信した {@link GameMessage} に対して行動を決定し、 {@link PlayerMessage} を応答する。
   * 本クラスは抽象クラスであり、{@link Player.action} から各メッセージに対応するメソッドを呼び出すが、そのメソッドは [[卓情報]] を更新するのみの実装である。卓情報から具体的な行動を決定し、応答を返す処理はサブクラスで実装する必要がある。
   */
  class Player {
    /**
     * **`_model`** に空の卓情報をもつインスタンスを生成する。
     */
    constructor();

    /**
     * **`msg`** に対応するメソッドを呼び出す。
     * @param msg {@link GameMessage}
     * @param callback 呼び出し関数
     */
    action(msg: GameMessage, callback: ReplyCallback): void;

    /**
     * {@link KaijuGameMessage} で通知された自身の席順(`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)。
     */
    _id: number;

    /**
     * {@link Player.action} 呼び出し時に指定された応答送信用関数。
     */
    _callback: ReplyCallback;

    /**
     * {@link KaijuGameMessage} で通知された対局の{@link Rule | ルール}
     */
    _rule: Rule;

    /**
     * {@link Board} で設定する{@link BoardInfo | 卓情報}。
     */
    _model: BoardInfo;

    /**
     * 現在の局の自風。(`0`: 東、`1`: 南、`2`: 西、`3`: 北)
     */
    _menfeng: number;

    /**
     * 第一ツモ巡の間は `true`。
     */
    _diyizimo: boolean;

    /**
     * 現在の局で全ての対局者が行ったカンの総数。
     */
    _n_gang: number;

    /**
     * 自身のフリテン状態。ロン和了可能なら `true`。
     */
    _neng_rong: boolean;

    /**
     * {@link JiejuGameMessage}で伝えられた対戦結果の{@link Paipu | 牌譜}
     */
    _paipu: Paipu;

    /**
     * **`kaiju`** から{@link BoardInfo | 卓情報}を初期化し、{@link Player.action_kaiju}を呼び出し応答を返す。
     * @param kaiju {@link KaijuGameMessage}
     * @internal
     */
    kaiju(kaiju: KaijuGameMessage['kaiju']): void;

    /**
     * **`qipai`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_qipai}を呼び出し応答を返す。
     * @param qipai {@link QipaiGameMessage}
     * @internal
     */
    qipai(qipai: QipaiGameMessage['qipai']): void;

    /**
     * **`zimo`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_zimo}を呼び出し応答を返す。
     * @param zimo {@link ZimoGameMessage} (もしくは {@link GangzimoGameMessage})
     * @param gangzimo 真の場合は槓自摸を表す。
     * @internal
     */
    zimo(zimo: ZimoGameMessage['zimo'], gangzimo?: boolean): void;

    /**
     * **`dapai`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_dapai}を呼び出し応答を返す。
     * @param dapai {@link DapaiGameMessage}
     * @internal
     */
    dapai(dapai: DapaiGameMessage['dapai']): void;

    /**
     * **`fulou`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_fulou}を呼び出し応答を返す。
     * @param fulou {@link FulouGameMessage}
     * @internal
     */
    fulou(fulou: FulouGameMessage['fulou']): void;

    /**
     * **`gang`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_gang}を呼び出し応答を返す。
     * @param gang {@link GangGameMessage}
     * @internal
     */
    gang(gang: GangGameMessage['gang']): void;

    /**
     * **`kaigang`** から{@link BoardInfo | 卓情報}を設定する。
     * @param kaigang {@link KaigangGameMessage}
     * @internal
     */
    kaigang(kaigang: KaigangGameMessage['kaigang']): void;

    /**
     * **`hule`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_hule}を呼び出し応答を返す。
     * @param hule {@link HuleGameMessage}
     * @internal
     */
    hule(hule: HuleGameMessage['hule']): void;

    /**
     * **`pingju`** から{@link BoardInfo | 卓情報}を設定し、{@link Player.action_pingju}を呼び出し応答を返す。
     * @param pingju {@link PingjuGameMessage}
     * @internal
     */
    pingju(pingju: PingjuGameMessage['pingju']): void;

    /**
     * {@link Player.action_jieju}を呼び出し応答を返す。
     * @param jieju {@link Paipu | 牌譜}
     * @internal
     */
    jieju(paipu: Paipu): void;

    /**
     * 自身の手牌を返す。
     * @returns 自身の{@link Shoupai | 手牌}
     * @internal
     */
    get shoupai(): string;

    /**
     * 自身の捨て牌を返す。
     * @returns 自身の{@link He | 捨て牌}
     * @internal
     */
    get he(): He;

    /**
     * 牌山を返す。
     * @returns 互換のオブジェクト{@link Shan | 牌山}
     * @internal
     */
    get shan(): Shan;

    /**
     * 自身の手牌がテンパイしている場合、和了牌の一覧を返す。
     * @returns 和了{@link Pai | 牌}の配列。テンパイしていない場合は空の配列を返す。
     */
    get hulepai(): Pai[];

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.get_dapai} を呼び出し、
     * **`shoupai`** が打牌可能な牌の一覧を返す。
     * @param shoupai {@link Shoupai}
     * @returns 打牌可能な{@link Pai | 牌}の配列。
     */
    get_dapai(shoupai: Shoupai): Pai[];

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.get_chi_mianzi} を呼び出し、
     * **`shoupai`** が **`p`** でチー可能な面子の一覧を返す。
     * @param shoupai {@link Shoupai}
     * @param p {@link Pai | 牌}
     * @returns チー可能な{@link Menzi | 面子}の配列。
     */
    get_chi_mianzi(shoupai: Shoupai, p: Pai): Menzi[];

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.get_peng_mianzi} を呼び出し、
     * **`shoupai`** が **`p`** でポン可能な面子の一覧を返す。
     * @param shoupai {@link Shoupai}
     * @param p {@link Pai | 牌}
     * @returns ポン可能な{@link Menzi | 面子}の配列。
     */
    get_peng_mianzi(shoupai: Shoupai, p: Pai): Menzi[];

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.get_gang_mianzi} を呼び出し、
     * **`shoupai`** がカン可能な面子の一覧を返す。
     * @param shoupai {@link Shoupai}
     * @param p {@link Pai | 牌}。指定された場合は大明槓、`null` の場合は暗槓と加槓が対象になる。
     * @returns カン可能な{@link Menzi | 面子}の配列。
     */
    get_gang_mianzi(shoupai: Shoupai, p?: Pai | null): Menzi[];

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.allow_lizhi} を呼び出し、
     * **`shoupai`** からリーチ可能か判定する。
     * @param shoupai {@link Shoupai}
     * @param p
     * * **`p`** が `null` のときはリーチ可能な打牌一覧を返す。
     * * **`p`** が{@link Pai | 牌}のときは **`p`** を打牌してリーチ可能なら `true` を返す。
     * @returns リーチ可能なら `true` を返す。
     */
    allow_lizhi(shoupai: Shoupai, p?: Pai | null): Pai[] | boolean;

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.allow_hule} を呼び出し、
     * **`shoupai`** から和了可能か判定する。
     * @param shoupai {@link Shoupai}
     * @param p
     * * **`p`** が `null` のときはツモ和了可能なら `true` を返す。
     * * **`p`** が{@link Pai | 牌}のときは **`p`** でロン和了可能なら `true` を返す。
     * @param hupai 状況役があるときは `true` を指定する
     * @returns 和了可能なら `true` を返す。
     */
    allow_hule(shoupai: Shoupai, p?: Pai | null, hupai?: boolean): boolean;

    /**
     * {@link Rule | ルール} と {@link BoardInfo | 卓情報} を使用して {@link Game.allow_pingju} を呼び出し、
     * **`shoupai`** で九種九牌流局可能か判定する。
     * @param shoupai {@link Shoupai}
     * @returns 九種九牌流局可能なら `true` を返す。
     */
    allow_pingju(shoupai: Shoupai): boolean;

    /**
     * **`kaiju`** を確認し空応答する処理を実装する。
     * @param kaiju {@link KaijuGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_kaiju(kaiju: KaijuGameMessage['kaiju']): void;

    /**
     * **`qipai`** を確認し空応答する処理を実装する。
     * @param qipai {@link Qipai} (または {@link QipaiGameMessage})
     * @vitural サブクラスで実装する必要がある。
     */
    action_qipai(qipai: QipaiGameMessage['qipai']): void;

    /**
     * **`zimo`** から適切な応答(打牌・槓・和了・倒牌)を選択し返す処理を実装する。
     * @param zimo {@link ZimoGameMessage} (または {@link GangzimoGameMessage})
     * @param gangzimo 真の場合は槓自摸を表す。
     * @vitural サブクラスで実装する必要がある。
     */
    action_zimo(zimo: ZimoGameMessage['zimo'] | GangzimoGameMessage['gangzimo'], gangzimo?: boolean): void;

    /**
     * **`dapai`** から適切な応答(副露・和了・倒牌)を選択し返す処理を実装する。
     * @param dapai {@link DapaiGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_dapai(dapai: DapaiGameMessage['dapai']): void;

    /**
     * **`fulou`** から適切な応答(打牌)を選択し返す処理を実装する。
     * @param fulou {@link FulouGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_fulou(fulou: FulouGameMessage['fulou']): void;

    /**
     * **`gang`** から適切な応答(打牌・槓・和了)を選択し返す処理を実装する。
     * @param gang {@link GangGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_gang(gang: GangGameMessage['gang']): void;

    /**
     * **`hule`** を確認し空応答する処理を実装する。
     * @param hule {@link HuleGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_hule(hule: HuleGameMessage['hule']): void;

    /**
     * **`pingju`** を確認し空応答する処理を実装する。
     * @param pingju {@link PingjuGameMessage}
     * @vitural サブクラスで実装する必要がある。
     */
    action_pingju(pingju: PingjuGameMessage['pingju']): void;

    /**
     * **`paipu`** を確認し空応答する処理を実装する。
     * @param paipu {@link Paipu | 牌譜}
     * @vitural サブクラスで実装する必要がある。
     */
    action_jieju(paipu: Paipu): void;
  }
}
