declare namespace Majiang {
  /** 通知メッセージ */

  /**
   * 通知メッセージ
   * @remarks
   * 局進行の際に {@link Game} と {@link Player} で通信されるJSON形式のデータ
   */
  type GameMessage =
    | KaijuGameMessage //
    | QipaiGameMessage
    | ZimoGameMessage
    | DapaiGameMessage
    | FulouGameMessage
    | GangGameMessage
    | GangzimoGameMessage
    | KaigangGameMessage
    | HuleGameMessage
    | PingjuGameMessage
    | JiejuGameMessage;

  /**
   * 開局通知メッセージ
   * @example
   * ```javascript
   * { kaiju: {
   *     id:     0,
   *     rule:   { "配給原点": 30000,
   *               // ...
   *               "切り上げ満貫あり": false },
   *     title:  "第十期 天鳳名人戦\n第一節 1卓(1)",
   *     player: [ "（≧▽≦）\n(天鳳位 R2242)",
   *               "Ⓟ木原浩一\n(新人 R1500)",
   *               "太くないお\n(天鳳位 R2224)",
   *               "Ⓟ小林剛\n(新人 R1500)" ],
   *     qijia:  0
   * } }
   * ```
   */
  interface KaijuGameMessage {
    kaiju: {
      /**
       * 席順。(`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)
       */
      id: number;
      /**
       * {@link Rule | ルール}
       */
      rule: Rule;
      /**
       * 牌譜のタイトル。
       */
      title: string;
      /**
       * 対局者情報。仮東から順に並べる。
       */
      player: string[];
      /**
       * 起家。(`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)
       */
      qijia: number;
    };
  }

  /**
   * 配牌通知メッセージ
   * @remarks
   * 他家の配牌（ **`shoupai`** ）はマスクして通知される。
   * @example
   * ```javascript
   * { qipai: {
   *     zhuangfeng: 0,
   *     jushu:      0,
   *     changbang:  0,
   *     lizhibang:  0,
   *     defen:      [ 30000, 30000, 30000, 30000 ],
   *     baoapi:     "s5",
   *     shoupai:    [ "m478p33089s6z1257","","","" ]
   * } }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface QipaiGameMessage extends Qipai {}

  /**
   * 自摸通知メッセージ
   * @remarks
   * 他家のツモ牌（ **`p`** ）はマスクして通知される。
   * @example
   * ```JavaScript
   * { zimo: { l: 0, p: "m4" } }
   * ```
   * @see {@link Zimo}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ZimoGameMessage extends Zimo {}

  /**
   * 打牌通知メッセージ
   * @example
   * ```JavaScript
   * { dapai: { l: 1, p: "z2*" } }
   * ```
   * @see {@link Dapai}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DapaiGameMessage extends Dapai {}

  /**
   * 副露通知メッセージ
   * @example
   * ```JavaScript
   * { fulou: { l: 0, m: "m567-" } }
   * ```
   * @see {@link Fulou}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface FulouGameMessage extends Fulou {}

  /**
   * 槓通知メッセージ
   * @example
   * ```JavaScript
   * { gang: { l: 1, m: "z222-2" } }
   * ```
   * @see {@link Gang}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface GangGameMessage extends Gang {}

  /**
   * 槓通知メッセージ
   * @example
   * ```JavaScript
   * { gangzimo: { l: 1, p: "m9" } }
   * ```
   * @see {@link Gangzimo}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface GangzimoGameMessage extends Gangzimo {}

  /**
   * 開槓通知メッセージ
   * @example
   * ```JavaScript
   * { kaigang: { baopai: "p7" } }
   * ```
   * @see {@link Kaigang}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface KaigangGameMessage extends Kaigang {}

  /**
   * 和了通知メッセージ
   * @example
   * ```JavaScript
   * { hule: {
   *     l:          1,
   *     shoupai:    "m234p35s123789z33p4*",
   *     baojia:     null,
   *     fubaopai:   [ "s9" ],
   *     fu:         40,
   *     fanshu:     3,
   *     defen:      5200,
   *     hupai:      [ { name: "立直", fanshu: 1 },
   *                   { name: "門前清自模和", fanshu: 1 },
   *                   { name: "裏ドラ", fanshu: 1 } ],
   *     fenpei:     [ -2000, 4000, -1000, -1000 ]
   * } }
   * ```
   *
   * 以下は役満の場合。
   * @example
   * ```JavaScript
   * { hule: {
   *     l:          2,
   *     shoupai:    "p7p7,z111-,z222=,z333+,z444-",
   *     baojia:     3,
   *     fubaopai:   null,
   *     damanguan:  2,
   *     defen:      64000,
   *     hupai:      [ { name: "大四喜", fanshu: "**", baojia: 0 } ],
   *     fenpei:     [ -32000, 0, 64000, -32000 ]
   * } }
   * ```
   * @see {@link Hule}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HuleGameMessage extends Hule {}

  /**
   * 流局通知メッセージ
   * @example
   * ```JavaScript
   * { pingju: {
   *     name:       "荒牌平局",
   *     shoupai:    [ "",
   *                   "p2234406z333555",
   *                   "",
   *                   "p11223346777z77" ],
   *     fenpei:     [ -1500, 1500, -1500, 1500 ]
   * } }
   * ```
   * @see {@link Pingju}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PingjuGameMessage extends Pingju {}

  /**
   * 終局通知メッセージ
   * @remarks
   * {@link Paipu | 牌譜}を通知する。
   * @example
   * ```JavaScript
   * { jieju: {
   *     // 牌譜
   * } }
   * ```
   */
  interface JiejuGameMessage {
    jieju: Paipu;
  }

  /** 応答メッセージ */

  /**
   * 応答メッセージ
   * @remarks
   * 局進行の際に {@link Game} と {@link Player} で通信されるJSON形式のデータ
   */
  type PlayerMessage =
    | EmptyPlayerMessage
    | DapaiPlayerMessage
    | FulouPlayerMessage
    | GangPlayerMessage
    | HulePlayerMessage
    | DaopaiPlayerMessage;

  type EmptyPlayerMessage = Record<string, never>;

  /**
   * 打牌応答メッセージ
   * @example
   *  ```JavaScript
   * { dapai: "z2*" }
   * ```
   */
  interface DapaiPlayerMessage {
    /**
     * 切っる{@link Pai | 牌}。
     */
    dapai: Pai;
  }

  /**
   * 副露応答メッセージ
   * @example
   *  ```JavaScript
   * { fulou: "m567-" }
   * ```
   */
  interface FulouPlayerMessage {
    /**
     * 副露する{@link Menzi | 面子}。
     */
    fulou: Menzi;
  }

  /**
   * 槓応答メッセージ
   * @example
   *  ```JavaScript
   * { gang: "m567-" }
   * ```
   */
  interface GangPlayerMessage {
    /**
     * 槓する{@link Menzi | 面子}。
     */
    gang: Menzi;
  }

  /**
   * 和了応答メッセージ
   * @example
   *  ```JavaScript
   * { hule: "-" }
   * ```
   */
  interface HulePlayerMessage {
    hule: string;
  }

  /**
   * 倒牌応答メッセージ
   * @example
   *  ```JavaScript
   * { daopai: "-" }
   * ```
   */
  interface DaopaiPlayerMessage {
    daopai: string;
  }
}
