declare namespace Majiang {
  /**
   * 描画の際に使用する卓に関する情報を表現するオブジェクト
   */
  interface BoardInfo {
    /**
     * 対局名を示す文字列。
     * @remarks {@link Paipu.title}と同じ。
     */
    title: Paipu['title'];

    /**
     * 対局者情報。仮東から順に並べる。
     * @remarks {@link Paipu.player}と同じ。
     */
    player: Paipu['player'];

    /**
     * 起家(`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)。
     */
    qijia: number;

    /**
     * 場風(`0`: 東、`1`: 南、`2`: 西、`3`: 北)。
     */
    zhuangfeng: number;

    /**
     * 局数(`0`: 一局、`1`: 二局、`2`: 三局、`3`: 四局)。
     */
    jushu: number;

    /**
     * 本場。
     */
    changbang: number;

    /**
     * 現在の供託リーチ棒の数。
     */
    lizhibang: number;

    /**
     * 現在の対局者の持ち点。仮東から順に並べる。
     */
    defen: number[];

    /**
     * その局の牌山を表す {@link Shan} のインスタンス。
     */
    shan: Shan;

    /**
     * その局の対局者の手牌を表す {@link Shoupai} のインスタンスの配列。その局の東家から順に並べる。
     * @remarks テストには`string`と扱ったこともある。実際には`Shoupai`のインスタンスである。
     */
    shoupai: Shoupai[];

    /**
     * その局の対局者の捨て牌を表す {@link He} のインスタンスの配列。その局の東家から順に並べる。
     */
    he: He[];

    /**
     * 対局者の席順(`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)の逆引き表。
     * 起家が仮南で東一局なら、`[ 1, 2, 3, 0 ]` となる。
     */
    player_id: number[];

    /**
     * 現在の手番(`0`: 東家、`1`: 南家、`2`: 西家、`3`: 北家)。
     */
    lunban: number;
  }
}
