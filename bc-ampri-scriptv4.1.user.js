// ==UserScript==
// @name         ampri機能拡張スクリプト
// @namespace    http://tampermonkey.net/
// @version      4.1
// @author       Tora
// @description  ampri機能拡張スクリプト
// @match        https://ampuri.github.io/bc-normal-seed-tracking/*
// @grant        none
// ==/UserScript==
/*
 * ▼ 機能一覧
 * ① 自動翻訳機能
 * ② 闇目等の位置表示機能
 * ③ シード保存機能（日付付き）
 * ④ 計画モード機能
 * ⑤ ガチャ間レア被り時の移動先表示機能
 * ⑥ テーブルヘッダー固定機能
 * ⑦ テーブルやアイテムの見た目変更（ヘッダー・赤枠・文字色等）
 *
 * ▼ 注意事項（必ずお読みください）：
 * ・本スクリプトは個人利用を目的として作成されたものです。
 * ・トラブルを避けるため、作成者無許可での再配布・転載・販売・第三者への共有は禁止とさせていただきます。
 * ・これらの注意書きを編集/削除しないでください。
 *
 * ▼ 更新履歴
 * v4.1 -   計画モードにおけるルート保存・継承・削除機能
 * v4.0 -   計画モード追加/ガチャ間レア被り時の移動先表示機能/UI変更
 * ~v3.0 -  自動翻訳機能/闇目等位置表示機能/シード保存機能/UI変更
 *
 */

