declare namespace Majiang {
  /**
   * {@link BoardInfo | 卓情報}を描画するクラス
   * @remarks このクラスの詳細はヴィキに載っていない、`game.js`の用例から仮想したインタフェースです。
   */
  interface View {
    /**
     * 開局のときに呼び出された関数
     */
    kaiju(): void;

    /**
     * 配牌のときに呼び出された関数
     * 画面を新たな局に移すためと仮定する
     */
    redraw(): void;

    /**
     * 牌譜が更新するときに呼び出された関数
     * 画面を更新するためと仮定する
     * @param paipu {@link Paipu | 牌譜}
     */
    update(paipu: Paipu): void;

    /**
     * 終局ときに呼び出された関数
     * 画面を終局に移すためと仮定する
     * @param paipu {@link Paipu | 牌譜}
     */
    summary(paipu: Paipu): void;

    /**
     * {@link Player}が副露したときに呼び出された関数
     * 副露動画や音声を流すためと仮定する
     * @param event 副露タイプ
     * * `chi`：チー
     * * `peng`：ポン
     * * `gang`：カン
     * * `rong`：ロン
     * * `zimo`：ツモ
     * @param lunban 副露した{@link Player}の手番(`0`: 東家、`1`: 南家、`2`: 西家、`3`: 北家)。
     */
    say(event: string, lunban: number): void;
  }
}
