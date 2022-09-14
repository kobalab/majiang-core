declare namespace Majiang {
  /**
   * 牌山を表現するクラス
   */
  class Shan {
    /**
     * ドラ表示牌が **`p`** の場合のドラを返す。
     * @param p ドラ表示{@link Pai | 牌}
     * @returns ドラ{@link Pai | 牌}
     */
    static zhenbaopai(p: Pai): Pai;

    /**
     * インスタンスを生成する。赤牌の枚数、カンドラ、裏ドラ、カン裏は **`rule`** にしたがう。
     * @param rule {@link Rule | ルール}
     */
    constructor(rule: Rule);

    /**
     * インスタンス生成時に指定された{@link Rule | ルール}
     */
    _rule: Rule;

    /**
     * 牌山中の牌を表す {@link Pai | 牌} の配列。
     * 初期状態では添字 `0`〜`13` が王牌となり、
     * `0`〜`3` がリンシャン牌、
     * `4`〜`8` がドラ表示牌、
     * `9`〜`13` が裏ドラ表示牌として順に使用される。
     * ツモは常に最後尾から取られる。
     */
    _pai: Pai[];

    /**
     * ドラ表示{@link Pai | 牌}の配列。
     */
    _baopai: Pai[];

    /**
     * 裏ドラ表示{@link Pai | 牌}の配列。
     */
    _fubaopai: Pai[];

    /**
     * 開槓可能なとき `true` になる。
     */
    _weikaigan: boolean;

    /**
     * 牌山固定後に `true` になる。
     */
    _closed: boolean;

    /**
     * 次のツモ牌を返す。
     * @returns ツモ{@link Pai | 牌}
     * @throws 牌山固定後に呼び出された場合は例外を発生する。
     */
    zimo(): Pai;

    /**
     * リンシャン牌からの次のツモ牌を返す。
     * @returns ツモ{@link Pai | 牌}
     * @throws 牌山固定後に呼び出された場合は例外を発生する。
     */
    gangzimo(): Pai;

    /**
     * カンドラを増やす。
     * @returns `this`
     * @throws カンヅモより前に呼び出された場合は例外を発生する。
     */
    kaigang(): this;

    /**
     * 牌山を固定する。
     * @returns `this`
     */
    close(): this;

    /**
     * ツモ可能な残り牌数を返す。
     * @returns 残り牌数
     */
    get paishu(): number;

    /**
     * ドラ表示牌の配列を返す。
     * @returns ドラ表示{@link Pai | 牌}の配列
     */
    get baopai(): Pai[];

    /**
     * 牌山固定前は `null` を返す。
     * 牌山固定後は裏ドラ表示牌の配列を返す。
     * @returns 裏ドラ表示{@link Pai | 牌}の配列
     */
    get fubaopai(): Pai[] | null;
  }
}