(function () {
  'use strict';

  // ==================== 設定・定数定義 ====================

  // 英語から日本語への置換ルール一覧
  const replacements = [
    // ガチャ種類
    { from: /^Normal$/, to: 'ノーマルガチャ' },
    { from: /^Normal\+$/, to: 'ノーマルガチャ＋' },
    { from: /^Catfruit$/, to: 'マタタビガチャ' },
    { from: /^Catseye$/, to: '猫目ガチャ' },
    { from: /^Lucky Ticket$/, to: '福引ガチャ' },
    { from: /^Lucky Ticket G$/, to: '福引ガチャG' },

    // ちびキャラ
    { from: /\bLi'l Titan Cat\b/g, to: 'ちび巨神ネコ' },
    { from: /\bLi'l Lizard Cat\b/g, to: 'ちびトカゲネコ' },
    { from: /\bLi'l Fish Cat\b/g, to: 'ちびネコフィッシュ' },
    { from: /\bLi'l Bird Cat\b/g, to: 'ちびネコノトリ' },
    { from: /\bLi'l Cow Cat\b/g, to: 'ちびウシネコ' },
    { from: /\bLi'l Gross Cat\b/g, to: 'ちびキモネコ' },
    { from: /\bLi'l Axe Cat\b/g, to: 'ちびバトルネコ' },
    { from: /\bLi'l Tank Cat\b/g, to: 'ちびタンクネコ' },
    { from: /\bLi'l Cat\b/g, to: 'ちびネコ' },

    // ノーマル
    { from: /\bSuperfeline\b/g, to: 'ネコ超人' },
    { from: /\bTitan Cat\b/g, to: '巨神ネコ' },
    { from: /\bLizard Cat\b/g, to: 'トカゲネコ' },
    { from: /\bFish Cat\b/g, to: 'ネコフィッシュ' },
    { from: /\bBird Cat\b/g, to: 'ネコノトリ' },
    { from: /\bCow Cat\b/g, to: 'ウシネコ' },
    { from: /\bGross Cat\b/g, to: 'キモネコ' },
    { from: /\bAxe Cat\b/g, to: 'バトルネコ' },
    { from: /\bTank Cat\b/g, to: 'タンクネコ' },

    // 強化
    { from: /\bStudy\b/g, to: '勉強力' },
    { from: /\bResearch\b/g, to: '研究力' },
    { from: /\bAccounting\b/g, to: '会計力' },
    { from: /\bCat Energy\b/g, to: '統率力' },
    { from: /\bWorker Cat Rate\b/g, to: '働きネコ仕事効率' },
    { from: /\bWorker Cat Wallet\b/g, to: '働きネコお財布' },
    { from: /\bBase Defense\b/g, to: '城体力' },
    { from: /\bCat Cannon Attack\b/g, to: '砲攻撃力' },
    { from: /\bCat Cannon Charge\b/g, to: '砲チャージ' },

    // XP
    { from: /\b5K XP\b/g, to: '5千XP' },
    { from: /\b10K XP\b/g, to: '1万XP' },
    { from: /\b30K XP\b/g, to: '3万XP' },
    { from: /\b50K XP\b/g, to: '5万XP' },
    { from: /\b100K XP\b/g, to: '10万XP' },
    { from: /\b200K XP\b/g, to: '20万XP' },
    { from: /\b500K XP\b/g, to: '50万XP' },
    { from: /\b1M XP\b/g, to: '100万XP' },

    // マタタビ
    { from: /\bBlue Catfruit Seed\b/g, to: '青マタタビの種' },
    { from: /\bBlue Catfruit\b/g, to: '青マタタビ' },
    { from: /\bPurple Catfruit Seed\b/g, to: '紫マタタビの種' },
    { from: /\bPurple Catfruit\b/g, to: '紫マタタビ' },
    { from: /\bYellow Catfruit Seed\b/g, to: '黄マタタビの種' },
    { from: /\Yellow Catfruit\b/g, to: '黄マタタビ' },
    { from: /\bRed Catfruit Seed\b/g, to: '赤マタタビの種' },
    { from: /\bRed Catfruit\b/g, to: '赤マタタビ' },
    { from: /\bGreen Catfruit Seed\b/g, to: '緑マタタビの種' },
    { from: /\bGreen Catfruit\b/g, to: '緑マタタビ' },
    { from: /\bEpic Catfruit\b/g, to: '虹マタタビ' },

    // 猫目
    { from: /\bDark Catseye\b/g, to: '闇猫目' },
    { from: /\bUber Rare Catseye\b/g, to: '超激レア猫目' },
    { from: /\bSuper Rare Catseye\b/g, to: '激レア猫目' },
    { from: /\bRare Catseye\b/g, to: 'レア猫目' },
    { from: /\bSpecial Catseye\b/g, to: 'EX猫目' },

    // アイテム
    { from: /\bCatamin A\b/g, to: 'ビタンA' },
    { from: /\bCatamin B\b/g, to: 'ビタンB' },
    { from: /\bCatamin C\b/g, to: 'ビタンC' },
    { from: /\bSpeed Up\b/g, to: 'スピダ' },
    { from: /\bCat CPU\b/g, to: 'ニャンピュ' },
    { from: /\bRich Cat\b/g, to: 'ネコボン' },
    { from: /\bCat Jobs\b/g, to: 'おかめはちもく' },
    { from: /\bSniper the Cat\b/g, to: 'スニャイパー' },
    { from: /\bTreasure Radar\b/g, to: 'トレジャーレーダー' },

    // 干渉回避
    { from: /\bCat\b/g, to: 'ネコ' },
  ];

  // グローバル変数・フラグ
  let specialItemsDisplayed = false;
  let isPlanMode = false;
  let ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
  let ticketColumnIndexMap = {};
  let timeoutId = null;
  let isEventGachaEnabled = false;
  let eventGachaColumnAdded = false;
  let hasUnsavedChanges = false;
  let lastSavedState = null;
  let hiddenEventGachaSelections = []; // イベガチャオフ時の選択項目保持用
  let updateTimeout = null;

  // HTML要素のID定数
  const SPECIAL_ITEMS_CONTAINER_ID = 'special-items-container';
  const SEED_SAVE_CONTAINER_ID = 'seed-save-container';
  const PLAN_DATA_STORAGE_KEY = 'nyanko-plan-data';
  const MAX_SAVED_SEEDS = 30;

  // 処理状態管理用のフラグ
  let isEventGachaProcessing = false;
  let eventGachaCheckboxReady = false;
  let eventGachaColumnReady = false;

  // 特別アイテムの表示件数管理
  const displayCounts = {
    闇猫目: 10,
    トレジャーレーダー: 10,
    ビタンC: 10,
  };

  // ガチャ別のスロット配列定義
  const gachaSlots = {
    福引ガチャ: [
      'ちび巨神ネコ',
      'ちびトカゲネコ',
      'ちびネコフィッシュ',
      'ちびネコノトリ',
      'ちびウシネコ',
      'ちびキモネコ',
      'ちびバトルネコ',
      'ちびタンクネコ',
      'ちびネコ',
      'スピダ',
      'スピダ',
      'スピダ',
      'ニャンピュ',
      'ニャンピュ',
      '1万XP',
      '1万XP',
      '1万XP',
      '3万XP',
      '3万XP',
      '3万XP',
    ],
    マタタビガチャ: [
      'スピダ',
      'ニャンピュ',
      '1万XP',
      '3万XP',
      '5万XP',
      '紫マタタビの種',
      '赤マタタビの種',
      '青マタタビの種',
      '緑マタタビの種',
      '黄マタタビの種',
    ],
    猫目ガチャ: ['1万XP', '3万XP', 'EX猫目', 'レア猫目'],
  };

  // 除外対象アイテム（これらが出た場合は引き直し）
  const excludeItems = ['スピダ', 'ニャンピュ', '1万XP', '3万XP'];

  // ==================== シード保存機能 ====================

  /**
   * ローカルストレージから保存済みシードを取得
   */
  function getSavedSeeds() {
    const saved = localStorage.getItem('nyanko-saved-seeds');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * シードを保存（日時付きで最大10件まで）
   */
  function saveSeed(seed) {
    let seeds = getSavedSeeds();
    const now = new Date();
    const dateStr = `(${String(now.getFullYear()).slice(-2)}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')})`;
    const seedData = seed + dateStr;

    if (!seeds.includes(seedData)) {
      seeds.unshift(seedData);
      if (seeds.length > 10) {
        seeds = seeds.slice(0, 10);
      }
      localStorage.setItem('nyanko-saved-seeds', JSON.stringify(seeds));
    }
    return seeds;
  }

  /**
   * 指定したシードを削除
   */
  function deleteSeed(seed) {
    let seeds = getSavedSeeds();
    seeds = seeds.filter((s) => s !== seed);
    localStorage.setItem('nyanko-saved-seeds', JSON.stringify(seeds));
    return seeds;
  }

  /**
   * URLから現在のシードを取得
   */
  function getCurrentSeed() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('seed') || '';
  }

  /**
   * 指定したシードのURLに遷移
   */
  function navigateToSeed(seed) {
    const url = new URL(window.location);
    url.searchParams.set('seed', seed.replace(/\(.*?\)/g, ''));
    window.location.href = url.toString();
  }

  // ==================== テキスト置換機能 ====================

  /**
   * DOMノード内のテキストを再帰的に置換
   */
  function replaceTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      replacements.forEach((rule) => {
        node.textContent = node.textContent.replace(rule.from, rule.to);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of node.childNodes) {
        replaceTextInNode(child);
      }
    }
  }

  /**
   * 背景色が赤のセルのリンク色を黄色に変更
   */
  function updateLinkColors() {
    document.querySelectorAll('td').forEach((td) => {
      const bgColor = getComputedStyle(td).backgroundColor;
      if (bgColor === 'rgb(255, 0, 0)') {
        td.querySelectorAll('a').forEach((a) => {
          a.style.color = '#FFFF00';
        });
      }
    });
  }

  /**
   * 特定のテキスト（1万XP、3万XP、ニャンピュ、スピダ）の色を変更
   */
  function updateTextColors() {
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];

    document.querySelectorAll('td').forEach((td) => {
      const text = td.textContent.trim();
      if (targetTexts.some((target) => text.includes(target))) {
        const linkOrSpan = td.querySelector('a, span');
        if (linkOrSpan) {
          linkOrSpan.style.color = '#d2691e';
        } else {
          td.style.color = '#d2691e';
        }
      }
    });
  }

  /**
   * 計画モード用の特別アイテム色変更
   */
  function updateSpecialItemColors() {
    if (!isPlanMode) return;

    const specialTexts = ['闇猫目', 'トレジャーレーダー', 'ビタンC'];

    // CSS クラス操作で一括処理
    const selectedTds = document.querySelectorAll('td.selected-td');

    // 既存の特別アイテムクラスを一括削除
    document.querySelectorAll('.special-item-selected').forEach((element) => {
      element.classList.remove('special-item-selected');
    });

    // スタイル追加（初回のみ）
    if (!document.getElementById('special-item-selected')) {
      const style = document.createElement('style');
      style.id = 'special-item-selected';
      style.textContent = `
            .special-item-selected {
             color: #ff4500 !important;
             font-weight: bold;
             font-size: 1.1em;
             }
            `;
      document.head.appendChild(style);
    }

    // 選択されたセルのみを処理
    selectedTds.forEach((td) => {
      const text = td.textContent.trim();
      if (specialTexts.some((target) => text.includes(target))) {
        const linkOrSpan = td.querySelector('a, span');
        if (linkOrSpan) {
          linkOrSpan.classList.add('special-item-selected');
        }
      }
    });
  }

  /**
   * 全体的なテキスト置換とスタイル更新を実行
   */
  function replaceAll() {
    replaceTextInNode(document.body);
    updateLinkColors();
    updateTextColors();
    addIconsToSpecificItems();
    makeStickyHeaders();
  }

  // ==================== ポップアップ表示機能 ====================

  /**
   * ポップアップを表示
   */
  function showModernPopup(message, targetElement) {
    // 既存のポップアップ削除
    const existingPopup = document.querySelector('.star-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // ポップアップコンテナ
    const popup = document.createElement('div');
    popup.className = 'star-popup';
    popup.style.cssText = `
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            max-width: 280px;
            white-space: pre-line;
            border: 1px solid #34495e;
            backdrop-filter: blur(10px);
            animation: slideIn 0.2s ease-out;
        `;

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
            position: absolute;
            top: 4px;
            right: 8px;
            background: none;
            border: none;
            color: #ecf0f1;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 3px;
            transition: background-color 0.2s;
        `;

    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'transparent';
    };
    closeButton.onclick = (e) => {
      e.stopPropagation();
      popup.remove();
    };

    // メッセージコンテナ
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
            padding-right: 24px;
            font-weight: 500;
        `;
    messageContainer.textContent = message;

    popup.appendChild(closeButton);
    popup.appendChild(messageContainer);
    document.body.appendChild(popup);

    // ポップアップの位置を計算
    const targetRect = targetElement.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    let top = targetRect.top - popupRect.height - 10;
    let left = targetRect.left + targetRect.width / 2 - popupRect.width / 2;

    // 画面外に出る場合の調整
    if (top < 10) {
      top = targetRect.bottom + 10;
    }
    if (left < 10) {
      left = 10;
    } else if (left + popupRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popupRect.width - 10;
    }

    popup.style.top = `${top + window.scrollY}px`;
    popup.style.left = `${left}px`;

    // 5秒後に自動で閉じる
    setTimeout(() => {
      if (popup && popup.parentNode) {
        popup.remove();
      }
    }, 5000);

    // 背景クリックで閉じる
    const handleOutsideClick = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  // ==================== 特別アイテム抽出・表示機能 ====================

  /**
   * 闇猫目、トレジャーレーダー、ビタンCを抽出
   */
  function extractSpecialItems() {
    const items = {
      闇猫目: [],
      トレジャーレーダー: [],
      ビタンC: [],
    };

    const selector = isPlanMode ? 'span' : 'a';
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const text = element.textContent;
      let itemType = null;

      if (text.includes('闇猫目')) itemType = '闇猫目';
      else if (text.includes('トレジャーレーダー')) itemType = 'トレジャーレーダー';
      else if (text.includes('ビタンC')) itemType = 'ビタンC';

      if (itemType) {
        const td = element.closest('td');
        const tr = td?.closest('tr');
        const prevTr = tr?.previousElementSibling;
        const label = prevTr?.querySelector('td')?.textContent?.trim();
        if (label) items[itemType].push(label);
      }
    });

    // 重複を除去し、数字の昇順でソート
    Object.keys(items).forEach((key) => {
      items[key] = [...new Set(items[key])].sort((a, b) => {
        const matchA = a.match(/^(\d+)(.*)$/);
        const matchB = b.match(/^(\d+)(.*)$/);

        if (matchA && matchB) {
          const numA = parseInt(matchA[1]);
          const numB = parseInt(matchB[1]);
          const strA = matchA[2];
          const strB = matchB[2];

          if (numA !== numB) {
            return numA - numB;
          }
          return strA.localeCompare(strB);
        }

        return a.localeCompare(b);
      });
    });

    return items;
  }

  /**
   * 特別アイテムのリストをテーブル上部に表示
   */
  function displaySpecialItemsAboveTarget(items) {
    const existingContainer = document.getElementById(SPECIAL_ITEMS_CONTAINER_ID);
    const target = document.querySelector('.css-o2j9ze');

    if (!target || !target.parentNode) {
      if (existingContainer) {
        existingContainer.remove();
        specialItemsDisplayed = false;
      }
      return;
    }

    const hasItems = Object.values(items).some((arr) => arr.length > 0);
    if (!hasItems) {
      if (existingContainer) {
        existingContainer.remove();
        specialItemsDisplayed = false;
      }
      return;
    }

    if (existingContainer) {
      existingContainer.remove();
    }

    const container = document.createElement('div');
    container.id = SPECIAL_ITEMS_CONTAINER_ID;
    container.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
        `;

    Object.entries(items).forEach(([itemType, labels]) => {
      if (labels.length > 0) {
        const itemSection = document.createElement('div');
        itemSection.style.marginBottom = '16px';

        const header = document.createElement('div');
        header.style.cssText = `
                    font-weight: bold;
                    color: #333333;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                `;

        const headerText = document.createElement('span');
        headerText.textContent = `${itemType} (${labels.length}件)`;
        header.appendChild(headerText);

        // 10件以上ある場合は展開ボタンを表示
        if (labels.length > displayCounts[itemType]) {
          const expandBtn = document.createElement('button');
          expandBtn.textContent = '+';
          expandBtn.style.cssText = `
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        width: 24px;
                        height: 24px;
                        font-size: 14px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    `;
          expandBtn.onclick = () => {
            displayCounts[itemType] += 10;
            const currentItems = extractSpecialItems();
            displaySpecialItemsAboveTarget(currentItems);
          };
          header.appendChild(expandBtn);
        }

        const labelsList = document.createElement('div');
        labelsList.style.cssText = `line-height: 1.6;`;

        const displayLabels = labels.slice(0, displayCounts[itemType]);
        displayLabels.forEach((label, index) => {
          const labelSpan = document.createElement('span');
          labelSpan.textContent = label;
          labelSpan.style.cssText = `
                        display: inline-block;
                        background: white;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        padding: 4px 8px;
                        margin: 3px 6px 3px 0;
                        font-size: 14px;
                        color: #495057;
                        min-width: 40px;
                        text-align: center;
                    `;
          labelsList.appendChild(labelSpan);
        });

        itemSection.appendChild(header);
        itemSection.appendChild(labelsList);
        container.appendChild(itemSection);
      }
    });

    try {
      target.insertAdjacentElement('beforebegin', container);
      specialItemsDisplayed = true;
    } catch (err) {
      console.error('挿入エラー:', err);
    }
  }

  // ==================== シード保存UI機能 ====================

  /**
   * シード保存・管理UIを作成
   */
  function createSeedSaveUI() {
    const subtitles = document.querySelectorAll('h6.MuiTypography-subtitle2');
    if (subtitles.length < 2) return;

    const secondSubtitle = subtitles[1];
    const existingContainer = document.getElementById(SEED_SAVE_CONTAINER_ID);

    if (existingContainer) {
      const seedList = existingContainer.querySelector('#seed-list');
      if (seedList) {
        const savedSeeds = getSavedSeeds();
        updateSeedList(seedList, savedSeeds);
      }
      return;
    }

    const seedContainer = document.createElement('div');
    seedContainer.id = SEED_SAVE_CONTAINER_ID;
    seedContainer.style.cssText = `margin-bottom: 16px;`;

    // 保存ボタン
    const saveButton = document.createElement('button');
    saveButton.textContent = '現在のシードを保存';
    saveButton.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
            margin-bottom: 8px;
            display: block;
        `;

    saveButton.onclick = () => {
      const currentSeed = getCurrentSeed();
      if (currentSeed) {
        const seeds = saveSeed(currentSeed);
        const seedList = document.getElementById('seed-list');
        if (seedList) {
          updateSeedList(seedList, seeds);
        }
        alert(`シード "${currentSeed}" を保存しました`);
      } else {
        alert('シードが見つかりません');
      }
    };

    // シードリスト表示エリア
    const seedListRow = document.createElement('div');
    seedListRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

    const seedListLabel = document.createElement('div');
    seedListLabel.style.cssText = `
            font-weight: bold;
            font-size: 14px;
            color: #333;
            flex-shrink: 0;
        `;
    seedListLabel.textContent = '保存済みのシード(最大10件)：';

    const seedList = document.createElement('div');
    seedList.id = 'seed-list';
    seedList.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            flex: 1;
        `;

    const savedSeeds = getSavedSeeds();
    updateSeedList(seedList, savedSeeds);

    seedListRow.appendChild(seedListLabel);
    seedListRow.appendChild(seedList);
    seedContainer.appendChild(saveButton);
    seedContainer.appendChild(seedListRow);

    secondSubtitle.parentNode.insertBefore(seedContainer, secondSubtitle);
  }

  /**
   * シードリストのUIを更新
   */
  function updateSeedList(container, seeds) {
    container.innerHTML = '';

    if (seeds.length === 0) {
      const noSeedsMsg = document.createElement('span');
      noSeedsMsg.textContent = '保存済みのシードはありません';
      noSeedsMsg.style.cssText = `
                color: #666;
                font-style: italic;
                font-size: 14px;
            `;
      container.appendChild(noSeedsMsg);
      return;
    }

    seeds.forEach((seed) => {
      const seedButtonContainer = document.createElement('div');
      seedButtonContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 4px;
                background: #e3f2fd;
                border: 1px solid #90caf9;
                border-radius: 4px;
                padding: 2px;
            `;

      const seedButton = document.createElement('button');
      seedButton.textContent = seed;
      seedButton.style.cssText = `
                background: transparent;
                border: none;
                padding: 4px 16px;
                font-size: 14px;
                cursor: pointer;
                color: #1976d2;
                font-family: monospace;
                transition: background-color 0.2s;
                border-radius: 2px;
            `;

      seedButton.onmouseover = () => {
        seedButton.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
      };
      seedButton.onmouseout = () => {
        seedButton.style.backgroundColor = 'transparent';
      };
      seedButton.onclick = () => {
        navigateToSeed(seed);
      };

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '×';
      deleteButton.style.cssText = `
                background: #f44336;
                color: white;
                border: none;
                border-radius: 3px;
                width: 20px;
                height: 18px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            `;

      deleteButton.onmouseover = () => {
        deleteButton.style.backgroundColor = '#d32f2f';
      };
      deleteButton.onmouseout = () => {
        deleteButton.style.backgroundColor = '#f44336';
      };
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`シード "${seed}" を削除しますか？`)) {
          const updatedSeeds = deleteSeed(seed);
          updateSeedList(container, updatedSeeds);
        }
      };

      seedButtonContainer.appendChild(seedButton);
      seedButtonContainer.appendChild(deleteButton);
      container.appendChild(seedButtonContainer);
    });
  }

  /**
   * デバウンス機能付きの更新処理
   */
  function debouncedUpdate() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      const items = extractSpecialItems();
      displaySpecialItemsAboveTarget(items);
      if (!document.getElementById(SEED_SAVE_CONTAINER_ID)) {
        createSeedSaveUI();
      }
      makeStickyHeaders();
    }, 100);
  }

  // ==================== シード計算・スロット機能 ====================

  /**
   * XORShift32アルゴリズムによる疑似乱数生成
   */
  function xorshift32(x) {
    x = (x ^ (x << 13)) >>> 0;
    x = (x ^ (x >>> 17)) >>> 0;
    x = (x ^ (x << 15)) >>> 0;
    return x;
  }

  /**
   * シードを指定ステップ数進める
   */
  function advanceSeed(seed, steps) {
    let currentSeed = seed >>> 0;
    for (let i = 0; i < steps; i++) {
      currentSeed = xorshift32(currentSeed);
    }
    return currentSeed;
  }

  /**
   * URLから現在のシードを取得
   */
  function getCurrentSeedFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const seedStr = urlParams.get('seed');
    return seedStr ? parseInt(seedStr, 10) : 0;
  }

  /**
   * テーブルのヘッダー値を取得
   */
  function getThValue(tableIndex, columnIndex) {
    const tables = document.querySelectorAll('table');
    if (tableIndex < tables.length) {
      const ths = tables[tableIndex].querySelectorAll('thead th');
      if (columnIndex < ths.length) {
        return ths[columnIndex].textContent.trim();
      }
    }
    return '不明';
  }

  /**
   * スロット計算（レア被り時の排出予測）
   * 初期スロット：最初に選ばれたスロット
   * 最終スロット：実際に排出されるアイテム
   * 繰り返し回数：レア被りによる引き直し回数
   */
  function calculateSlot(seed, gachaType) {
    if (!gachaSlots[gachaType]) {
      return { slot: '不明', repeatCount: 0 };
    }

    let currentSlots = [...gachaSlots[gachaType]];
    let currentSeed = seed;
    let repeatCount = 0;
    let initialSlot = null;
    let finalSlot = null;

    while (true) {
      const slotIndex = currentSeed % currentSlots.length;
      const selectedSlot = currentSlots[slotIndex];

      if (initialSlot === null) {
        initialSlot = selectedSlot;
      }

      //   console.log(
      //     `繰り返し${repeatCount}: シード${currentSeed}, 配列長${currentSlots.length}, インデックス${slotIndex}, スロット${selectedSlot}`
      //   );

      if (initialSlot !== selectedSlot) {
        finalSlot = selectedSlot;
        break;
      }

      currentSlots.splice(slotIndex, 1);
      currentSeed = xorshift32(currentSeed);
      repeatCount++;

      if (currentSlots.length === 0) {
        finalSlot = '配列が空になりました';
        break;
      }
    }

    return {
      initialSlot: initialSlot,
      finalSlot: finalSlot,
      repeatCount: repeatCount,
    };
  }

  // ==================== アイコン機能 ====================

  /**
   * 特定のアイテム（1万XP、3万XP、ニャンピュ、スピダ）にクリック可能なアイコンを追加
   */
  function addIconsToSpecificItems() {
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
    let foundCount = 0;

    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      const tbody = table.querySelector('tbody');
      if (!tbody) {
        console.log(`テーブル ${tableIndex}: tbodyが見つかりません`);
        return;
      }

      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.forEach((row, rowIndex) => {
        // 左テーブルは奇数行、右テーブルは偶数行が対象
        let shouldAddIcon = false;

        if (tableIndex === 0 && rowIndex % 2 === 1) {
          shouldAddIcon = true;
          //console.log(`テーブル0: 行${rowIndex} - 奇数行のため対象`);
        } else if (tableIndex === 1 && rowIndex % 2 === 0) {
          shouldAddIcon = true;
          //console.log(`テーブル1: 行${rowIndex} - 偶数行のため対象`);
        } else {
          //console.log(`テーブル${tableIndex}: 行${rowIndex} - 対象外`);
        }

        if (!shouldAddIcon) return;

        const tds = row.querySelectorAll('td');
        tds.forEach((td, tdIndex) => {
          const text = td.textContent.trim();
          const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

          if (matchedText) {
            //console.log(`対象テキスト発見: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}, td${tdIndex}`);
            foundCount++;

            if (td.querySelector('.custom-icon')) {
              //console.log('既にアイコンあり、スキップ');
              return;
            }

            // アイコンを作成
            const icon = document.createElement('span');
            icon.textContent = '⭐';
            icon.className = 'custom-icon';
            icon.style.cssText = `
                            margin-left: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            color: #ffd700;
                            user-select: none;
                            display: inline-block;
                            z-index: 100;
                            position: relative;
                        `;

            // ★ 通常モードか計画モードかでイベント設定を分岐
            if (isPlanMode) {
              // 計画モード用のイベント（バッチ処理で後から設定される）
              //console.log(`計画モード用アイコン追加: ${matchedText}`);
            } else {
              // 通常モード用のイベント（即座に設定）
              icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const currentSeed = getCurrentSeedFromURL();
                let steps = rowIndex + 1;
                const advancedSeed = advanceSeed(currentSeed, steps);
                const thValue = getThValue(tableIndex, tdIndex + 1);

                let slotInfo = null;
                if (gachaSlots[thValue]) {
                  slotInfo = calculateSlot(advancedSeed, thValue);
                }

                const actualRowNumber = Math.floor(rowIndex / 2) + 1;
                const totalSteps = slotInfo ? rowIndex + slotInfo.repeatCount : actualRowNumber;
                const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
                const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
                const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

                let message = `■レア被り時の移動先`;
                message += `\n排出：${slotInfo?.finalSlot || '不明'}`;
                message += `\n次のテーブル位置：${nextTablePosition}`;

                showModernPopup(message, icon);
              });
              //console.log(`通常モード用アイコン追加: ${matchedText}`);
            }

            td.appendChild(icon);
            //console.log(`アイコン追加完了: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}`);
          }
        });
      });
    });

    // console.log(`addIconsToSpecificItems 完了。対象テキスト数: ${foundCount}`);
  }

  // ==================== 計画モード機能 ====================
  /**
   * DOM要素の存在を待機するPromise
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      function check() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`要素が見つかりません: ${selector}`));
          return;
        }

        requestAnimationFrame(check);
      }

      check();
    });
  }
  /**
   * イベガチャ列の作成完了を待機
   */
  function waitForEventGachaColumn() {
    return new Promise((resolve) => {
      function checkColumn() {
        const eventHeaders = document.querySelectorAll('th[data-event-gacha="true"]');
        const eventCells = document.querySelectorAll('td[data-event-gacha="true"]');

        if (eventHeaders.length > 0 && eventCells.length > 0) {
          eventGachaColumnReady = true;
          resolve(true);
          return;
        }

        requestAnimationFrame(checkColumn);
      }

      checkColumn();
    });
  }

  /**
   * 通常モードと計画モードを切り替え
   */
  function toggleMode() {
    const button = document.getElementById('mode-toggle-btn');
    const currentMode = isPlanMode ? '計画モード' : '通常モード';
    const nextMode = isPlanMode ? '通常モード' : '計画モード';

    // ボタンを無効化
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';

    console.log(`${currentMode} → ${nextMode} 切り替え開始`);

    // 計画モードから通常モードに切り替える場合のみ未保存確認
    if (isPlanMode && hasUnsavedChanges) {
      const shouldSwitch = confirm('未保存の計画データがあります。通常モードに切り替えてもいいでしょうか？');
      if (!shouldSwitch) {
        // キャンセル時はボタンを有効化して処理を中断
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        console.log('モード切り替えをキャンセルしました');
        return;
      }
    }

    // ローディングポップアップを表示
    const loadingMessage = `${nextMode}に切り替え中...`;
    showLoadingPopup(loadingMessage);

    // モード切り替え処理を非同期で実行
    setTimeout(() => {
      try {
        // ここでモードフラグを変更
        isPlanMode = !isPlanMode;
        button.textContent = isPlanMode ? '計画モード' : '通常モード';

        if (isPlanMode) {
          console.log('計画モード開始');
          enterPlanModeWithLoading();
        } else {
          console.log('通常モード開始');
          exitPlanModeWithLoading();
        }
      } catch (error) {
        console.error('モード切り替えエラー:', error);
        hideLoadingPopup();

        // エラー時はフラグを戻してボタンを有効化
        isPlanMode = !isPlanMode;
        button.textContent = isPlanMode ? '計画モード' : '通常モード';
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';

        alert('モード切り替えに失敗しました。ページをリロードしてください。');
      }
    }, 100);
  }

  /**
   * 計画モードに移行
   */
  async function enterPlanModeWithLoading() {
    // 初期化
    isEventGachaEnabled = false;
    eventGachaColumnAdded = false;
    hiddenEventGachaSelections = [];
    isEventGachaProcessing = false;
    eventGachaCheckboxReady = false;
    eventGachaColumnReady = false;

    ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
    ticketColumnIndexMap = {};
    createTicketCounter();
    convertLinksToSpans();

    // ルート保存ボタンを作成
    createRouteManagementButtons();

    // イベガチャチェックボックスを作成
    await addEventGachaCheckbox();

    const tables = document.querySelectorAll('table');

    window.batchOperations = [];

    // バッチ処理を順次実行
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        tables.forEach((table, tableIndex) => {
          processTableForPlanMode(table, tableIndex);
        });

        requestAnimationFrame(async () => {
          console.log(`バッチ処理開始: ${window.batchOperations.length}件の操作`);
          executeBatchOperations();

          requestAnimationFrame(async () => {
            updateTicketDisplay();
            updateTextColors();

            // 保存済みデータがあれば復元
            const currentSeed = getCurrentSeed();
            if (currentSeed) {
              await restorePlanState(currentSeed);
            }

            // 変更検知を開始
            lastSavedState = JSON.stringify(getCurrentPlanState());
            hasUnsavedChanges = false;

            resolve();
          });
        });
      });
    });

    finishModeSwitch();
  }

  /**
   * 改善されたバッチ処理実行（DocumentFragment使用）
   */
  function executeBatchOperations() {
    const startTime = performance.now();

    // DocumentFragmentを使用してDOM操作を最小化
    const fragments = new Map();

    // 親ノード別にグループ化
    window.batchOperations.forEach((operation) => {
      const parent = operation.oldElement.parentNode;
      if (!fragments.has(parent)) {
        fragments.set(parent, []);
      }
      fragments.get(parent).push(operation);
    });

    // 親ノード別に一括処理
    fragments.forEach((operations, parent) => {
      operations.forEach((operation) => {
        parent.replaceChild(operation.newElement, operation.oldElement);
      });
    });

    // イベント設定を一括実行（requestAnimationFrameで分割）
    const setupEvents = window.batchOperations.filter((op) => op.setupEvent);
    const chunkSize = 50; // 一度に処理する数

    function processEventChunk(startIndex) {
      const endIndex = Math.min(startIndex + chunkSize, setupEvents.length);

      for (let i = startIndex; i < endIndex; i++) {
        setupEvents[i].setupEvent();
      }

      if (endIndex < setupEvents.length) {
        requestAnimationFrame(() => processEventChunk(endIndex));
      }
    }

    if (setupEvents.length > 0) {
      requestAnimationFrame(() => processEventChunk(0));
    }

    const endTime = performance.now();
    console.log(`最適化バッチ処理完了: ${window.batchOperations.length}件 (${(endTime - startTime).toFixed(2)}ms)`);

    window.batchOperations = [];
  }

  function finishModeSwitch() {
    const button = document.getElementById('mode-toggle-btn');

    // 少し遅延を入れてみる
    setTimeout(() => {
      hideLoadingPopup();

      // ボタンを有効化
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';

      console.log(`${isPlanMode ? '計画' : '通常'}モード切り替え完了`);
    }, 500); // 0.5秒の最小表示時間を確保
  }

  /**
   * チケットカウンター表示エリアを作成
   */
  function createTicketCounter() {
    const existingCounter = document.getElementById('ticket-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    const counter = document.createElement('div');
    counter.id = 'ticket-counter';
    counter.style.cssText = `
        position: fixed;
        inset: auto 1.5rem 1.5rem auto;
        background-color: #ffffffee;
        border: 1px solid #007bff;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.95rem;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(6px);
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        display: flex;
        gap: 1rem;
        align-items: center;
        max-width: 95vw;
        white-space: nowrap;
    `;

    // 初期状態で4つ全て表示
    counter.innerHTML = `
        <div>Nチケ：0</div>
        <div>福チケ：0</div>
        <div>Gチケ：0</div>
        <div>イベチケ：0↑</div>
    `;
    document.body.appendChild(counter);
  }

  /**
   * aタグをspanに変換（計画モード用）
   */
  function convertLinksToSpans() {
    const allLinks = document.querySelectorAll('table a');
    // console.log(`aタグ数: ${allLinks.length}`);

    // 全てのtdのイベントを無効化
    const allTds = document.querySelectorAll('table td');
    allTds.forEach((td) => {
      td.removeAttribute('onclick');
      td.onclick = null;

      ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach((eventType) => {
        td.addEventListener(
          eventType,
          function (e) {
            if (!isPlanMode) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          },
          true
        );
      });
    });

    allLinks.forEach((a, index) => {
      const span = document.createElement('span');
      span.textContent = a.textContent;
      span.className = a.className;
      span.style.cssText = a.style.cssText;
      span.dataset.originalHref = a.href;
      span.dataset.modeSwitch = 'true';
      a.parentNode.replaceChild(span, a);
      //console.log(`aタグ ${index} をspanに変換: ${span.textContent}`);
    });
  }

  /**
   * 計画モード用のテーブル処理
   */
  function processTableForPlanMode(table, tableIndex) {
    // 列インデックスとチケットタイプの対応を登録
    const ths = table.querySelectorAll('thead th');
    ticketColumnIndexMap[tableIndex] = {};

    ths.forEach((th, i) => {
      const text = th.textContent.trim();
      if (text.includes('ノーマルガチャ') || text.includes('猫目ガチャ') || text.includes('マタタビガチャ')) {
        ticketColumnIndexMap[tableIndex][i] = 'N';
      } else if (text.includes('福引ガチャG')) {
        ticketColumnIndexMap[tableIndex][i] = 'G';
      } else if (text.includes('福引ガチャ')) {
        ticketColumnIndexMap[tableIndex][i] = 'F';
      }
    });

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isRightTable = tableIndex === 1 || table.previousElementSibling?.tagName === 'TABLE';

    if (isRightTable) {
      // 右テーブルの処理
      let i = 0;
      while (i < rows.length) {
        const currentRow = rows[i];
        if (currentRow.querySelector('td[colspan]')) {
          i++;
          continue;
        }

        const upperRow = currentRow;
        const lowerRow = rows[i + 1];
        if (!upperRow || !lowerRow) {
          i++;
          continue;
        }

        const upperTds = Array.from(upperRow.querySelectorAll('td'));
        const lowerTds = Array.from(lowerRow.querySelectorAll('td'));

        lowerTds.forEach((td, tdIndex) => {
          const headerIndex = tdIndex + 1;
          const ticketType = ticketColumnIndexMap[tableIndex][headerIndex];
          if (!ticketType) return;

          const correspondingUpperTd = upperTds[tdIndex + 1];
          // バッチ処理に追加（DOM操作は後で一括実行）
          addToBatch(td, correspondingUpperTd, ticketType, tableIndex, i, tdIndex);
        });
        i += 2;
      }
    } else {
      // 左テーブルの処理
      for (let i = 0; i < rows.length; i += 2) {
        const upperRow = rows[i];
        const lowerRow = rows[i + 1];
        if (!upperRow || !lowerRow) continue;

        const upperTds = Array.from(upperRow.querySelectorAll('td'));
        const lowerTds = Array.from(lowerRow.querySelectorAll('td'));

        lowerTds.forEach((td, tdIndex) => {
          const headerIndex = tdIndex + 1;
          const ticketType = ticketColumnIndexMap[tableIndex][headerIndex];
          if (!ticketType) return;

          const correspondingUpperTd = upperTds[tdIndex + 1];
          // バッチ処理に追加
          addToBatch(td, correspondingUpperTd, ticketType, tableIndex, i / 2, tdIndex);
        });
      }
    }
  }
  /**
   * バッチ処理キューに追加
   */
  function addToBatch(lowerTd, upperTd, ticketType, tableIndex, rowPairIndex, tdIndex) {
    // 新しい要素を事前に作成
    const newLowerTd = lowerTd.cloneNode(true);
    let newUpperTd = upperTd ? upperTd.cloneNode(true) : null;

    // データ属性を設定
    newLowerTd.dataset.ticketType = ticketType;
    newLowerTd.dataset.planMode = 'true';
    if (newUpperTd) {
      newUpperTd.dataset.ticketType = ticketType;
      newUpperTd.dataset.planMode = 'true';
    }

    // イベント設定関数を事前に準備
    const setupEvent = () => {
      setupEventForBatchedElement(newLowerTd, newUpperTd, ticketType, tableIndex, rowPairIndex, tdIndex);
    };

    // バッチキューに追加
    window.batchOperations.push({ oldElement: lowerTd, newElement: newLowerTd, setupEvent });

    if (upperTd && newUpperTd) {
      window.batchOperations.push({ oldElement: upperTd, newElement: newUpperTd, setupEvent: null });
    }
  }
  /**
   * バッチ処理後のイベント設定
   */
  function setupEventForBatchedElement(newLowerTd, newUpperTd, ticketType, tableIndex, rowPairIndex, tdIndex) {
    // アイコンのイベント設定
    const icon = newLowerTd.querySelector('.custom-icon');
    if (icon) {
      const row = newLowerTd.closest('tr');
      const tbody = row.closest('tbody');
      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(row);

      const shouldHaveIcon =
        (tableIndex === 0 && currentRowIndex % 2 === 1) || (tableIndex === 1 && currentRowIndex % 2 === 0);

      if (shouldHaveIcon) {
        const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
        const text = newLowerTd.textContent.trim();
        const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

        if (matchedText) {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentSeed = getCurrentSeedFromURL();
            const steps = currentRowIndex + 1;
            const advancedSeed = advanceSeed(currentSeed, steps);
            const tr = newLowerTd.closest('tr');
            const tdIndex = Array.from(tr.querySelectorAll('td')).indexOf(newLowerTd);
            const adjustedTdIndex = Math.max(tdIndex, 0);
            const thValue = getThValue(tableIndex, adjustedTdIndex + 1);

            let slotInfo = null;
            if (gachaSlots[thValue]) {
              slotInfo = calculateSlot(advancedSeed, thValue);
            }

            const actualRowNumber = Math.floor(currentRowIndex / 2) + 1;
            const totalSteps = slotInfo ? currentRowIndex + slotInfo.repeatCount : actualRowNumber;
            const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
            const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
            const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

            const message = `■レア被り時の移動先\n排出：${slotInfo?.finalSlot || '不明'}\n次のテーブル位置：${nextTablePosition}`;
            showModernPopup(message, icon);
          });
        }
      } else {
        icon.remove();
      }
    }

    // セルクリックイベント設定
    const handleCellClick = (e) => {
      if (!isPlanMode || e.target.classList.contains('custom-icon')) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const isSelected = newLowerTd.classList.contains('selected-td');
      ticketCounts[ticketType] += isSelected ? -1 : 1;

      newLowerTd.classList.toggle('selected-td', !isSelected);
      if (newUpperTd) {
        newUpperTd.classList.toggle('selected-td-top', !isSelected);
      }

      // デバウンス処理で更新を最適化
      debouncedUpdateAfterSelection();
    };

    [newLowerTd, newUpperTd].forEach((td) => {
      if (!td) return;
      td.style.cursor = 'pointer';
      td.addEventListener('click', handleCellClick, { capture: true });
    });
  }

  // デバウンス処理を追加

  function debouncedUpdateAfterSelection() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      updateTicketDisplay();
      updateSpecialItemColors();
      checkForChanges();
    }, 16); // 約60fps相当
  }

  /**
   * 計画モード時にイベガチャチェックボックスを追加
   */
  async function addEventGachaCheckbox() {
    if (!isPlanMode) return;

    // 既存のチェックボックスが存在する場合は何もしない
    if (document.getElementById('event-gacha-checkbox')) {
      eventGachaCheckboxReady = true;
      return;
    }

    try {
      // バナーコンテナを待機
      const bannersContainer = document.querySelectorAll('h6.MuiTypography-root.MuiTypography-subtitle2.css-c7dfze')[2];
      if (!bannersContainer) {
        throw new Error('バナーコンテナが見つかりません');
      }

      const checkboxContainer = bannersContainer.nextElementSibling;
      if (!checkboxContainer) {
        throw new Error('チェックボックスコンテナが見つかりません');
      }

      // イベガチャのチェックボックスを作成
      const eventGachaLabel = document.createElement('label');
      eventGachaLabel.style.cssText = 'display: flex; align-items: center;';

      const eventGachaCheckbox = document.createElement('input');
      eventGachaCheckbox.type = 'checkbox';
      eventGachaCheckbox.id = 'event-gacha-checkbox';
      eventGachaCheckbox.style.cssText = 'margin-right: 8px; width: 20px; height: 20px;';

      const eventGachaText = document.createElement('p');
      eventGachaText.className = 'MuiTypography-root MuiTypography-body1 css-9l3uo3';
      eventGachaText.textContent = 'イベガチャ';

      eventGachaLabel.appendChild(eventGachaCheckbox);
      eventGachaLabel.appendChild(eventGachaText);
      checkboxContainer.appendChild(eventGachaLabel);

      // 初期状態は常にオフ
      eventGachaCheckbox.checked = false;
      isEventGachaEnabled = false;

      // イベント設定
      setupEventGachaCheckbox();

      eventGachaCheckboxReady = true;
    } catch (error) {
      console.error('イベガチャチェックボックス作成エラー:', error);
      eventGachaCheckboxReady = false;
    }
  }

  /**
   * イベガチャを有効化するPromise
   */
  async function enableEventGacha() {
    if (isEventGachaProcessing) {
      console.log('イベガチャ処理中のため待機');
      return false;
    }

    isEventGachaProcessing = true;
    console.log('イベガチャ有効化開始');

    try {
      // チェックボックスの準備完了を待機
      if (!eventGachaCheckboxReady) {
        await waitForElement('#event-gacha-checkbox');
      }

      const eventCheckbox = document.getElementById('event-gacha-checkbox');
      if (!eventCheckbox) {
        throw new Error('イベガチャチェックボックスが見つかりません');
      }

      // チェックボックスを有効にする
      eventCheckbox.checked = true;
      isEventGachaEnabled = true;

      // changeイベントを発火
      const changeEvent = new Event('change', { bubbles: true });
      eventCheckbox.dispatchEvent(changeEvent);

      // イベガチャ列の作成完了を待機
      await waitForEventGachaColumn();

      // console.log('イベガチャ有効化完了');
      return true;
    } catch (error) {
      console.error('イベガチャ有効化エラー:', error);
      return false;
    } finally {
      isEventGachaProcessing = false;
    }
  }

  /**
   * イベガチャチェックボックス変更時の処理
   */
  function setupEventGachaCheckbox() {
    const eventGachaCheckbox = document.getElementById('event-gacha-checkbox');
    if (!eventGachaCheckbox) return;

    // 既存のイベントを削除
    eventGachaCheckbox.removeEventListener('change', handleEventGachaChange);

    // 新しいイベントを追加
    eventGachaCheckbox.addEventListener('change', handleEventGachaChange);
  }
  /**
   * イベガチャチェックボックス変更ハンドラ
   */
  function handleEventGachaChange() {
    const checkbox = document.getElementById('event-gacha-checkbox');
    if (!checkbox) return;

    isEventGachaEnabled = checkbox.checked;
    // console.log(`イベガチャ状態変更: ${isEventGachaEnabled}`);

    if (isEventGachaEnabled) {
      addEventGachaColumn();
      // 隠れていた選択項目を復元
      restoreHiddenEventGachaSelections();
    } else {
      // 現在の選択項目を保存してから列を削除
      saveCurrentEventGachaSelections();
      removeEventGachaColumnOnly();
    }

    updateTicketDisplay();
    setTimeout(checkForChanges, 100);
  }

  /**
   * 現在のイベガチャ選択項目を保存
   */
  function saveCurrentEventGachaSelections() {
    hiddenEventGachaSelections = [];

    document.querySelectorAll('.selected-event-td').forEach((td) => {
      const row = td.closest('tr');
      const table = td.closest('table');
      const tableIndex = Array.from(document.querySelectorAll('table')).indexOf(table);

      // 前の行（上の行）からペア番号を取得
      const tbody = table.querySelector('tbody');
      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(row);
      const prevRow = allRows[currentRowIndex - 1];
      const labelCell = prevRow ? prevRow.querySelector('td[rowspan]') : null;
      const labelText = labelCell ? labelCell.textContent.trim() : '';
      const pairNumber = labelText ? parseInt(labelText.match(/(\d+)/)[1]) : 0;

      const eventInfo = {
        tableIndex,
        pairNumber,
        selectedItem: td.textContent.trim(),
      };

      hiddenEventGachaSelections.push(eventInfo);
      console.log('イベガチャ選択項目を保存:', eventInfo);
    });
  }

  /**
   * 隠れていたイベガチャ選択項目を復元
   */
  async function restoreHiddenEventGachaSelections() {
    if (hiddenEventGachaSelections.length === 0) {
      console.log('復元する隠れたイベガチャ選択項目がありません');
      return;
    }

    console.log('隠れていたイベガチャ選択項目を復元:', hiddenEventGachaSelections);

    return new Promise((resolve) => {
      // 現在表示されているテーブルの範囲を取得
      const tables = document.querySelectorAll('table');
      const visiblePairRanges = [];

      tables.forEach((table, tableIndex) => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const allRows = Array.from(tbody.querySelectorAll('tr'));
        let maxPairNumber = 0;

        allRows.forEach((row) => {
          const labelCell = row.querySelector('td[rowspan]');
          if (labelCell) {
            const labelText = labelCell.textContent.trim();
            const pairNumber = parseInt(labelText.match(/(\d+)/)[1]);
            maxPairNumber = Math.max(maxPairNumber, pairNumber);
          }
        });

        visiblePairRanges[tableIndex] = maxPairNumber;
      });

      hiddenEventGachaSelections.forEach((eventInfo, index) => {
        console.log(`イベガチャ復元 ${index}:`, eventInfo);

        // 表示範囲外のアイテムはスキップ
        if (eventInfo.pairNumber > visiblePairRanges[eventInfo.tableIndex]) {
          console.log(
            `表示範囲外のためスキップ: イベガチャペア${eventInfo.pairNumber} (最大表示: ${visiblePairRanges[eventInfo.tableIndex]})`
          );
          return;
        }

        const tables = document.querySelectorAll('table');
        const table = tables[eventInfo.tableIndex];
        if (!table) {
          console.warn(`テーブル ${eventInfo.tableIndex} が見つかりません`);
          return;
        }

        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // ペア番号から下の行を特定
        let targetLowerRow = null;

        if (eventInfo.tableIndex === 1) {
          const nonEmptyRows = allRows.filter((r) => !r.querySelector('td[colspan]'));
          const targetNonEmptyIndex = (eventInfo.pairNumber - 1) * 2 + 1;

          if (targetNonEmptyIndex < nonEmptyRows.length) {
            targetLowerRow = nonEmptyRows[targetNonEmptyIndex];
          }
        } else {
          const targetRowIndex = (eventInfo.pairNumber - 1) * 2 + 1;
          targetLowerRow = allRows[targetRowIndex];
        }

        if (!targetLowerRow) {
          console.warn(`対象の下行が見つかりません: ペア${eventInfo.pairNumber}`);
          return;
        }

        const allTableRows = Array.from(tbody.querySelectorAll('tr'));
        const lowerRowIndex = allTableRows.indexOf(targetLowerRow);
        const targetUpperRow = allTableRows[lowerRowIndex - 1];

        if (!targetUpperRow) {
          console.warn(`対象の上行が見つかりません`);
          return;
        }

        const lowerEventCell = targetLowerRow.querySelector('td[data-event-gacha="true"][data-cell-type="lower"]');
        const upperEventCell = targetUpperRow.querySelector('td[data-event-gacha="true"][data-cell-type="upper"]');

        if (lowerEventCell && upperEventCell) {
          lowerEventCell.textContent = eventInfo.selectedItem;
          upperEventCell.textContent = '←より先に引く';

          lowerEventCell.classList.add('selected-event-td');
          upperEventCell.classList.add('selected-event-td-top');

          upperEventCell.style.borderBottom = 'none';
          lowerEventCell.style.borderTop = 'none';

          console.log(`イベガチャ復元完了: ${eventInfo.selectedItem} (ペア${eventInfo.pairNumber})`);
        } else {
          console.warn('イベガチャセルが見つかりません:', {
            lowerEventCell: !!lowerEventCell,
            upperEventCell: !!upperEventCell,
          });
        }
      });

      updateTicketDisplay();
      resolve();
    });
  }

  /**
   * イベガチャ列のみ削除（選択状態は保持）
   */
  function removeEventGachaColumnOnly() {
    // イベガチャヘッダーを削除
    document.querySelectorAll('th[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // イベガチャセルを削除
    document.querySelectorAll('td[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // 空行のcolspanを元に戻す
    const emptyRows = document.querySelectorAll('td.css-19m26or[data-original-colspan]');
    emptyRows.forEach((td) => {
      const originalColspan = td.dataset.originalColspan;
      if (originalColspan) {
        td.setAttribute('colspan', originalColspan);
        delete td.dataset.originalColspan;
      }
    });

    eventGachaColumnAdded = false;
    console.log('イベガチャ列を削除しました（カウントは保持）');
  }

  /**
   * イベガチャチェックボックスを削除
   */
  function removeEventGachaCheckbox() {
    const checkbox = document.getElementById('event-gacha-checkbox');
    if (checkbox) {
      checkbox.closest('label').remove();
    }
    isEventGachaEnabled = false;
    eventGachaColumnAdded = false;
    removeEventGachaColumn();
  }

  /**
   * テーブルにイベガチャ列を追加
   */
  function addEventGachaColumn() {
    if (eventGachaColumnAdded) return;

    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      // ヘッダーに列を追加
      const thead = table.querySelector('thead tr');
      if (thead) {
        const eventHeader = document.createElement('th');
        eventHeader.className = 'css-12tmn22';
        eventHeader.textContent = 'イベガチャ';
        eventHeader.style.backgroundColor = '#2c3e50';
        eventHeader.style.color = 'white';
        eventHeader.style.fontWeight = '600';
        eventHeader.style.fontSize = '14px';
        eventHeader.style.padding = '14px 12px';
        eventHeader.style.textAlign = 'center';
        eventHeader.style.border = 'none';
        eventHeader.style.position = 'sticky';
        eventHeader.style.top = '0';
        eventHeader.style.zIndex = '1001';
        eventHeader.dataset.eventGacha = 'true';
        thead.appendChild(eventHeader);
      }

      // 既存の空行のcolspanを1増やす
      const emptyRows = table.querySelectorAll('td.css-19m26or[colspan]');
      emptyRows.forEach((td) => {
        const currentColspan = parseInt(td.getAttribute('colspan')) || 5;
        td.setAttribute('colspan', currentColspan + 1);
        // 元のcolspan値を保存
        if (!td.dataset.originalColspan) {
          td.dataset.originalColspan = currentColspan;
        }
      });

      // 各行に空のセルを追加
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // テーブル構造を判定
        const isRightTable = tableIndex === 1 || table.previousElementSibling?.tagName === 'TABLE';

        if (isRightTable) {
          // 右テーブルの処理
          let i = 0;
          let pairIndex = 0;

          while (i < rows.length) {
            const currentRow = rows[i];

            // colspan のある行（空行）をスキップ
            if (currentRow.querySelector('td[colspan]')) {
              i++;
              continue;
            }

            const upperRow = currentRow;
            const lowerRow = rows[i + 1];

            if (!upperRow || !lowerRow) {
              i++;
              continue;
            }

            // 上のセル
            const upperEventCell = document.createElement('td');
            upperEventCell.className = 'css-159psa';
            upperEventCell.innerHTML = '&nbsp;';
            upperEventCell.dataset.eventGacha = 'true';
            upperEventCell.dataset.tableIndex = tableIndex;
            upperEventCell.dataset.pairIndex = pairIndex;
            upperEventCell.dataset.cellType = 'upper';
            upperEventCell.style.backgroundColor = 'white';
            upperEventCell.style.borderBottom = 'none';
            upperRow.appendChild(upperEventCell);

            // 下のセル
            const lowerEventCell = document.createElement('td');
            lowerEventCell.className = 'css-159psa';
            lowerEventCell.innerHTML = '&nbsp;';
            lowerEventCell.dataset.eventGacha = 'true';
            lowerEventCell.dataset.tableIndex = tableIndex;
            lowerEventCell.dataset.pairIndex = pairIndex;
            lowerEventCell.dataset.cellType = 'lower';
            lowerEventCell.style.backgroundColor = 'white';
            lowerEventCell.style.borderTop = 'none';
            lowerRow.appendChild(lowerEventCell);

            // イベント設定
            setupEventGachaCellClick(upperEventCell, lowerEventCell, tableIndex, pairIndex);
            setupEventGachaCellClick(lowerEventCell, upperEventCell, tableIndex, pairIndex);

            i += 2;
            pairIndex++;
          }
        } else {
          // 左テーブルの処理
          let pairIndex = 0;

          for (let i = 0; i < rows.length; i += 2) {
            const upperRow = rows[i];
            const lowerRow = rows[i + 1];

            if (!upperRow || !lowerRow) continue;

            // 上のセル
            const upperEventCell = document.createElement('td');
            upperEventCell.className = 'css-159psa';
            upperEventCell.innerHTML = '&nbsp;';
            upperEventCell.dataset.eventGacha = 'true';
            upperEventCell.dataset.tableIndex = tableIndex;
            upperEventCell.dataset.pairIndex = pairIndex;
            upperEventCell.dataset.cellType = 'upper';
            upperEventCell.style.backgroundColor = 'white';
            upperEventCell.style.borderBottom = 'none';
            upperRow.appendChild(upperEventCell);

            // 下のセル
            const lowerEventCell = document.createElement('td');
            lowerEventCell.className = 'css-159psa';
            lowerEventCell.innerHTML = '&nbsp;';
            lowerEventCell.dataset.eventGacha = 'true';
            lowerEventCell.dataset.tableIndex = tableIndex;
            lowerEventCell.dataset.pairIndex = pairIndex;
            lowerEventCell.dataset.cellType = 'lower';
            lowerEventCell.style.backgroundColor = 'white';
            lowerEventCell.style.borderTop = 'none';
            lowerRow.appendChild(lowerEventCell);

            // イベント設定
            setupEventGachaCellClick(upperEventCell, lowerEventCell, tableIndex, pairIndex);
            setupEventGachaCellClick(lowerEventCell, upperEventCell, tableIndex, pairIndex);

            pairIndex++;
          }
        }
      }

      // チケットカラムマップを更新
      const headerCount = table.querySelectorAll('thead th').length;
      ticketColumnIndexMap[tableIndex][headerCount - 1] = 'E';
    });

    eventGachaColumnAdded = true;
    updateTicketDisplay();
  }

  /**
   * テーブルからイベガチャ列を削除
   */
  function removeEventGachaColumn() {
    // イベガチャヘッダーを削除
    document.querySelectorAll('th[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // イベガチャセルを削除
    document.querySelectorAll('td[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // 空行のcolspanを元に戻す
    const emptyRows = document.querySelectorAll('td.css-19m26or[data-original-colspan]');
    emptyRows.forEach((td) => {
      const originalColspan = td.dataset.originalColspan;
      if (originalColspan) {
        td.setAttribute('colspan', originalColspan);
        delete td.dataset.originalColspan;
      }
    });

    // チケットカウントをリセット
    ticketCounts.E = 0;
    updateTicketDisplay();

    eventGachaColumnAdded = false;
  }
  /**
   * イベガチャセルのクリックイベントを設定
   */
  function setupEventGachaCellClick(clickedCell, pairedCell, tableIndex, pairIndex) {
    clickedCell.style.cursor = 'pointer';

    clickedCell.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const lowerCell = clickedCell.dataset.cellType === 'lower' ? clickedCell : pairedCell;
      const upperCell = clickedCell.dataset.cellType === 'upper' ? clickedCell : pairedCell;

      const currentText = lowerCell.textContent.trim();

      if (currentText !== '' && currentText !== '\u00A0') {
        lowerCell.innerHTML = '&nbsp;';
        upperCell.innerHTML = '&nbsp;';

        upperCell.classList.remove('selected-event-td-top');
        lowerCell.classList.remove('selected-event-td');
        upperCell.style.backgroundColor = 'white';
        lowerCell.style.backgroundColor = 'white';
        upperCell.style.borderBottom = 'none';
        lowerCell.style.borderTop = 'none';

        ticketCounts.E -= 1;
        updateTicketDisplay();

        // 変更を検知
        setTimeout(checkForChanges, 100);
        return;
      }

      showEventGachaOptions(clickedCell, upperCell, lowerCell, tableIndex, pairIndex);
    });
  }
  /**
   * イベガチャ選択肢ポップアップを表示
   */
  function showEventGachaOptions(targetCell, upperCell, lowerCell, tableIndex, pairIndex) {
    // 既存のポップアップを削除
    const existingPopup = document.querySelector('.event-gacha-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];

    // ポップアップを作成
    const popup = document.createElement('div');
    popup.className = 'event-gacha-popup';
    popup.style.cssText = `
        position: absolute;
        background: #2c3e50;
        color: white;
        border: 1px solid #34495e;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        padding: 16px;
        min-width: 220px;
        font-family: 'Segoe UI', Arial, sans-serif;
        backdrop-filter: blur(10px);
    `;

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        color: #ecf0f1;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: background-color 0.2s;
    `;

    closeButton.addEventListener('mouseenter', function () {
      this.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
    });

    closeButton.addEventListener('mouseleave', function () {
      this.style.backgroundColor = 'transparent';
    });

    closeButton.addEventListener('click', function (e) {
      e.stopPropagation();
      popup.remove();
    });

    // ボタンコンテナ（2×2レイアウト）
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
        padding-right: 20px;
    `;

    // 各選択肢のボタンを作成
    targetTexts.forEach((text) => {
      const optionButton = document.createElement('button');
      optionButton.textContent = text;
      optionButton.style.cssText = `
            padding: 12px 16px;
            border: 1px solid #4a5568;
            background: #4a5568;
            color: white;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

      optionButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#5a6578';
        this.style.borderColor = '#5a6578';
      });

      optionButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = '#4a5568';
        this.style.borderColor = '#4a5568';
      });

      optionButton.addEventListener('click', function () {
        // 上のセル
        upperCell.textContent = '←より先に引く';

        // 下のセル
        lowerCell.textContent = text;

        // 両方のセルをイベガチャ専用クラス設定
        upperCell.classList.add('selected-event-td-top');
        lowerCell.classList.add('selected-event-td');

        // 中間のボーダーを消す
        upperCell.style.borderBottom = 'none';
        lowerCell.style.borderTop = 'none';

        // チケットカウントを増加
        ticketCounts.E += 1;
        updateTicketDisplay();

        setTimeout(checkForChanges, 100);

        // ポップアップを閉じる
        popup.remove();
      });

      buttonContainer.appendChild(optionButton);
    });

    // 注意書きコンテナ
    const noteContainer = document.createElement('div');
    noteContainer.style.cssText = `
        border-top: 1px solid #4a5568;
        padding-top: 12px;
        font-size: 12px;
        line-height: 1.4;
        color: #bdc3c7;
        text-align: left;
    `;
    noteContainer.innerHTML = `
        イベガチャでノマロのシードは進みません。<br>レア被り判定のみ共有
    `;

    // 要素を組み立て
    popup.appendChild(closeButton);
    popup.appendChild(buttonContainer);
    popup.appendChild(noteContainer);

    // まず一時的にDOMに追加してサイズを取得
    popup.style.visibility = 'hidden';
    document.body.appendChild(popup);

    // ポップアップの位置を計算
    const targetRect = targetCell.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 基本位置：クリックしたセルの右下
    let left = targetRect.right + 10;
    let top = targetRect.top;

    // 画面右端を超える場合は左側に表示
    if (left + popupRect.width > window.innerWidth - 10) {
      left = targetRect.left - popupRect.width - 10;
    }

    // 画面下端を超える場合は上にずらす
    if (top + popupRect.height > window.innerHeight - 10) {
      top = window.innerHeight - popupRect.height - 10;
    }

    // 画面上端を超えないように調整
    if (top < 10) {
      top = 10;
    }

    // 画面左端を超えないように調整
    if (left < 10) {
      left = 10;
    }

    // スクロール位置を考慮して最終位置を設定
    popup.style.left = `${left + scrollX}px`;
    popup.style.top = `${top + scrollY}px`;
    popup.style.visibility = 'visible';

    // 外部クリックで閉じる
    const handleOutsideClick = (e) => {
      if (!popup.contains(e.target) && e.target !== targetCell) {
        popup.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  /**
   * メモリリーク防止のためのクリーンアップ処理
   */
  function cleanupEventListeners() {
    // 既存のイベントリスナーをクリア
    document.querySelectorAll('td[data-plan-mode]').forEach((td) => {
      const newTd = td.cloneNode(true);
      td.parentNode.replaceChild(newTd, td);
    });

    // グローバル変数のクリーンアップ
    if (window.batchOperations) {
      window.batchOperations.length = 0;
    }

    // タイムアウトのクリーンアップ
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }

    console.log('イベントリスナーとメモリをクリーンアップ完了');
  }

  /**
   * 計画モードを終了
   */
  function exitPlanModeWithLoading() {
    // この時点では既にisPlanModeは変更されているため、
    // 未保存確認はtoggleMode()で既に完了している

    cleanupEventListeners();

    const routeManagementContainer = document.getElementById('route-management-container');
    if (routeManagementContainer) {
      routeManagementContainer.remove();
    }

    const counter = document.getElementById('ticket-counter');
    if (counter) {
      counter.remove();
    }

    removeEventGachaCheckbox();

    requestAnimationFrame(() => {
      const spans = document.querySelectorAll('span[data-mode-switch]');
      spans.forEach((span) => {
        const a = document.createElement('a');
        a.textContent = span.textContent;
        a.className = span.className;
        a.style.cssText = span.style.cssText;
        a.href = span.dataset.originalHref;
        span.parentNode.replaceChild(a, span);
      });

      document.querySelectorAll('.special-item-selected').forEach((element) => {
        element.classList.remove('special-item-selected');
      });

      requestAnimationFrame(() => {
        const planModeTds = document.querySelectorAll('td[data-plan-mode]');
        planModeTds.forEach((td) => {
          td.classList.remove('selected-td', 'selected-td-top');
          td.removeAttribute('data-plan-mode');
          td.removeAttribute('data-ticket-type');

          const newTd = td.cloneNode(true);
          td.parentNode.replaceChild(newTd, td);
        });

        const allTds = document.querySelectorAll('table td');
        allTds.forEach((td) => {
          const newTd = td.cloneNode(true);
          td.parentNode.replaceChild(newTd, td);
        });

        requestAnimationFrame(() => {
          restoreIconEvents();

          hasUnsavedChanges = false;
          lastSavedState = null;
          hiddenEventGachaSelections = []; // 隠れた選択項目もクリア

          finishModeSwitch();
        });
      });
    });
  }

  /**
   * 星マークアイコンのイベントを復元（通常モード用）
   */
  function restoreIconEvents() {
    // console.log('星マークイベント復元開始');
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
    let restoredCount = 0;

    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.forEach((row, rowIndex) => {
        // 左テーブルは奇数行、右テーブルは偶数行が対象
        let shouldHaveIcon = false;
        if (tableIndex === 0 && rowIndex % 2 === 1) {
          shouldHaveIcon = true;
        } else if (tableIndex === 1 && rowIndex % 2 === 0) {
          shouldHaveIcon = true;
        }

        if (!shouldHaveIcon) return;

        const tds = row.querySelectorAll('td');
        tds.forEach((td, tdIndex) => {
          const text = td.textContent.trim();
          const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

          if (matchedText) {
            // 既存のアイコンを確認
            let icon = td.querySelector('.custom-icon');

            if (!icon) {
              // アイコンが存在しない場合は作成
              icon = document.createElement('span');
              icon.textContent = '⭐';
              icon.className = 'custom-icon';
              icon.style.cssText = `
                                margin-left: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                color: #ffd700;
                                user-select: none;
                                display: inline-block;
                                z-index: 1000;
                                position: relative;
                            `;
              td.appendChild(icon);
            }

            // イベントリスナーを再設定（通常モード用）
            // 既存のイベントをクリア
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);

            newIcon.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const currentSeed = getCurrentSeedFromURL();
              let steps = rowIndex + 1;
              const advancedSeed = advanceSeed(currentSeed, steps);
              const thValue = getThValue(tableIndex, tdIndex + 1);

              let slotInfo = null;
              if (gachaSlots[thValue]) {
                slotInfo = calculateSlot(advancedSeed, thValue);
              }

              const actualRowNumber = Math.floor(rowIndex / 2) + 1;
              const totalSteps = slotInfo ? rowIndex + slotInfo.repeatCount : actualRowNumber;
              const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
              const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
              const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

              let message = `■レア被り時の移動先`;
              message += `\n排出：${slotInfo?.finalSlot || '不明'}`;
              message += `\n次のテーブル位置：${nextTablePosition}`;

              showModernPopup(message, newIcon);
            });

            restoredCount++;
            //console.log(`星マークイベント復元: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}`);
          }
        });
      });
    });

    // console.log(`星マークイベント復元完了: ${restoredCount}個のアイコン`);
  }

  /**
   * チケットカウント表示を更新
   */
  function updateTicketDisplay() {
    const counter = document.getElementById('ticket-counter');
    if (counter) {
      // 常に4つ表示（イベガチャの状態に関係なく）
      const children = counter.children;

      if (children.length >= 4) {
        children[0].textContent = `Nチケ：${ticketCounts.N}`;
        children[1].textContent = `福チケ：${ticketCounts.F}`;
        children[2].textContent = `Gチケ：${ticketCounts.G}`;
        children[3].textContent = `イベチケ：${ticketCounts.E}↑`;
      } else {
        // 要素が不足している場合は再作成
        counter.innerHTML = `
                <div>Nチケ：${ticketCounts.N}</div>
                <div>福チケ：${ticketCounts.F}</div>
                <div>Gチケ：${ticketCounts.G}</div>
                <div>イベチケ：${ticketCounts.E}↑</div>
            `;
      }
      //   console.log('カウンター更新:', ticketCounts);
    } else {
      console.log('カウンターが見つかりません');
    }
  }

  // ==================== 計画モード保存機能 ====================

  /**
   * 計画データをローカルストレージに保存
   */
  function savePlanData(seed, planData, showConfirm = true) {
    let savedPlans = getSavedPlanData();

    // 既存データの確認
    const existingData = savedPlans[seed];
    if (existingData && showConfirm) {
      if (!confirm(`シード "${seed}" のルートデータが既に存在します。上書きしますか？`)) {
        return false;
      }
    }

    // 新しいデータを追加
    savedPlans[seed] = {
      ...planData,
      savedAt: new Date().toISOString(),
    };

    // 件数制限チェック
    const seedKeys = Object.keys(savedPlans);
    if (seedKeys.length > MAX_SAVED_SEEDS) {
      const sortedSeeds = seedKeys.sort((a, b) => {
        return new Date(savedPlans[a].savedAt) - new Date(savedPlans[b].savedAt);
      });

      const toDelete = sortedSeeds.slice(0, seedKeys.length - MAX_SAVED_SEEDS);
      toDelete.forEach((seedToDelete) => {
        delete savedPlans[seedToDelete];
      });

      if (toDelete.length > 0) {
        console.log(`容量制限により${toDelete.length}件の古いデータを削除しました`);
      }
    }

    try {
      localStorage.setItem(PLAN_DATA_STORAGE_KEY, JSON.stringify(savedPlans));

      // 保存成功をマーク
      hasUnsavedChanges = false;
      lastSavedState = JSON.stringify(getCurrentPlanState());
      updateSaveButtonState(); // ボタン状態を即座に更新

      if (showConfirm) {
        alert(`シード "${seed}" のルートを保存しました`);
      }

      //   console.log('保存完了:', seed, planData);
      return true;
    } catch (error) {
      console.error('保存エラー:', error);
      if (showConfirm) {
        alert('保存に失敗しました');
      }
      return false;
    }
  }

  /**
   * 保存済み計画データを取得
   */
  function getSavedPlanData() {
    const saved = localStorage.getItem(PLAN_DATA_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * ルート管理ボタンを作成（横並び3つ）
   */
  function createRouteManagementButtons() {
    // 既存のボタンを削除
    document.getElementById('save-route-btn')?.remove();
    document.getElementById('delete-route-btn')?.remove();
    document.getElementById('inherit-route-btn')?.remove();

    // ボタンコンテナを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'route-management-container';
    buttonContainer.style.cssText = `
        position: fixed;
        top: 60px;
        right: 12px;
        z-index: 10000;
        display: flex;
        gap: 8px;
        font-family: inherit;
    `;

    // ルート削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-route-btn';
    deleteButton.textContent = 'ルートを削除';
    deleteButton.style.cssText = `
        padding: 8px 16px;
        background-color: #dc3545;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    deleteButton.onclick = clearCurrentRoute;

    // ルート継承ボタン
    const inheritButton = document.createElement('button');
    inheritButton.id = 'inherit-route-btn';
    inheritButton.textContent = 'ルートを継承';
    inheritButton.style.cssText = `
        padding: 8px 16px;
        background-color: #17a2b8;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    inheritButton.onclick = () => {
      if (hasUnsavedChanges) {
        alert('未保存の変更があります。先にルートを保存してください。');
        return;
      }
      showInheritRouteDialog();
    };

    // ルート保存ボタン
    const saveButton = document.createElement('button');
    saveButton.id = 'save-route-btn';
    saveButton.textContent = 'ルートを保存';
    saveButton.style.cssText = `
        padding: 8px 16px;
        background-color: #28a745;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    saveButton.onclick = () => {
      const currentSeed = getCurrentSeed();
      if (currentSeed && isPlanMode) {
        const planData = getCurrentPlanState();
        if (planData) {
          savePlanData(currentSeed, planData);
        } else {
          alert('保存する計画データがありません');
        }
      } else {
        alert('計画モードでない、またはシードが取得できません');
      }
    };

    // ボタンをコンテナに追加
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(inheritButton);
    buttonContainer.appendChild(saveButton);

    // コンテナをページに追加
    document.body.appendChild(buttonContainer);

    // 継承ボタンの状態を更新
    updateInheritButtonState();
  }

  /**
   * 継承ボタンの状態を更新
   */
  function updateInheritButtonState() {
    const inheritButton = document.getElementById('inherit-route-btn');
    if (inheritButton) {
      if (hasUnsavedChanges) {
        inheritButton.style.backgroundColor = '#6c757d';
        inheritButton.style.cursor = 'not-allowed';
        inheritButton.style.opacity = '0.6';
      } else {
        inheritButton.style.backgroundColor = '#17a2b8';
        inheritButton.style.cursor = 'pointer';
        inheritButton.style.opacity = '1';
      }
    }
  }

  /**
   * 保存ボタンの状態を更新（継承ボタン状態も更新）
   */
  function updateSaveButtonState() {
    const saveButton = document.getElementById('save-route-btn');
    if (saveButton) {
      if (hasUnsavedChanges) {
        saveButton.style.backgroundColor = '#ff6b35';
        saveButton.textContent = 'ルートを保存 (未保存)';
      } else {
        saveButton.style.backgroundColor = '#28a745';
        saveButton.textContent = 'ルートを保存';
      }
    }

    // 継承ボタンの状態も更新
    updateInheritButtonState();
  }

  /**
   * 現在のルートを削除（表示上のみ、キャッシュは保持）
   */
  function clearCurrentRoute() {
    if (!isPlanMode) {
      alert('計画モードではありません');
      return;
    }

    if (confirm('現在選択している項目をすべて削除しますか？')) {
      // 選択状態をクリア
      document.querySelectorAll('.selected-td').forEach((td) => {
        td.classList.remove('selected-td');
        td.removeAttribute('data-ticket-type');
      });

      document.querySelectorAll('.selected-td-top').forEach((td) => {
        td.classList.remove('selected-td-top');
        td.removeAttribute('data-ticket-type');
      });

      // イベガチャの選択もクリア
      document.querySelectorAll('.selected-event-td').forEach((td) => {
        td.classList.remove('selected-event-td');
        td.innerHTML = '&nbsp;';
      });

      document.querySelectorAll('.selected-event-td-top').forEach((td) => {
        td.classList.remove('selected-event-td-top');
        td.innerHTML = '&nbsp;';
        td.style.backgroundColor = 'white';
        td.style.borderBottom = 'none';
      });

      // チケットカウントをリセット
      ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
      updateTicketDisplay();
      updateSpecialItemColors();

      // 変更状態を更新
      setTimeout(checkForChanges, 100);

      console.log('ルート表示をクリアしました');
    }
  }

  /**
   * ルート継承ダイアログを表示
   */
  function showInheritRouteDialog() {
    if (!isPlanMode) {
      alert('計画モードではありません');
      return;
    }

    // 既存のダイアログを削除
    const existingDialog = document.querySelector('.inherit-route-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    // ダイアログのオーバーレイ
    const overlay = document.createElement('div');
    overlay.className = 'inherit-route-dialog';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // ダイアログボックス
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        min-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = 'ルート継承';
    title.style.cssText = `
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;

    // 説明文
    const description = document.createElement('p');
    description.textContent = '次のテーブル位置を選択してください：';
    description.style.cssText = `
        margin: 0 0 16px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
    `;

    // 入力エリア
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
    `;

    // 数字入力
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = '1';
    numberInput.max = '999';
    numberInput.value = '1';
    numberInput.style.cssText = `
        width: 80px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        text-align: center;
    `;

    // A/B選択
    const abSelect = document.createElement('select');
    abSelect.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
    `;

    const optionA = document.createElement('option');
    optionA.value = 'A';
    optionA.textContent = 'A';

    const optionB = document.createElement('option');
    optionB.value = 'B';
    optionB.textContent = 'B';

    abSelect.appendChild(optionA);
    abSelect.appendChild(optionB);

    inputContainer.appendChild(numberInput);
    inputContainer.appendChild(abSelect);

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    `;

    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    `;
    cancelButton.onclick = () => overlay.remove();

    // OKボタン
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    `;
    okButton.onclick = () => {
      const targetNumber = parseInt(numberInput.value);
      const targetSuffix = abSelect.value;

      if (targetNumber >= 1 && targetNumber <= 999) {
        overlay.remove();
        executeRouteInheritance(targetNumber, targetSuffix);
      } else {
        alert('1～999の数字を入力してください');
      }
    };

    // 要素を組み立て
    buttonArea.appendChild(cancelButton);
    buttonArea.appendChild(okButton);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(inputContainer);
    dialog.appendChild(buttonArea);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // フォーカスを数字入力に設定
    numberInput.focus();
    numberInput.select();

    // Enterキーでも実行
    numberInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        okButton.click();
      }
    });

    // 外部クリックで閉じる
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  /**
   * ルート継承を実行
   */
  function executeRouteInheritance(targetNumber, targetSuffix) {
    console.log(`ルート継承実行: ${targetNumber}${targetSuffix}`);

    const currentSeed = getCurrentSeedFromURL();
    const steps = (targetNumber - 1) * 2 + (targetSuffix === 'B' ? 1 : 0);
    const newSeed = advanceSeed(currentSeed, steps);

    // 【重要】継承時は保存データを含めた完全な状態を取得
    const currentState = getCurrentPlanState(true); // 継承フラグを有効化

    if (!currentState || (!currentState.selectedCells?.length && !currentState.eventGachaSelections?.length)) {
      alert('継承する選択項目がありません');
      return;
    }

    console.log('継承前の現在状態:', currentState);

    // 継承対象の判定
    const targetPosition = targetNumber * 10 + (targetSuffix === 'A' ? 0 : 1);
    console.log(`継承開始位置: ${targetNumber}${targetSuffix}, 判定用position値: ${targetPosition}`);

    const shiftAmount = targetPosition - 10; // 1A = 10
    console.log(`シフト量計算: ${targetPosition} - 10 = ${shiftAmount}`);

    // より効率的な位置計算関数
    const processItems = (items, isEventGacha = false) => {
      return items
        .filter((item) => {
          const suffix = item.tableIndex === 0 ? 'A' : 'B';
          const position = item.pairNumber * 10 + (suffix === 'A' ? 0 : 1);
          return position >= targetPosition;
        })
        .map((item) => {
          if (targetSuffix === 'A') {
            return {
              ...item,
              pairNumber: Math.max(1, item.pairNumber - (targetNumber - 1)),
            };
          } else {
            const originalPosition = item.pairNumber * 10 + (item.tableIndex === 0 ? 0 : 1);
            const newPosition = originalPosition - shiftAmount;
            const newPairNumber = Math.floor(newPosition / 10);
            const newTableIndex = newPosition % 10 === 0 ? 0 : 1;

            return newPairNumber >= 1
              ? {
                  ...item,
                  pairNumber: newPairNumber,
                  tableIndex: newTableIndex,
                }
              : null;
          }
        })
        .filter((item) => item !== null);
    };

    const shiftedCells = processItems(currentState.selectedCells || []);
    const shiftedEventGacha = processItems(currentState.eventGachaSelections || [], true);

    // チケットカウントを効率的に再計算
    const newTicketCounts = { N: 0, F: 0, G: 0, E: 0 };

    shiftedCells.forEach((cell) => {
      const ticketType = cell.ticketType || getTicketTypeFromColumnName(cell.columnName);
      if (newTicketCounts[ticketType] !== undefined) {
        newTicketCounts[ticketType]++;
      }
    });

    newTicketCounts.E += shiftedEventGacha.length;

    console.log('継承後のチケットカウント:', newTicketCounts);

    // 新しい計画データを作成
    const newPlanData = {
      ticketCounts: newTicketCounts,
      selectedCells: shiftedCells,
      eventGachaSelections: shiftedEventGacha,
      isEventGachaEnabled: newTicketCounts.E > 0,
    };

    if (shiftedCells.length > 0 || shiftedEventGacha.length > 0) {
      const success = savePlanData(newSeed.toString(), newPlanData, true);

      if (success) {
        const totalItems = shiftedCells.length + shiftedEventGacha.length;
        const ticketSummary = Object.entries(newTicketCounts)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => {
            const typeName =
              {
                N: 'ノーマル',
                F: '福引',
                G: 'G福引',
                E: 'イベント',
              }[type] || type;
            return `${typeName}: ${count}枚`;
          })
          .join(', ');

        let message = `ルート継承完了\n新シード: ${newSeed}\nチケット: ${ticketSummary || 'なし'}`;
        message += '\n\n新しいシードのページに遷移しますか？';

        const shouldNavigate = confirm(message);

        if (shouldNavigate) {
          const url = new URL(window.location);
          url.searchParams.set('seed', newSeed.toString());
          window.location.href = url.toString();
        }
      } else {
        alert('ルートの保存に失敗しました');
      }
    } else {
      alert('継承可能な項目がありませんでした');
    }
  }

  /**
   * 現在の計画状態を取得
   */
  function getTicketTypeFromColumnName(columnName) {
    if (!columnName) return 'N';

    console.log(`チケットタイプ判定: カラム名 "${columnName}"`);

    // より詳細なマッピング
    if (columnName.includes('福引ガチャG')) {
      console.log('→ G福引と判定');
      return 'G';
    }
    if (columnName.includes('福引ガチャ')) {
      console.log('→ 福引と判定');
      return 'F';
    }
    if (columnName.includes('イベガチャ')) {
      console.log('→ イベントと判定');
      return 'E';
    }
    if (
      columnName.includes('ノーマルガチャ') ||
      columnName.includes('猫目ガチャ') ||
      columnName.includes('マタタビガチャ')
    ) {
      console.log('→ ノーマルと判定');
      return 'N';
    }

    console.log('→ デフォルトでノーマルと判定');
    return 'N';
  }

  /**
   * 現在の計画状態を取得
   * 基本的に現在の表示状態を正として扱い、継承時のみ保存データを活用
   */
  function getCurrentPlanState(forInheritance = false) {
    if (!isPlanMode) return null;

    const planData = {
      ticketCounts: { ...ticketCounts },
      selectedCells: [],
      eventGachaSelections: [],
      isEventGachaEnabled: isEventGachaEnabled,
    };

    // 一度だけテーブル情報を取得してキャッシュ
    const tables = Array.from(document.querySelectorAll('table'));
    const tableHeaders = tables.map((table) =>
      Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim())
    );

    // 継承時のみ保存データを活用、それ以外は表示項目のみ
    if (forInheritance) {
      // 継承時：保存データから全選択項目を取得
      const currentSeed = getCurrentSeed();
      const savedPlans = getSavedPlanData();
      const savedPlan = savedPlans[currentSeed];

      if (savedPlan && savedPlan.selectedCells) {
        // 保存済みデータをそのまま使用
        planData.selectedCells = [...savedPlan.selectedCells];

        // 現在表示されている選択項目で部分的に更新
        document.querySelectorAll('.selected-td').forEach((td) => {
          const row = td.closest('tr');
          const table = td.closest('table');
          const tableIndex = tables.indexOf(table);

          if (tableIndex === -1) return;

          const tbody = table.querySelector('tbody');
          const allRows = Array.from(tbody.querySelectorAll('tr'));
          const currentRowIndex = allRows.indexOf(row);

          const { pairNumber, isUpperRow, actualCellIndex } = analyzeRowStructure(row, allRows, currentRowIndex, td);
          const columnName = tableHeaders[tableIndex][actualCellIndex + 1] || '';
          const ticketType = td.dataset.ticketType || getTicketTypeFromColumnName(columnName);

          // 既存項目を更新または新規追加
          const existingIndex = planData.selectedCells.findIndex(
            (item) =>
              item.tableIndex === tableIndex &&
              item.pairNumber === pairNumber &&
              item.isUpperRow === isUpperRow &&
              item.columnName === columnName
          );

          const cellData = {
            tableIndex,
            pairNumber,
            isUpperRow,
            columnName,
            actualCellIndex,
            ticketType,
            text: td.textContent.trim(),
          };

          if (existingIndex >= 0) {
            planData.selectedCells[existingIndex] = cellData;
          } else {
            planData.selectedCells.push(cellData);
          }
        });
      } else {
        // 保存データがない場合は表示項目のみ
        planData.selectedCells = getCurrentVisibleSelections(tables, tableHeaders);
      }

      // イベガチャも継承時は保存データを活用
      if (savedPlan && savedPlan.eventGachaSelections) {
        // 保存済みイベガチャデータをベースに使用
        planData.eventGachaSelections = [...savedPlan.eventGachaSelections];

        // 現在表示されているイベガチャ選択項目で部分的に更新
        const currentVisibleEventSelections = [];
        document.querySelectorAll('.selected-event-td').forEach((td) => {
          const { tableIndex, pairNumber } = getEventGachaInfo(td, tables);
          currentVisibleEventSelections.push({
            tableIndex,
            pairNumber,
            selectedItem: td.textContent.trim(),
          });
        });

        // 表示中の項目で保存データを更新
        currentVisibleEventSelections.forEach((visibleEvent) => {
          const existingIndex = planData.eventGachaSelections.findIndex(
            (savedEvent) =>
              savedEvent.tableIndex === visibleEvent.tableIndex && savedEvent.pairNumber === visibleEvent.pairNumber
          );

          if (existingIndex >= 0) {
            planData.eventGachaSelections[existingIndex] = visibleEvent;
          } else {
            planData.eventGachaSelections.push(visibleEvent);
          }
        });
      } else {
        // 保存データがない場合は表示項目のみ
        planData.eventGachaSelections = getCurrentVisibleEventSelections(tables);
      }
    } else {
      // 通常時：表示項目のみを使用（削除・選択解除を正しく反映）
      planData.selectedCells = getCurrentVisibleSelections(tables, tableHeaders);

      // 通常時のイベガチャ処理
      if (isEventGachaEnabled) {
        planData.eventGachaSelections = getCurrentVisibleEventSelections(tables);
      } else if (hiddenEventGachaSelections?.length > 0) {
        planData.eventGachaSelections = [...hiddenEventGachaSelections];
      }
    }

    return planData;
  }

  /**
   * 現在表示されているイベガチャ選択項目を取得するヘルパー関数
   */
  function getCurrentVisibleEventSelections(tables) {
    const selections = [];

    document.querySelectorAll('.selected-event-td').forEach((td) => {
      const { tableIndex, pairNumber } = getEventGachaInfo(td, tables);

      selections.push({
        tableIndex,
        pairNumber,
        selectedItem: td.textContent.trim(),
      });
    });

    return selections;
  }

  /**
   * 現在表示されている選択項目を取得するヘルパー関数
   */
  function getCurrentVisibleSelections(tables, tableHeaders) {
    const selections = [];

    document.querySelectorAll('.selected-td').forEach((td) => {
      const row = td.closest('tr');
      const table = td.closest('table');
      const tableIndex = tables.indexOf(table);

      if (tableIndex === -1) return;

      const tbody = table.querySelector('tbody');
      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(row);

      const { pairNumber, isUpperRow, actualCellIndex } = analyzeRowStructure(row, allRows, currentRowIndex, td);
      const columnName = tableHeaders[tableIndex][actualCellIndex + 1] || '';
      const ticketType = td.dataset.ticketType || getTicketTypeFromColumnName(columnName);

      selections.push({
        tableIndex,
        pairNumber,
        isUpperRow,
        columnName,
        actualCellIndex,
        ticketType,
        text: td.textContent.trim(),
      });
    });

    return selections;
  }

  /**
   * ヘルパー関数を分離して再利用
   */
  function analyzeRowStructure(row, allRows, currentRowIndex, td) {
    const hasRowspanCell = row.querySelector('td[rowspan]');

    if (hasRowspanCell) {
      const labelText = hasRowspanCell.textContent.trim();
      return {
        pairNumber: parseInt(labelText.match(/(\d+)/)[1]),
        isUpperRow: true,
        actualCellIndex: Array.from(row.querySelectorAll('td')).indexOf(td) - 1,
      };
    } else {
      const prevRow = allRows[currentRowIndex - 1];
      const labelCell = prevRow?.querySelector('td[rowspan]');
      const labelText = labelCell?.textContent.trim() || '';
      return {
        pairNumber: labelText ? parseInt(labelText.match(/(\d+)/)[1]) : 0,
        isUpperRow: false,
        actualCellIndex: Array.from(row.querySelectorAll('td')).indexOf(td),
      };
    }
  }

  /**
   * イベガチャ情報取得のヘルパー関数
   */
  function getEventGachaInfo(td, tables) {
    const row = td.closest('tr');
    const table = td.closest('table');
    const tableIndex = tables.indexOf(table);
    const tbody = table.querySelector('tbody');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const currentRowIndex = allRows.indexOf(row);
    const prevRow = allRows[currentRowIndex - 1];
    const labelCell = prevRow ? prevRow.querySelector('td[rowspan]') : null;
    const labelText = labelCell ? labelCell.textContent.trim() : '';
    const pairNumber = labelText ? parseInt(labelText.match(/(\d+)/)[1]) : 0;

    return { tableIndex, pairNumber };
  }

  /**
   * 保存済みデータから計画状態を復元
   */
  async function restorePlanState(seed) {
    const savedPlans = getSavedPlanData();
    const planData = savedPlans[seed];

    if (!planData) {
      console.log(`シード ${seed} の保存データが見つかりません`);
      return false;
    }

    console.log(`シード ${seed} の計画データを復元中...`, planData);

    // チケットカウントを先に復元
    if (planData.ticketCounts) {
      ticketCounts = { ...planData.ticketCounts };
      console.log('復元されたチケットカウント:', ticketCounts);
    }

    const hasEventTickets = ticketCounts.E > 0;
    const hasEventGachaSelections = planData.eventGachaSelections && planData.eventGachaSelections.length > 0;

    console.log(`イベガチャ復元判定:`, {
      hasEventTickets,
      hasEventGachaSelections,
    });

    // イベガチャ選択項目がある場合は隠れた選択項目として設定
    if (hasEventGachaSelections) {
      hiddenEventGachaSelections = [...planData.eventGachaSelections];
      console.log('イベガチャ選択項目を隠れた選択項目として設定:', hiddenEventGachaSelections);
    }

    // イベチケがある場合はイベガチャを有効化
    if (hasEventTickets) {
      console.log(`イベチケが${ticketCounts.E}枚あるため、イベガチャを有効化します`);
      const success = await enableEventGacha();
      if (!success) {
        console.error('イベガチャの有効化に失敗しました');
      }
    } else {
      // イベチケがない場合は無効のまま
      isEventGachaEnabled = false;
      hiddenEventGachaSelections = [];
      console.log('イベチケがないため、イベガチャは無効のままです');
    }

    // 通常セルの復元
    if (planData.selectedCells) {
      await restoreSelectedCells(planData.selectedCells);
    }

    // イベガチャ選択項目の復元
    if (hasEventTickets && hasEventGachaSelections && isEventGachaEnabled) {
      console.log('イベガチャ選択項目の表示復元を実行');
      await restoreHiddenEventGachaSelections();
    }

    updateTicketDisplay();
    updateSpecialItemColors();

    // 復元完了をマーク
    hasUnsavedChanges = false;
    lastSavedState = JSON.stringify(getCurrentPlanState());

    console.log(`シード ${seed} の計画データ復元完了`);
    console.log('復元後のチケットカウント:', ticketCounts);
    console.log('復元後の隠れたイベガチャ選択:', hiddenEventGachaSelections);

    return true;
  }

  /**
   * 変更検知用の状態チェック
   */
  function checkForChanges() {
    if (!isPlanMode) return;

    try {
      const currentState = JSON.stringify(getCurrentPlanState());
      const hasChanges = currentState !== lastSavedState;

      if (hasChanges !== hasUnsavedChanges) {
        hasUnsavedChanges = hasChanges;
        updateSaveButtonState();
      }
    } catch (error) {
      console.warn('状態チェックでエラーが発生しました:', error);
      // エラーが発生した場合は変更ありとして扱う
      if (!hasUnsavedChanges) {
        hasUnsavedChanges = true;
        updateSaveButtonState();
      }
    }
  }
  /**
   * 選択されたセルを復元
   */
  async function restoreSelectedCells(selectedCells) {
    return new Promise((resolve) => {
      selectedCells.forEach((cellInfo, index) => {
        // console.log(`セル復元 ${index}:`, cellInfo);

        const tables = document.querySelectorAll('table');
        const table = tables[cellInfo.tableIndex];
        if (!table) {
          console.warn(`テーブル ${cellInfo.tableIndex} が見つかりません`);
          return;
        }

        // ヘッダーから正しいカラムインデックスを取得
        const headers = Array.from(table.querySelectorAll('thead th'));
        const columnIndex = headers.findIndex((th) => th.textContent.trim() === cellInfo.columnName);
        if (columnIndex === -1) {
          console.warn(`カラム "${cellInfo.columnName}" が見つかりません`);
          return;
        }

        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // ペア番号と上下位置から対象行を特定
        let targetRow = null;

        // 右テーブルの場合は空行を考慮
        if (cellInfo.tableIndex === 1) {
          const nonEmptyRows = allRows.filter((r) => !r.querySelector('td[colspan]'));
          const targetPairIndex = (cellInfo.pairNumber - 1) * 2;
          const targetRowInPair = cellInfo.isUpperRow ? 0 : 1;
          const targetNonEmptyIndex = targetPairIndex + targetRowInPair;

          if (targetNonEmptyIndex < nonEmptyRows.length) {
            targetRow = nonEmptyRows[targetNonEmptyIndex];
          }
        } else {
          const targetRowIndex = (cellInfo.pairNumber - 1) * 2 + (cellInfo.isUpperRow ? 0 : 1);
          targetRow = allRows[targetRowIndex];
        }

        if (!targetRow) {
          console.warn(`対象行が見つかりません: ペア${cellInfo.pairNumber}, 上下=${cellInfo.isUpperRow}`);
          return;
        }

        // セルを特定（rowspan構造を考慮）
        let targetCell = null;
        const hasRowspanCell = targetRow.querySelector('td[rowspan]');

        if (hasRowspanCell) {
          const cells = Array.from(targetRow.querySelectorAll('td'));
          targetCell = cells[columnIndex];
        } else {
          const cells = Array.from(targetRow.querySelectorAll('td'));
          targetCell = cells[columnIndex - 1];
        }

        if (!targetCell) {
          console.warn(`セルが見つかりません: 行=${targetRow}, カラム=${columnIndex}`);
          return;
        }

        // セルを選択状態にする
        targetCell.classList.add('selected-td');
        targetCell.dataset.ticketType = cellInfo.ticketType;
        targetCell.dataset.planMode = 'true';

        // 対応する上のセルを選択（下の行の場合）
        if (!cellInfo.isUpperRow) {
          const tbody = targetRow.closest('tbody');
          const allTableRows = Array.from(tbody.querySelectorAll('tr'));
          const currentRowIndex = allTableRows.indexOf(targetRow);
          const upperRow = allTableRows[currentRowIndex - 1];

          if (upperRow) {
            const upperHasRowspan = upperRow.querySelector('td[rowspan]');
            let upperCell = null;

            if (upperHasRowspan) {
              const upperCells = Array.from(upperRow.querySelectorAll('td'));
              upperCell = upperCells[columnIndex];
            } else {
              const upperCells = Array.from(upperRow.querySelectorAll('td'));
              upperCell = upperCells[columnIndex - 1];
            }

            if (upperCell) {
              upperCell.classList.add('selected-td-top');
              upperCell.dataset.ticketType = cellInfo.ticketType;
              upperCell.dataset.planMode = 'true';
              //   console.log(`上セルも選択: "${upperCell.textContent.trim()}"`);
            }
          }
        }
      });

      resolve();
    });
  }

  /**
   * ページ離脱確認を無効化（自動保存なし）
   */
  function setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
      if (isPlanMode && hasUnsavedChanges) {
        // 自動保存は行わず、確認のみ
        e.preventDefault();
        e.returnValue = '未保存の計画データがあります。ページを離れますか？';
        return e.returnValue;
      }
    });
  }
  // ==================== ローディングUI機能 ====================

  /**
   * ローディングポップアップを表示
   */
  function showLoadingPopup(message = 'モード切り替え中...') {
    // 既存のローディングポップアップを削除
    const existingPopup = document.querySelector('.loading-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // ローディングポップアップコンテナ
    const loadingPopup = document.createElement('div');
    loadingPopup.className = 'loading-popup';
    loadingPopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;

    // ローディングカードを作成
    const loadingCard = document.createElement('div');
    loadingCard.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 2.5rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            min-width: 280px;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

    // グラデーションオーバーレイ
    const overlay = document.createElement('div');
    overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shimmer 2s infinite;
        `;

    // スピナー（CSS animation）
    const spinner = document.createElement('div');
    spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid #ffffff;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
        `;

    // メッセージテキスト
    const messageText = document.createElement('div');
    messageText.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        `;
    messageText.textContent = message;

    // サブテキスト
    const subText = document.createElement('div');
    subText.style.cssText = `
            font-size: 13px;
            opacity: 0.9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        `;
    subText.textContent = 'しばらくお待ちください...';

    // 要素を組み立て
    loadingCard.appendChild(overlay);
    loadingCard.appendChild(spinner);
    loadingCard.appendChild(messageText);
    loadingCard.appendChild(subText);
    loadingPopup.appendChild(loadingCard);

    // CSSアニメーションを追加（まだ存在しない場合）
    if (!document.getElementById('loading-animations')) {
      const style = document.createElement('style');
      style.id = 'loading-animations';
      style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.9); }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loadingPopup);
    return loadingPopup;
  }

  /**
   * ローディングポップアップを閉じる
   */
  function hideLoadingPopup() {
    const loadingPopup = document.querySelector('.loading-popup');
    if (loadingPopup) {
      // フェードアウトアニメーション
      loadingPopup.style.animation = 'fadeOut 0.3s ease-out forwards';

      setTimeout(() => {
        if (loadingPopup.parentNode) {
          loadingPopup.remove();
        }
      }, 300);
    }
  }

  // ==================== テーブルヘッダー固定機能 ====================

  /**
   * theadに固定スタイルを適用
   */
  function makeStickyHeaders() {
    const tables = document.querySelectorAll('.css-o2j9ze table');

    tables.forEach((table) => {
      const thead = table.querySelector('thead');
      if (!thead) return;

      // thead固定
      thead.style.position = 'sticky';
      thead.style.top = '0';
      thead.style.zIndex = '1000';
      thead.style.backgroundColor = '#2c3e50';
      thead.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

      // thセルのスタイル変更
      const thCells = thead.querySelectorAll('th');
      thCells.forEach((th, index) => {
        // 既存のクラススタイルに追加
        th.style.backgroundColor = '#2c3e50';
        th.style.color = 'white';
        th.style.fontWeight = '600';
        th.style.fontSize = '14px';
        th.style.padding = '14px 12px';
        th.style.textAlign = 'center';
        th.style.border = 'none';
        th.style.position = 'sticky';
        th.style.top = '0';
        th.style.zIndex = '1001';
        th.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        th.style.letterSpacing = '0.3px';
        th.style.transition = 'background-color 0.2s ease';

        // ホバー効果
        th.addEventListener('mouseenter', function () {
          this.style.backgroundColor = '#34495e';
        });

        th.addEventListener('mouseleave', function () {
          this.style.backgroundColor = '#2c3e50';
        });
      });

      // テーブル自体の設定
      table.style.borderSpacing = '0';
    });
  }

  // ==================== イベント監視・初期化 ====================

  /**
   * DOM変更を監視してテキスト置換と更新を実行
   */
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    let shouldUpdateHeader = false;

    for (const mutation of mutations) {
      const isOwnChange = Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.id === SPECIAL_ITEMS_CONTAINER_ID || node.id === SEED_SAVE_CONTAINER_ID)
      );

      if (!isOwnChange) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            replaceTextInNode(node);
            shouldUpdate = true;

            if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'TABLE' || node.querySelector('table'))) {
              shouldUpdateHeader = true;
            }
          }
        });
      }
    }

    if (shouldUpdate) {
      updateLinkColors();
      updateTextColors();
      //addIconsToSpecificItems();
      debouncedUpdate();
    }

    if (shouldUpdateHeader) {
      setTimeout(() => {
        makeStickyHeaders();
      }, 100);
    }
  });

  /**
   * ページ読み込み完了時の初期化処理
   */
  window.addEventListener('load', () => {
    replaceAll();
    const items = extractSpecialItems();
    displaySpecialItemsAboveTarget(items);

    setTimeout(() => {
      createSeedSaveUI();
      makeStickyHeaders();

      // URL変更検知とページ離脱確認を設定
      setupBeforeUnload();
    }, 500);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

  // ==================== CSS・UI要素 ====================

  // ポップアップ用CSSアニメーション
  if (!document.getElementById('star-popup-style')) {
    const style = document.createElement('style');
    style.id = 'star-popup-style';
    style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .star-popup {
                transform-origin: center top;
            }
        `;
    document.head.appendChild(style);
  }

  // 計画モード用CSSスタイル
  if (!document.getElementById('plan-mode-style')) {
    const style = document.createElement('style');
    style.id = 'plan-mode-style';
    style.textContent = `
        .selected-td {
            box-shadow:
                inset -3px 0 0 #228B22,
                inset 0 -3px 0 #228B22,
                inset 3px 0 0 #228B22 !important;
            background-color: #98fb98 !important;
            color: black !important;
            border-top: none !important;
        }
        .selected-td-top {
            box-shadow:
                inset 0 3px 0 #228B22,
                inset -3px 0 0 #228B22,
                inset 3px 0 0 #228B22 !important;
            background-color: #98fb98 !important;
            color: black !important;
            border-bottom: none !important;
        }
        .selected-td * {
            color: black !important;
        }
        .selected-td-top * {
            color: black !important;
        }
        .selected-event-td {
            box-shadow:
                inset -3px 0 0 #0000cd,
                inset 0 -3px 0 #0000cd,
                inset 3px 0 0 #0000cd !important;
            background-color: #00ffff !important;
            color: black !important;
            border-top: none !important;
        }
        .selected-event-td-top {
            box-shadow:
                inset 0 3px 0 #0000cd,
                inset -3px 0 0 #0000cd,
                inset 3px 0 0 #0000cd !important;
            background-color: #00ffff !important;
            color: #ff4500 !important;
            border-top: none !important;
            font-weight:600
        }
        .selected-event-td * {
            color: black !important;
        }
        .selected-event-td-top * {
            color: black !important;
        }
    `;
    document.head.appendChild(style);
  }

  const style = document.createElement('style');
  style.id = 'ampri-padding-style';
  style.textContent = `
    .css-51h3jl,
    .css-1dwlwmy,
    .css-15uto1k,
    .css-159psa,
    .css-fb12zs {
        padding: 2px 8px !important;
        min-width: 100px;
    }
    `;
  document.head.appendChild(style);

  // モード切り替えボタンを設置
  if (!document.getElementById('mode-toggle-btn')) {
    const modeButton = document.createElement('button');
    modeButton.id = 'mode-toggle-btn';
    modeButton.textContent = '通常モード';
    modeButton.style.cssText = `
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 10000;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            font-size: 14px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        `;
    modeButton.onclick = toggleMode;
    document.body.appendChild(modeButton);
  }
})();
