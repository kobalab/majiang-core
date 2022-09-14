declare namespace Majiang {
  namespace Util {
    /**
     * シャンテン数計算関数
     */
    type XiangtingFunction = (shoupai: Shoupai) => number;

    /**
     * **`shoupai`** のシャンテン数を返す。
     * @param shoupai {@link Shoupai | 手牌}
     * @returns **`shoupai`** のシャンテン数
     */
    function xiangting(shoupai: Shoupai): number;

    /**
     * **`shoupai`** の一般手(七対子形、国士無双形以外)としてのシャンテン数を返す。
     * @param shoupai {@link Shoupai | 手牌}
     * @returns **`shoupai`** の一般手としてのシャンテン数
     */
    function xiangting_yiban(shoupai: Shoupai): number;

    /**
     * **`shoupai`** の七対子形としてのシャンテン数を返す。
     * @param shoupai {@link Shoupai | 手牌}
     * @returns **`shoupai`** の七対子形としてのシャンテン数
     */
    function xiangting_qidui(shoupai: Shoupai): number;

    /**
     * **`shoupai`** の国士無双形としてのシャンテン数を返す。
     * @param shoupai {@link Shoupai | 手牌}
     * @returns **`shoupai`** の国士無双形としてのシャンテン数
     */
    function xiangting_guoshi(shoupai: Shoupai): number;

    /**
     * **`shoupai`** に1枚加えるとシャンテン数の進む{@link Pai | 牌}の配列を返す。
     * `f_xiangting` で指定された関数をシャンテン数計算の際に使用する。
     * @param shoupai {@link Shoupai | 手牌}
     * @param f_xiangting 指定されたシャンテン数計算関数。
     * @returns 進む{@link Pai | 牌}の配列。返り値には赤牌は含まない。**`shoupai`** がツモると多牌になる場合は `null` を返す。
     */
    function tingpai(shoupai: Shoupai, f_xiangting?: XiangtingFunction): Pai[] | null;
  }
}
