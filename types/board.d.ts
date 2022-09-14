declare namespace Majiang {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Board extends BoardInfo {}

  /**
   * 開局時の卓情報
   * @see {@link Paipu} (または {@link KaijuGameMessage.kaiju})
   */
  interface BoardKaijuParams {
    title: string;
    player: string[];
    qijia: number;
  }
  class Board implements BoardInfo {
    /**
     * **`kaiju`** から開局時の卓情報を生成する。
     * **`kaiju`** が指定されない場合は、空の卓情報を生成する。
     * @param kaiju {@link Paipu} (または {@link KaijuGameMessage.kaiju})
     */
    constructor(kaiju?: BoardKaijuParams);

    /**
     * 成立待ちのリーチ宣言があるとき真。
     */
    _lizhi: boolean;

    /**
     * ダブロンの際に先の和了の {@link Hule.hule | `hule.fenpei`} を次の和了に引き継ぐ。
     */
    _fenpei: boolean;

    /**
     * **`kaiju`** を卓情報に反映する。
     * @param kaiju {@link Paipu} (または {@link KaijuGameMessage})
     */
    kaiju(kaiju?: Paipu | KaijuGameMessage['kaiju']): void;

    /**
     * 席順に対する現在の自風を返す。
     * @param id 席順 (`0`: 仮東、`1`: 仮南、`2`: 仮西、`3`: 仮北)
     * @returns 現在の自風 (`0`: 東、`1`: 南、`2`: 西、`3`: 北)
     */
    menfeng(id: number): number;

    /**
     * **`qipai`** を卓情報に反映する。
     * @param qipai {@link Qipai} (または {@link QipaiGameMessage})
     */
    qipai(qipai: Qipai['qipai'] | QipaiGameMessage['qipai']): void;

    /**
     * **`zimo`** を卓情報に反映する。
     * @remarks {@link Gangzimo} ({@link GangzimoGameMessage})の場合も本メソッドを使用する。
     * @param zimo {@link Zimo} (または {@link ZimoGameMessage})
     */
    zimo(
      qipai:
        | Zimo['zimo'] //
        | Gangzimo['gangzimo']
        | ZimoGameMessage['zimo']
        | GangzimoGameMessage['gangzimo'],
    ): void;

    /**
     * **`dapai`** を卓情報に反映する。
     * @param dapai {@link Dapai} (または {@link DapaiGameMessage})
     */
    dapai(dapai: Dapai['dapai'] | DapaiGameMessage['dapai']): void;

    /**
     * **`fulou`** を卓情報に反映する。
     * @param fulou {@link Fulou} (または {@link FulouGameMessage})
     */
    fulou(fulou: Fulou['fulou'] | FulouGameMessage['fulou']): void;

    /**
     * **`gang`** を卓情報に反映する。
     * @param gang {@link Gang} (または {@link GangGameMessage})
     */
    gang(fulou: Gang['gang'] | GangGameMessage['gang']): void;

    /**
     * **`kaigang`** を卓情報に反映する。
     * @param kaigang {@link Kaigang} (または {@link KaigangGameMessage})
     */
    kaigang(kaigang: Kaigang['kaigang'] | KaigangGameMessage['kaigang']): void;

    /**
     * **`hule`** を卓情報に反映する。
     * @param hule {@link Hule} (または {@link HuleGameMessage})
     */
    hule(hule: Hule['hule'] | HuleGameMessage['hule']): void;

    /**
     * **`pingju`** を卓情報に反映する。
     * @param pingju {@link Pingju} (または {@link PingjuGameMessage})
     * @remarks **`defen`**は使われていない。
     */
    pingju(pingju: Pick<Pingju['pingju'], 'name' | 'shoupai'>): void;

    /**
     * 成立待ちのリーチ宣言を成立させる。
     * @internal
     */
    lizhi(): void;
  }
}
