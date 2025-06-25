// ==UserScript==
// @name         godfat機能拡張スクリプト
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Tora
// @description  godfat機能拡張スクリプト
// @match        https://bc.godfat.org/*
// @grant        none
// ==/UserScript==
/*
 * ▼ 機能一覧
 * ① ガチャ間レア被り表示機能
 * ② 昇格枠表示機能
 * ③ シード保存機能（日付付き）
 * ④ 確定列最小化/表拡張機能
 * ⑤ シード保存機能
 * ⑥ テーブル巻き戻し機能
 *
 * ▼ 注意事項（必ずお読みください）：
 * ・本スクリプトは個人利用を目的として作成されたものです。
 * ・トラブルを避けるため、作成者無許可での再配布・転載・販売・第三者への共有は禁止とさせていただきます。
 * ・これらの注意書きを編集/削除しないでください。
 *
 * ▼ 更新履歴
 * v1.0 -   本スクリプト作成
 *
 */
(function() {
    'use strict';

    // ==================== 設定データ構造 ====================
const DEFAULT_CHARACTERS = [
  'ネコ武闘家', 'ネコマタドール', 'ネコ探査機', 'ネコボクサー', 'ネコバサミ',
  'ねこ陰陽師', 'サイキックネコ', 'ねこ人魚', 'ねこロッカー', 'ブリキネコ',
  'たけうまねこ', 'ねこガンマン', 'ネコ魔剣士', 'ネコアーチャー', 'ネコ魔女',
  'ネコシャーマン', 'ねこ占い師', 'ねこ僧侶', 'ねこ泥棒', 'ねこ海賊',
  'ねこファイター', 'ねこジュラ', 'ネコエステ', 'ネコ車輪', 'ネコホッピング'
];

    const GACHA_CONFIG = {
        normal: {
            name: '通常ガチャ:レア69.7%',
            threshold: 6969,
            characters: DEFAULT_CHARACTERS
        },
        wave: {
            name: '波動バスターズ:レア70%',
            threshold: 6999,
            characters: [...DEFAULT_CHARACTERS].reverse()
        },
        busters: {
            name: 'バスターズ(波動以外)/選抜祭/季節ガチャ:レア70%',
            threshold: 6999,
            characters: DEFAULT_CHARACTERS
        },
        festival: {
            name: '超ネコ/極ネコ/超極ネコ祭:レア64.7%',
            threshold: 6469,
            characters: DEFAULT_CHARACTERS
        },
        queen: {
            name: '女王祭:レア69.4%',
            threshold: 6939,
            characters: DEFAULT_CHARACTERS
        },
        king: {
            name: '国王祭:レア67.7%',
            threshold: 6769,
            characters: DEFAULT_CHARACTERS
        },
        outlet: {
            name: 'アウトレット:レア68%',
            threshold: 6799,
            characters: DEFAULT_CHARACTERS
        },
        sonic: {
            name: 'ソニック',
            threshold: 6999,
            characters: [
                ...Array(10).fill('ネコシャドウ'),
                ...DEFAULT_CHARACTERS
            ]
        },
        madoka: {
            name: 'まどマギ',
            threshold: 6999,
            characters: [
  'ネコ杏子', 'ネコ杏子', 'ネコ杏子', 'ネコ杏子',
  'ネコマミ', 'ネコマミ', 'ネコマミ', 'ネコマミ',
  'ネコさやか', 'ネコさやか', 'ネコさやか', 'ネコさやか',
  'ネコほむら', 'ネコほむら', 'ネコほむら', 'ネコほむら',
  'ネコまどか', 'ネコまどか', 'ネコまどか', 'ネコまどか',
  ...DEFAULT_CHARACTERS
]
        },
       bikkuriman: {
            name: 'ビックリマン',
            threshold: 6969,
            characters: DEFAULT_CHARACTERS
        },
          mercstoria: {
    name: 'メルスト',
    threshold: 6999,
    characters: ['セレス', 'ノノ', 'オルガ', 'ノルン', 'よいち', 'セラム', 'フウ']
  },
  metalSlug: {
    name: 'メタルスラッグ',
    threshold: 6999,
    characters: [
      'マルコ', 'マルコ', 'マルコ',
      'ターマ', 'ターマ', 'ターマ',
      'エリ', 'エリ', 'エリ',
      'フィオ', 'フィオ', 'フィオ',
      'マーズピープル', 'マーズピープル', 'マーズピープル',
      ...DEFAULT_CHARACTERS
    ]
  },
  hatsuneMiku: {
    name: '初音ミク',
    threshold: 6999,
    characters: [
      'ネコレン', 'ネコレン', 'ネコレン',
      'ネコリン', 'ネコリン', 'ネコリン',
      'ネコルカ', 'ネコルカ', 'ネコルカ',
      ...DEFAULT_CHARACTERS
    ]
  },
  keriHime: {
    name: '蹴り姫',
    threshold: 6999,
    characters: ['剣士', 'ウシ姫', 'チビガウ']
  },
  evangelion: {
    name: 'エヴァンゲリオン',
    threshold: 6999,
    characters: [
      'ネコカヲル', 'ネコカヲル', 'ネコカヲル',
      'ネコマリ', 'ネコマリ', 'ネコマリ',
      'ネコアスカ', 'ネコアスカ', 'ネコアスカ',
      'ネコレイ', 'ネコレイ', 'ネコレイ',
      ...DEFAULT_CHARACTERS
    ]
  },
                others: {
            name: '刃牙/マンボウ/消滅都市/剣心等:常設レア70%',
            threshold: 6999,
            characters: DEFAULT_CHARACTERS
        },
    };

    // ==================== 高速化用のキャッシュとバッチ処理 ====================
    class SeedProcessor {
        constructor() {
            this.cache = new Map();
            this.allSeeds = [];
            this.isProcessing = false;
        }

        // XORShift32の最適化版（インライン化）
        xorshift32(x) {
            x = (x ^ (x << 13)) >>> 0;
            x = (x ^ (x >>> 17)) >>> 0;
            x = (x ^ (x << 15)) >>> 0;
            return x;
        }

        // TypedArrayを使用した高速シード生成
        generateAllSeedsOptimized(currentSeed, count) {
            const cacheKey = `${currentSeed}_${count}`;
            if (this.cache.has(cacheKey)) {
                console.log('キャッシュからシードを取得');
                return this.cache.get(cacheKey);
            }

            const totalSteps = 2 * count + 1;
            console.time('シード生成時間');

            // Uint32Arrayを使用してメモリ効率を向上
            const seeds = new Uint32Array(totalSteps);
            let seed = currentSeed;

            // ループ展開で高速化
            let i = 0;
            const remainderStart = totalSteps - (totalSteps % 4);

            // 4つずつ処理（ループ展開）
            for (; i < remainderStart; i += 4) {
                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 1] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 2] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 3] = seed;
            }

            // 残りを処理
            for (; i < totalSteps; i++) {
                seed = this.xorshift32(seed);
                seeds[i] = seed;
            }

            // 通常の配列に変換
            this.allSeeds = Array.from(seeds);

            console.timeEnd('シード生成時間');

            // キャッシュに保存（最大5つまで）
            if (this.cache.size >= 5) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, this.allSeeds);

            return this.allSeeds;
        }

        // レア該当インデックスの高速取得
        getRareValidIndicesOptimized(threshold) {
            console.time('レア判定時間');

            const validIndices = [];
            const seeds = this.allSeeds;
            const length = seeds.length;

            // 元のロジックを維持（% 10000を使用）
            for (let i = 0; i < length; i++) {
                const last4Digits = seeds[i] % 10000;
                if (last4Digits <= threshold) {
                    validIndices.push(i);
                }
            }

            console.timeEnd('レア判定時間');
            console.log(`レア該当: ${validIndices.length}個`);

            return validIndices;
        }

        // Web Workers用の並列シード生成（利用可能な場合）
        async generateSeedsParallel(currentSeed, count) {
            const cacheKey = `${currentSeed}_${count}`;
            if (this.cache.has(cacheKey)) {
                console.log('キャッシュからシードを取得');
                return this.cache.get(cacheKey);
            }

            // Web Workers が利用可能かチェック
            if (typeof Worker === 'undefined') {
                return this.generateAllSeedsOptimized(currentSeed, count);
            }

            const totalSteps = 2 * count + 1;
            const workerCount = Math.min(4, Math.max(1, navigator.hardwareConcurrency || 2));
            const chunkSize = Math.ceil(totalSteps / workerCount);

            console.time('並列シード生成時間');
            console.log(`${workerCount}個のワーカーで並列処理開始`);

            try {
                const promises = [];

                for (let i = 0; i < workerCount; i++) {
                    const startIndex = i * chunkSize;
                    const endIndex = Math.min(startIndex + chunkSize, totalSteps);

                    if (startIndex >= totalSteps) break;

                    // 各チャンクの開始シードを計算
                    let chunkStartSeed = currentSeed;
                    for (let j = 0; j < startIndex; j++) {
                        chunkStartSeed = this.xorshift32(chunkStartSeed);
                    }

                    promises.push(this.createWorkerChunk(chunkStartSeed, endIndex - startIndex, startIndex));
                }

                const results = await Promise.all(promises);

                // 結果をマージ
                const finalSeeds = new Array(totalSteps);
                results.forEach(({ seeds, startIndex }) => {
                    seeds.forEach((seed, i) => {
                        finalSeeds[startIndex + i] = seed;
                    });
                });

                this.allSeeds = finalSeeds;

                console.timeEnd('並列シード生成時間');
                console.log(`並列処理で${this.allSeeds.length}個のシードを生成`);

                // キャッシュに保存
                if (this.cache.size >= 5) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
                this.cache.set(cacheKey, this.allSeeds);

                return this.allSeeds;

            } catch (error) {
                console.warn('並列処理に失敗、シーケンシャル処理にフォールバック:', error);
                return this.generateAllSeedsOptimized(currentSeed, count);
            }
        }

        // Worker チャンクを作成
        createWorkerChunk(startSeed, count, startIndex) {
            return new Promise((resolve, reject) => {
                const workerCode = `
                    function xorshift32(x) {
                        x = (x ^ (x << 13)) >>> 0;
                        x = (x ^ (x >>> 17)) >>> 0;
                        x = (x ^ (x << 15)) >>> 0;
                        return x;
                    }

                    self.onmessage = function(e) {
                        const { startSeed, count } = e.data;
                        const seeds = new Array(count);
                        let seed = startSeed;

                        for (let i = 0; i < count; i++) {
                            seed = xorshift32(seed);
                            seeds[i] = seed;
                        }

                        self.postMessage({ seeds });
                    };
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));

                worker.onmessage = (e) => {
                    resolve({ seeds: e.data.seeds, startIndex });
                    worker.terminate();
                    URL.revokeObjectURL(blob);
                };

                worker.onerror = (error) => {
                    reject(error);
                    worker.terminate();
                    URL.revokeObjectURL(blob);
                };

                worker.postMessage({ startSeed, count });
            });
        }
    }

// ==================== 逆算XORShift関数 ====================
function reverseXorshift32(seed, steps) {
    for (let i = 0; i < steps; i++) {
        seed = ((seed ^ (seed << 15)) >>> 0);
        seed = ((seed ^ (seed << 30)) >>> 0);
        seed = ((seed ^ (seed >>> 17)) >>> 0);
        seed = ((seed ^ (seed << 13)) >>> 0);
        seed = ((seed ^ (seed << 26)) >>> 0);
    }
    return seed >>> 0; // 32bit unsignedに変換
}

    // ==================== グローバル変数とインスタンス ====================
    const seedProcessor = new SeedProcessor();
    let collisionData = new Map();
    let currentGachaKey = 'normal';
    let compareGachaKey = 'normal';

    // ==================== ユーティリティ関数 ====================
    function getCurrentSeedFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const seedStr = urlParams.get('seed');
        return seedStr ? parseInt(seedStr, 10) : 0;
    }

    function getCountFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const countStr = urlParams.get('count');
        return countStr ? parseInt(countStr, 10) : 999;
    }

    function indexToTableNumber(index) {
        const isEven = index % 2 === 0;
        const tableNumber = Math.floor(index / 2) + 1;
        const suffix = isEven ? 'A' : 'B';
        return `${tableNumber}${suffix}`;
    }

    function getTableIndexes(tableNumber) {
        const match = tableNumber.match(/^(\d+)([AB])$/);
        if (!match) return null;

        const num = parseInt(match[1]);
        const suffix = match[2];

        if (suffix === 'A') {
            const baseIndex = (num - 1) * 2;
            return [baseIndex, baseIndex + 1];
        } else {
            const baseIndex = (num - 1) * 2 + 1;
            return [baseIndex, baseIndex + 1];
        }
    }

    function findConsecutiveTablePairs(tableNumbers) {
        const pairs = [];
        const sortedTables = [...tableNumbers].sort((a, b) => {
            const aMatch = a.match(/^(\d+)([AB])$/);
            const bMatch = b.match(/^(\d+)([AB])$/);
            const aNum = parseInt(aMatch[1]);
            const bNum = parseInt(bMatch[1]);
            const aSuffix = aMatch[2];
            const bSuffix = bMatch[2];

            if (aSuffix !== bSuffix) return aSuffix.localeCompare(bSuffix);
            return aNum - bNum;
        });

        for (let i = 0; i < sortedTables.length - 1; i++) {
            const current = sortedTables[i];
            const next = sortedTables[i + 1];

            const currentMatch = current.match(/^(\d+)([AB])$/);
            const nextMatch = next.match(/^(\d+)([AB])$/);

            if (currentMatch && nextMatch) {
                const currentNum = parseInt(currentMatch[1]);
                const nextNum = parseInt(nextMatch[1]);
                const currentSuffix = currentMatch[2];
                const nextSuffix = nextMatch[2];

                if (currentSuffix === nextSuffix && nextNum === currentNum + 1) {
                    pairs.push([current, next]);
                }
            }
        }

        return pairs;
    }

    // ==================== スロット詳細取得 ====================
    function getSlotDetails(tableNumber, gachaKey) {
        const indexes = getTableIndexes(tableNumber);
        if (!indexes || indexes[0] >= seedProcessor.allSeeds.length || indexes[1] >= seedProcessor.allSeeds.length) {
            return null;
        }

        const rareSeed = seedProcessor.allSeeds[indexes[0]];
        const charSeed = seedProcessor.allSeeds[indexes[1]];

        const config = GACHA_CONFIG[gachaKey];
        const rareValue = rareSeed % 10000;
        const isRare = rareValue <= config.threshold;

        const charIndex = charSeed % config.characters.length;
        const character = config.characters[charIndex];

        return {
            tableNumber,
            rareSeed,
            charSeed,
            rareValue,
            threshold: config.threshold,
            isRare,
            charIndex,
            character,
            gachaKey
        };
    }

    // ==================== 被り検出機能 ====================
    function detectCurrentGachaCollisions(consecutivePairs) {
        const collisions = [];
        collisionData.clear();

        consecutivePairs.forEach(([table1, table2]) => {
            const table1Details = getSlotDetails(table1, currentGachaKey);
            const table2Details = getSlotDetails(table2, currentGachaKey);

            if (!table1Details || !table2Details) return;

            if (table1Details.character === table2Details.character) {
                collisions.push([table1, table2]);

                const collisionInfo = {
                    currentTable: table1,
                    currentChar: table1Details.character,
                    collisionTable: table2,
                    collisionChar: table2Details.character,
                    type: '同一ガチャ内被り',
                    currentGachaName: GACHA_CONFIG[currentGachaKey].name,
                    collisionGachaName: GACHA_CONFIG[currentGachaKey].name
                };

                collisionData.set(table1, collisionInfo);
                collisionData.set(table2, {
                    ...collisionInfo,
                    currentTable: table2,
                    collisionTable: table1
                });
            }
        });

        return collisions;
    }

    function detectCrossGachaCollisions(consecutivePairs) {
        const collisions = [];

        consecutivePairs.forEach(([table1, table2]) => {
            const currentTable1Details = getSlotDetails(table1, currentGachaKey);
            const currentTable2Details = getSlotDetails(table2, currentGachaKey);
            const compareTable1Details = getSlotDetails(table1, compareGachaKey);
            const compareTable2Details = getSlotDetails(table2, compareGachaKey);


            if (!currentTable1Details || !currentTable2Details || !compareTable1Details || !compareTable2Details) return;
            if (currentTable1Details.character === compareTable2Details.character && currentTable1Details.isRare && compareTable2Details.isRare) {
                collisions.push(table1);

                const collisionInfo = {
                    currentTable: table1,
                    currentChar: currentTable1Details.character,
                    collisionTable: table2,
                    collisionChar: compareTable2Details.character,
                    type: 'クロスガチャ被り',
                    currentGachaName: GACHA_CONFIG[currentGachaKey].name,
                    collisionGachaName: GACHA_CONFIG[compareGachaKey].name
                };

                collisionData.set(table1, collisionInfo);
            }
            if (currentTable2Details.character === compareTable1Details.character && currentTable2Details.isRare && currentTable2Details.isRare) {
                collisions.push(table2);
                const collisionInfo = {
                    currentTable: table2,
                    currentChar: currentTable2Details.character,
                    collisionTable: table1,
                    collisionChar: compareTable1Details.character,
                    type: 'クロスガチャ被り',
                    currentGachaName: GACHA_CONFIG[currentGachaKey].name,
                    collisionGachaName: GACHA_CONFIG[compareGachaKey].name
                };
                collisionData.set(table2, collisionInfo);
            }
        });
        return collisions;
    }

// ==================== レアスコア判定機能 ====================
function getRareScoreCategory(rareScore) {
    const blueColor = '#4a90e2'; // 統一した青色

    if (rareScore > 8939 && rareScore <= 8969) {
        return {
            category: 'ultra_legend_double',
            message: '超激・伝説2倍で超激レアに昇格',
            color: blueColor
        };
    } else if (rareScore > 8969 && rareScore <= 9069) {
        return {
            category: 'ultra_cat_festival',
            message: '超極猫祭で超激レアに昇格',
            color: blueColor
        };
    } else if (rareScore > 9069 && rareScore <= 9469) {
        return {
            category: 'cat_festival',
            message: '超ネコ祭/極猫祭で超激レアに昇格',
            color: blueColor
        };
    } else if (rareScore > 9469 && rareScore <= 9499) {
        return {
            category: 'natural_ultra',
            message: '注：通常時から超激レア',
            color: blueColor
        };
    } else if (rareScore > 9939 && rareScore <= 9969) {
        return {
            category: 'legend_double',
            message: '伝説2倍で伝説レアに昇格',
            color: blueColor
        };
    }
    return null;
}

    // ==================== レアスコア判定データ保存 ====================
let rareScoreData = new Map();

function detectRareScorePromotions() {
    rareScoreData.clear();
    const count = getCountFromURL();

    for (let i = 0; i < seedProcessor.allSeeds.length; i += 1) {
        if (i >= seedProcessor.allSeeds.length) break;

        const rareSeed = seedProcessor.allSeeds[i];
        const rareScore = rareSeed % 10000;
        const category = getRareScoreCategory(rareScore);

        if (category) {
            const tableNumber = indexToTableNumber(i);

            const data = {
                tableNumber: tableNumber,
                rareSeed: rareSeed,
                rareScore: rareScore,
                category: category.category,
                message: category.message,
                color: category.color
            };

            rareScoreData.set(tableNumber, data);
        }
    }

    console.log(`レアスコア昇格対象: ${rareScoreData.size}個`);
}

function highlightRareScoreCells() {
    const allTds = document.querySelectorAll('td');
    let highlightedCount = 0;

    allTds.forEach(td => {
        const cellText = td.textContent.trim();
        const rareScoreInfo = rareScoreData.get(cellText);

        if (rareScoreInfo) {
            // 既存のレア被りハイライトがある場合は上書きしない
            if (td.style.backgroundColor !== 'rgb(255, 0, 0)' && td.style.backgroundColor !== '#ff0000') {
                td.style.backgroundColor = rareScoreInfo.color;
                td.style.color = '#ffffff';
                td.style.fontWeight = 'bold';
                td.style.cursor = 'pointer';
                addRareScoreClickEvents(td, cellText);
                highlightedCount++;
            }
        }
    });

    console.log(`${highlightedCount}個のレアスコア昇格セルをハイライト`);
}

function addRareScoreClickEvents(element, tableNumber) {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);

    newElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const data = rareScoreData.get(tableNumber);
        if (!data) return;

//        console.log(`テーブル: ${data.tableNumber}`)
//        console.log(`レアスコア: ${data.rareScore}`)

        const message = `${data.message}`;

        showModernPopup(message, newElement);
    });
}
// ==================== テーブル巻き戻し機能 ====================
function calculateRollbackSeed() {
    const rollbackInput = document.getElementById('rollback_steps');
    const resultSpan = document.getElementById('rollback_result');
    const rollbackLink = document.getElementById('rollback_link');

    if (!rollbackInput || !resultSpan || !rollbackLink) return;

    const rollbackSteps = parseInt(rollbackInput.value);
    if (isNaN(rollbackSteps) || rollbackSteps < 0) {
        resultSpan.textContent = '';
        rollbackLink.style.display = 'none';
        return;
    }

    const currentSeed = getCurrentSeedFromURL();
    const actualSteps = rollbackSteps * 2; // 1なら2ステップ、2なら4ステップ...
    const calculatedSeed = reverseXorshift32(currentSeed, actualSteps);

    resultSpan.textContent = calculatedSeed;
    rollbackLink.style.display = 'inline';

    // リンクのクリックイベント設定
    rollbackLink.onclick = function(e) {
        e.preventDefault();
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('seed', calculatedSeed);
        window.location.href = currentUrl.toString();
    };
}

    // ==================== UI生成機能 ====================
    function createGachaSelectOptions() {
        return Object.entries(GACHA_CONFIG)
            .map(([key, config]) => `<option value="${key}">${config.name}</option>`)
            .join('');
    }

// ==================== 拡張機能UI ====================
function addGachaSelectionUI() {
    const formDiv = document.querySelector('div.form');
    if (!formDiv) {
        console.log('form divが見つかりません');
        return;
    }

    const gachaSelectionDiv = document.createElement('div');
    gachaSelectionDiv.style.cssText = `
        margin-top: 10px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
        max-width: 1068px
    `;

    const options = createGachaSelectOptions();
    gachaSelectionDiv.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 8px;">拡張機能</div>

        <div style="margin-bottom: 10px; ">
            <div style="font-weight: bold; margin-bottom: 6px; color: #333; font-size: 16px; ">テーブル巻き戻し</div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label for="rollback_steps" style="font-weight: bold; white-space: nowrap; font-size: 16px; margin:0px">巻き戻し回数:</label>
                    <input type="number" id="rollback_steps" min="0" max="1000" style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;margin:0px" placeholder="0">
                    <button id="calculate_rollback" style="background: rgb(0, 123, 255); margin-bottom:0px; color: white; border: none; border-radius: 6px; padding: 0px 16px; font-size: 12px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">算出</button>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: bold; font-size: 16px;">算出シード:</span>
                    <span id="rollback_result" style="font-family: monospace; font-weight: bold; color: #2c3e50; background: #ecf0f1; padding: 4px 8px; border-radius: 4px; min-width: 80px; display: inline-block; font-size: 16px;"></span>
                    <a href="#" id="rollback_link" style="display: none; color: #007bff; text-decoration: none; font-weight: bold; padding: 4px 10px; background: #e8f4f8; border-radius: 4px; border: 1px solid #007bff; transition: all 0.2s; font-size: 13px;     padding: 0px 8px;">遷移</a>
                </div>
            </div>
        </div>

<div style="margin-bottom: 10px;">
  <div style="display: flex; align-items: center;  flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
    <div style="font-weight: bold; color: #333; font-size: 16px;">シード保存</div>
    <button id="save_seed_button" style="background: rgb(0, 123, 255); color: white; border: none; border-radius: 6px; margin:0px; padding: 0px 16px; font-size: 12px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      現在のシードを保存
    </button>
  </div>

  <div style="font-weight: bold; font-size: 14px; color: #333; margin-bottom: 6px;">
    保存済みのシード (最大10件):
  </div>
  <div id="seed-list" style="display: flex; flex-wrap: wrap; gap: 8px;">
    <span style="color: #666; font-style: italic; font-size: 14px;">保存済みのシードはありません</span>
  </div>
</div>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1; min-width: 200px;">
                <label for="current_gacha_select" style="display: block; margin-bottom: 5px; font-weight: bold; font-size:16px">現在のガチャ:</label>
                <select id="current_gacha_select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    ${options}
                </select>
            </div>
            <div style="flex: 1; min-width: 200px;">
                <label for="compare_gacha_select" style="display: block; margin-bottom: 5px; font-weight: bold; font-size:16px">被り確認用ガチャ:</label>
                <select id="compare_gacha_select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    ${options}
                </select>
            </div>
        </div>

        <div style="margin-bottom: 15px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9;">
            <div id="color_legend_content" style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 14px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>シード計算中...</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 15px; display: flex; gap: 20px;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" id="hide_confirmed_columns" style="cursor: pointer;">
                <span style="font-weight: bold; font-size:16px">確定列を最小化</span>
            </label>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" id="expand_table" style="cursor: pointer;">
                <span style="font-weight: bold; font-size:16px">表を拡張</span>
            </label>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #calculate_rollback:hover, #save_seed_button:hover {
                background: rgb(0, 86, 179) !important;
            }
            #rollback_link:hover {
                background: #d4edff !important;
                border-color: #0056b3 !important;
            }
        </style>
    `;

    formDiv.parentNode.insertBefore(gachaSelectionDiv, formDiv.nextSibling);

    // イベントリスナー追加
    document.getElementById('current_gacha_select').addEventListener('change', updateGachaSettings);
    document.getElementById('compare_gacha_select').addEventListener('change', updateGachaSettings);
    document.getElementById('hide_confirmed_columns').addEventListener('change', toggleConfirmedColumns);
    document.getElementById('expand_table').addEventListener('change', toggleTableExpansion);
    document.getElementById('calculate_rollback').addEventListener('click', calculateRollbackSeed);
    document.getElementById('save_seed_button').addEventListener('click', handleSaveSeed);

    // 初期シードリストを更新
    const savedSeeds = getSavedSeeds();
    const seedList = document.getElementById('seed-list');
    updateSeedList(seedList, savedSeeds);
}

function toggleConfirmedColumns() {
    const isHidden = document.getElementById('hide_confirmed_columns').checked;
    const tbody = document.querySelector('tbody');

    if (!tbody) {
        console.log('tbodyが見つかりません');
        return;
    }

    const rows = tbody.querySelectorAll('tr');

    if (rows.length > 0) {
        const firstRow = rows[0];
        const th3 = firstRow.children[2]; // 3番目のth
        const th5 = firstRow.children[4]; // 5番目のth

        if (isHidden) {
            // 3番目と5番目のthを空白文字に変更
            if (th3) th3.textContent = '';
            if (th5) th5.textContent = '';
        } else {
            // 元のテキストに戻す（必要に応じて元の値を設定）
            if (th3) th3.textContent = th3.getAttribute('data-original-text') || 'Guaranteed';
            if (th5) th5.textContent = th5.getAttribute('data-original-text') || 'Alt. guaranteed';
        }
    }

}
function toggleTableExpansion() {
    const isExpanded = document.getElementById('expand_table').checked;
    const tbody = document.querySelector('tbody');

    if (!tbody) {
        console.log('tbodyが見つかりません');
        return;
    }

    const rows = tbody.querySelectorAll('tr');

    if (rows.length > 0) {
        const firstRow = rows[0];
        const td2 = firstRow.children[1]; // 2番目のtd
        const td3 = firstRow.children[2]; // 3番目のtd
        const td4 = firstRow.children[3]; // 4番目のtd
        const td5 = firstRow.children[4]; // 5番目のtd

        if (isExpanded) {
            // min-widthを設定
            if (td2) td2.style.minWidth = '150px';
            if (td3) td3.style.minWidth = '250px';
            if (td4) td4.style.minWidth = '150px';
            if (td5) td5.style.minWidth = '250px';
        } else {
            // min-widthを元に戻す
            if (td2) td2.style.minWidth = '';
            if (td3) td3.style.minWidth = '';
            if (td4) td4.style.minWidth = '';
            if (td5) td5.style.minWidth = '';
        }
    }

}
    function updateGachaSettings() {
        const currentGachaSelect = document.getElementById('current_gacha_select');
        const compareGachaSelect = document.getElementById('compare_gacha_select');

        currentGachaKey = currentGachaSelect.value;
        compareGachaKey = compareGachaSelect.value;

        resetHighlights();
        highlightRareCollisions(); // asyncを削除（呼び出し側で対応）
    }
// ==================== 色の説明を更新する関数 ====================
function updateColorLegend() {
    const colorLegendContent = document.getElementById('color_legend_content');
    if (!colorLegendContent) return;

    colorLegendContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 20px; height: 20px; background-color: #ff0000; border-radius: 3px; border: 1px solid #ccc;"></div>
            <span>レア被り</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 20px; height: 20px; background-color: #4a90e2; border-radius: 3px; border: 1px solid #ccc;"></div>
            <span>レアスコア昇格対象</span>
        </div>
    `;
}

    // ==================== ハイライト機能 ====================
async function highlightRareCollisions() {
    console.time('全体処理時間');

    // 並列シード生成を試行、失敗時は従来方式
    const currentSeed = getCurrentSeedFromURL();
    const count = getCountFromURL();

    try {
        await seedProcessor.generateSeedsParallel(currentSeed, count);
    } catch (error) {
        console.warn('並列処理失敗、従来方式で実行:', error);
        seedProcessor.generateAllSeedsOptimized(currentSeed, count);
    }

    // レア該当インデックス取得：大きい方を取得して後でどちらもレアか確認
    const threshold = Math.max(
        GACHA_CONFIG[currentGachaKey].threshold,
        GACHA_CONFIG[compareGachaKey].threshold
    );
    const rareValidIndices = seedProcessor.getRareValidIndicesOptimized(threshold);

    // テーブル番号変換
    const tableNumbers = rareValidIndices.map(index => indexToTableNumber(index));
    const consecutivePairs = findConsecutiveTablePairs(tableNumbers);

    // 被り検出
    const currentGachaCollisions = detectCurrentGachaCollisions(consecutivePairs);
    let crossGachaCollisions = [];
    if (currentGachaKey !== compareGachaKey) {
        crossGachaCollisions = detectCrossGachaCollisions(consecutivePairs);
    }

    const allCollisions = [...currentGachaCollisions, ...crossGachaCollisions];

    // レアスコア判定を追加
    detectRareScorePromotions();

    // ハイライト実行（レア被りを先に、レアスコアを後に）
    highlightCollisionCells(allCollisions);
    highlightRareScoreCells();

    // 色の説明を更新
    updateColorLegend();

    console.timeEnd('全体処理時間');
}


    function highlightCollisionCells(collisions) {
        const allTds = document.querySelectorAll('td');
        let highlightedCount = 0;
        const collisionTables = collisions.flat();

        allTds.forEach(td => {
            const cellText = td.textContent.trim();
            if (collisionTables.includes(cellText)) {
                td.style.backgroundColor = '#ff0000';
                td.style.color = '#ffffff';
                td.style.fontWeight = 'bold';
                td.style.cursor = 'pointer';
                addClickEvents(td, cellText);
                highlightedCount++;
            }
        });

    }

function resetHighlights() {
    const existingModal = document.getElementById('detail-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const allTds = document.querySelectorAll('td');
    allTds.forEach(td => {
        // レア被りハイライトとレアスコアハイライト（統一した青色）をリセット
        if (td.style.backgroundColor === 'rgb(255, 0, 0)' ||
            td.style.backgroundColor === '#ff0000' ||
            td.style.backgroundColor === '#4a90e2' ||
            td.style.backgroundColor === 'rgb(74, 144, 226)') {
            const newTd = td.cloneNode(true);
            newTd.style.backgroundColor = '';
            newTd.style.color = '';
            newTd.style.fontWeight = '';
            newTd.style.cursor = '';
            td.parentNode.replaceChild(newTd, td);
        }
    });

    collisionData.clear();
    rareScoreData.clear();
}
// ==================== シード保存機能 ====================
/**
 * ローカルストレージから保存済みシードを取得
 */
function getSavedSeeds() {
    const saved = localStorage.getItem('nyanko-saved-seeds');
    return saved ? JSON.parse(saved) : [];
}

    function handleSaveSeed() {
    const currentSeed = getCurrentSeedFromURL();
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
 * 指定したシードのURLに遷移
 */
function navigateToSeed(seed) {
    const url = new URL(window.location);
    // 日時部分を削除してシードのみ抽出
    const cleanSeed = seed.replace(/\(.*?\)/g, '');
    url.searchParams.set('seed', cleanSeed);
    window.location.href = url.toString();
}

// ==================== シード保存UI機能 ====================
/**
 * シード保存・管理UIを作成
 */
function createSeedSaveUI() {
    const formDiv = document.querySelector('div.form');
    if (!formDiv) {
        console.log('form divが見つかりません');
        return;
    }

    const existingContainer = document.getElementById('seed-save-container');
    if (existingContainer) {
        const seedList = existingContainer.querySelector('#seed-list');
        if (seedList) {
            const savedSeeds = getSavedSeeds();
            updateSeedList(seedList, savedSeeds);
        }
        return;
    }

    const seedContainer = document.createElement('div');
    seedContainer.id = 'seed-save-container';
    seedContainer.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
    `;

    // 保存ボタン
    const saveButton = document.createElement('button');
    saveButton.textContent = '現在のシードを保存';
    saveButton.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        font-family: inherit;
        margin-bottom: 10px;
        display: block;
        font-weight: bold;
    `;

    saveButton.onclick = () => {
        const currentSeed = getCurrentSeedFromURL();
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
        flex-direction: column;
        gap: 8px;
    `;

    const seedListLabel = document.createElement('div');
    seedListLabel.style.cssText = `
        font-weight: bold;
        font-size: 14px;
        color: #333;
    `;
    seedListLabel.textContent = '保存済みのシード (最大10件):';

    const seedList = document.createElement('div');
    seedList.id = 'seed-list';
    seedList.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    `;

    const savedSeeds = getSavedSeeds();
    updateSeedList(seedList, savedSeeds);

    seedListRow.appendChild(seedListLabel);
    seedListRow.appendChild(seedList);
    seedContainer.appendChild(saveButton);
    seedContainer.appendChild(seedListRow);

    // ガチャ選択UIの後に挿入
    const gachaDiv = formDiv.nextSibling;
    if (gachaDiv) {
        gachaDiv.parentNode.insertBefore(seedContainer, gachaDiv.nextSibling);
    } else {
        formDiv.parentNode.insertBefore(seedContainer, formDiv.nextSibling);
    }
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
            padding: 2px 6px;
            margin: 0px;
        `;

        const seedButton = document.createElement('button');
        seedButton.textContent = seed;
        seedButton.style.cssText = `
            background: transparent;
            border: none;
            padding: 4px 12px;
            margin: 0px;
            font-size: 15px;
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
            margin: 0px;
            padding:0px;
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
    // ==================== ポップアップ機能 ====================
    function showModernPopup(message, targetElement) {
        const existingPopup = document.querySelector('.star-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

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

        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            padding-right: 24px;
            font-weight: 500;
        `;
        messageContainer.textContent = message;

        popup.appendChild(closeButton);
        popup.appendChild(messageContainer);
        document.body.appendChild(popup);

        // 位置計算
        const targetRect = targetElement.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        let top = targetRect.top - popupRect.height - 10;
        let left = targetRect.left + targetRect.width / 2 - popupRect.width / 2;

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

        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.remove();
            }
        }, 5000);

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

    function addClickEvents(element, tableNumber) {
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);

        newElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const data = collisionData.get(tableNumber);
            if (!data) return;

            const message = `選択: ${data.currentTable} (${data.currentGachaName})
被り: ${data.collisionTable} (${data.collisionGachaName})
キャラクター: ${data.collisionChar}`;

            showModernPopup(message, newElement);
        });
    }

    // ==================== 初期化 ====================
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                addGachaSelectionUI(); // UIを先に表示
                highlightRareCollisions(); // 後で計算実行
            }, 100);
        });
    } else {
        setTimeout(() => {
            addGachaSelectionUI(); // UIを先に表示
            highlightRareCollisions(); // 後で計算実行
        }, 100);
    }
}

    init();

})();