document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // 1. 核心資料結構與初始化 (已更新 cardRules 和 elements)
    // =========================================================
    const calculator = {
        
        // 🚨 牌庫規則定義 (新增 fixedOnly 規則)
        cardRules: {
            chance: [
                { id: 'C1', fixedCost: 10, percentage: 0.10}, 
                { id: 'C2', fixedCost: 15, percentage: 0.08}, 
                { id: 'C3', fixedCost: 20, percentage: 0.05}, 
                { id: 'C4', fixedCost: 25, percentage: 0.04}, 
                { id: 'C5', fixedCost: 30, percentage: 0.03}, 
                { id: 'C6', fixedCost: 5, percentage: 0.02},   
                { id: 'C7', fixedCost: 5, percentage: 0.01},   
                { id: 'C8', fixedCost: 1, percentage: 0.005},  
                { id: 'C9', fixedCost: 1, percentage: 0.002}   
            ],
            threat: [
                { id: 'T1', fixedCost: 50, percentage: -0.15}, 
                { id: 'T2', fixedCost: 40, percentage: -0.12}, 
                { id: 'T3', fixedCost: 30, percentage: -0.10}, 
                { id: 'T4', fixedCost: 25, percentage: -0.08}, 
                { id: 'T5', fixedCost: 20, percentage: -0.06}, 
                { id: 'T6', fixedCost: 15, percentage: -0.05}, 
                { id: 'T7', fixedCost: 10, percentage: -0.04}, 
                { id: 'T8', fixedCost: 5, percentage: -0.03},  
                { id: 'T9', fixedCost: 1, percentage: -0.02}   
            ],
            // 新增純固定成本區塊
            fixedOnly: [
                { id: 'F1', fixedCost: 10}, 
                { id: 'F2', fixedCost: 15}, 
                { id: 'F3', fixedCost: 20}, 
                { id: 'F4', fixedCost: 25}, 
                { id: 'F5', fixedCost: 30}, 
                { id: 'F6', fixedCost: 5},   
                { id: 'F7', fixedCost: 5},   
                { id: 'F8', fixedCost: 1},  
                { id: 'F9', fixedCost: 1} 
            ]
        },

        // 玩家資金: 儲存玩家當前的資金狀態
        playerFunds: {
            'A': 300,
            'B': 220,
            'C': 200,
            'D': 80
        },
        // 當前被選中的玩家 (用於多選)
        selectedPlayers: [],
        // 遊戲狀態
        currentRound: 0,
        totalRounds: 20,
        playersOperatedThisRound: 0, 
        totalPlayers: 4,
        
        // DOM 元素引用 (新增兩個選單和按鈕)
        elements: {
            roundDisplay: document.getElementById('current-round'),
            playerButtons: document.querySelectorAll('#player-select-buttons button'),
            chanceSelect: document.getElementById('chance-card-select'),
            threatSelect: document.getElementById('threat-card-select'),
            fixedOnlyChanceSelect: document.getElementById('fixed-only-chance-select'), // 新增
            fixedOnlyThreatSelect: document.getElementById('fixed-only-threat-select'),   // 新增
            restartButton: document.getElementById('restart-button'),
            scoreHistoryBody: document.querySelector('#score-history-table tbody'),
            finalResultTitle: document.getElementById('final-result-title'),
            finalResultsDiv: document.getElementById('final-results')
        },

        /**
         * 初始化應用程式：設定初始狀態和事件監聽
         */
        init() {
            this.populateCardOptions(); 
            this.renderScores();
            this.renderRound();
            this.setupEventListeners();
        },
        
        /**
         * 根據 cardRules 動態填充下拉式選單 (已更新以填充 fixedOnly 選項)
         */
        populateCardOptions() {
            // Helper 函數：用於創建選項
            const createOption = (id, text, selectElement) => {
                const option = document.createElement('option');
                option.value = id; 
                option.textContent = text;
                selectElement.appendChild(option);
            };

            // 1. 處理機會牌 (固定投入 + 獲益比例)
            this.cardRules.chance.forEach(card => {
                const percentageDisplay = (card.percentage * 100).toFixed(1); 
                const text = `${card.id} (投入: $${card.fixedCost} / 獲益: +${percentageDisplay}%)`;
                createOption(card.id, text, this.elements.chanceSelect);
            });

            // 2. 處理威脅牌 (固定投入 + 損失比例)
            this.cardRules.threat.forEach(card => {
                const percentageDisplay = (Math.abs(card.percentage) * 100).toFixed(1);
                const text = `${card.id} (投入: $${card.fixedCost} / 損失: -${percentageDisplay}%)`;
                createOption(card.id, text, this.elements.threatSelect);
            });

            // 3. 處理固定成本牌 - 機會服務費 (僅投入)
            this.cardRules.fixedOnly.forEach(card => {
                const text = `${card.id} (投入: $${card.fixedCost} / 獲益: $0)`;
                createOption(card.id, text, this.elements.fixedOnlyChanceSelect);
            });

            // 4. 處理固定成本牌 - 威脅服務費 (僅投入)
            this.cardRules.fixedOnly.forEach(card => {
                const text = `${card.id} (投入: $${card.fixedCost} / 損失: $0)`;
                createOption(card.id, text, this.elements.fixedOnlyThreatSelect);
            });
        },


        // =========================================================
        // 2. 介面渲染與更新 (保持不變)
        // =========================================================
        
        renderScores() {
            for (const player in this.playerFunds) {
                const scoreSpan = document.getElementById(`score-${player}`);
                if (scoreSpan) {
                    const displayScore = Math.max(0, this.playerFunds[player]);
                    scoreSpan.textContent = `$${displayScore.toLocaleString()}`;
                    
                    if (this.playerFunds[player] < 0) {
                         scoreSpan.style.color = 'red';
                    } else {
                         scoreSpan.style.color = '#007bff'; 
                    }
                }
            }
        },

        renderRound() {
            this.elements.roundDisplay.textContent = `目前輪次：第 ${this.currentRound/2} 輪 `; //因為每輪只有兩種結果，所以計算兩次算一輪
        },

        addHistoryEntry() {
            if (this.currentRound > this.totalRounds) {
                this.endGame();
                return;
            }
            
            const newRow = this.elements.scoreHistoryBody.insertRow();
            
            const cellRound = newRow.insertCell();
            cellRound.textContent = `第 ${this.currentRound} 輪`;

            for (const player of ['A', 'B', 'C', 'D']) {
                const currentScore = this.playerFunds[player];
                const cellScore = newRow.insertCell();
                cellScore.textContent = `$${currentScore.toLocaleString()}`;
                if (currentScore < 0) {
                     cellScore.style.backgroundColor = '#ffe3e3'; 
                }
            }

            this.currentRound++;
            this.renderRound();
            
            if (this.currentRound > this.totalRounds) {
                this.endGame();
            }
        },
        
        // =========================================================
        // 3. 事件處理與遊戲邏輯 (已更新 setupEventListeners 和 executeCard)
        // =========================================================

        /**
         * 設定所有按鈕和選單的事件監聽 (新增兩個執行按鈕)
         */
        setupEventListeners() {
            // 監聽所有玩家選擇按鈕 (Stage 1)
            this.elements.playerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const player = button.dataset.player;
                    this.togglePlayerSelection(player, button); 
                });
            });

            // 監聽執行計算按鈕 (Stage 2)
            document.getElementById('execute-chance').addEventListener('click', () => {
                this.executeCard('chance', 'chance-card-select');
            });
            
            document.getElementById('execute-threat').addEventListener('click', () => {
                this.executeCard('threat', 'threat-card-select');
            });
            
            // 監聽新增的執行按鈕 - 機會服務費
            document.getElementById('execute-fixed-only-chance').addEventListener('click', () => {
                this.executeCard('fixedOnly', 'fixed-only-chance-select', 'chance');
            });
            
            // 監聽新增的執行按鈕 - 威脅服務費
            document.getElementById('execute-fixed-only-threat').addEventListener('click', () => {
                this.executeCard('fixedOnly', 'fixed-only-threat-select', 'threat');
            });

            // 監聽手動遊戲結束按鈕
            document.getElementById('end-game-button').addEventListener('click', () => {
                this.endGame();
            });
            
            // 監聽重新開始按鈕
            this.elements.restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        },

        /**
         * 切換玩家的選中狀態 (用於多選)
         */
        togglePlayerSelection(player, button) {
             const index = this.selectedPlayers.indexOf(player);
             if (index === -1) {
                 this.selectedPlayers.push(player);
                 button.classList.add('selected');
             } else {
                 this.selectedPlayers.splice(index, 1);
                 button.classList.remove('selected');
             }
        },

        /**
         * 執行牌號計算，並更新分數 (邏輯更新以處理 fixedOnly)
         * @param {string} cardType - 'chance', 'threat', 或 'fixedOnly'
         * @param {string} selectId - 對應下拉選單的 ID
         * @param {string} [fixedOnlyDirection] - 僅當 cardType 為 'fixedOnly' 時，指定是 'chance' (獲益) 還是 'threat' (損失)
         */
        executeCard(cardType, selectId, fixedOnlyDirection = null) {
            // 1. 檢查是否選中玩家
            if (this.selectedPlayers.length === 0) {
                alert('錯誤：請先在步驟 1 選擇至少一位參與交易的玩家！');
                return;
            }

            // 2. 獲取選中的牌號 ID 和選單元素
            const selectElement = document.getElementById(selectId);
            const cardId = selectElement.value; 

            // 3. 檢查是否選中牌號
            if (cardId === "0") { 
                alert('錯誤：請在下拉選單中選擇一張牌。');
                return;
            }
            
            // 4. 根據 ID 找到牌的規則
            const cardRule = this.cardRules[cardType].find(card => card.id === cardId);

            if (!cardRule) {
                alert('錯誤：找不到對應的牌號規則。');
                return;
            }

            const fixedCost = cardRule.fixedCost; 
            let percentage = cardRule.percentage || 0; // 如果沒有 percentage 屬性，則為 0

            // 處理 fixedOnly 區塊：雖然牌組一樣，但執行的費用方向不同
            // fixedOnly 牌組的 percentage 始終為 0，因為它們是純固定成本/收益
            // fixedOnlyDirection 僅用於區分是「機會服務費」(可能暗示未來收益，但當前只付費)
            // 還是「威脅服務費」(純粹的損失)
            if (cardType === 'fixedOnly') { 
                percentage = 0; // 確保固定成本牌沒有比例計算
            }


            // 5. 執行計算
            this.selectedPlayers.forEach(player => {
                const currentFund = this.playerFunds[player];
                
                let fundChange;
                
                if (cardType === 'fixedOnly') {
                    // 固定成本區塊：只扣除固定成本 (因為沒有比例增減，所以 percentage = 0)
                    // 服務費：淨變動 = -固定投入
                    fundChange = -fixedCost;
                } else {
                    // 機會/威脅牌區塊：
                    // 新的資金 = (當前資金 - 固定投入) * (1 + 比例)
                    // 注意：威脅牌的 percentage 是負數，所以 (1 + (-0.15)) 會變成 (1 - 0.15)
                    const newFund = (currentFund - fixedCost) * (1 + percentage);
                    // 資金變動 = 新資金 - 當前資金
                    fundChange = Math.round(newFund - currentFund);
                }
                
                // 更新資金
                this.playerFunds[player] += fundChange;
            });

            // 6. 更新介面顯示、清理狀態、新增紀錄
            this.renderScores();
            this.clearSelections(selectElement);
            this.addHistoryEntry();
        },
        
        /**
         * 清理選中的玩家按鈕狀態和下拉選單 (修正：現在要清理四個選單)
         */
        clearSelections() {
            // 清理玩家選中狀態
            this.elements.playerButtons.forEach(button => {
                button.classList.remove('selected');
            });
            this.selectedPlayers = [];

            // 重置所有四個下拉選單
            this.elements.chanceSelect.value = "0";
            this.elements.threatSelect.value = "0";
            this.elements.fixedOnlyChanceSelect.value = "0";
            this.elements.fixedOnlyThreatSelect.value = "0";
        },

        // =========================================================
        // 4. 遊戲控制 (保持不變)
        // =========================================================
        
        endGame() {
            document.getElementById('game-controls').style.display = 'none';
            this.elements.roundDisplay.style.display = 'none';

            if (this.elements.finalResultTitle) {
                 this.elements.finalResultTitle.style.display = 'block';
            }
            if (this.elements.finalResultsDiv) {
                 this.elements.finalResultsDiv.style.display = 'block';
            }

            const finalScores = Object.keys(this.playerFunds).map(player => ({
                name: `玩家 ${player}`,
                score: this.playerFunds[player]
            }));

            finalScores.sort((a, b) => b.score - a.score);

            let resultHTML = '<ol>';
            finalScores.forEach((p, index) => {
                const displayScore = Math.max(0, p.score);
                resultHTML += `<li>${p.name}: 最終資金 $${displayScore.toLocaleString()} ${p.score < 0 ? ' (已破產)' : ''}</li>`;
            });
            resultHTML += '</ol>';
            
            if (this.elements.finalResultsDiv) {
                this.elements.finalResultsDiv.innerHTML = resultHTML;
            }
            
            alert(' 遊戲結束！請查看最終結果。');
        },
        
        restartGame() {
            if (!confirm("確定要重新開始遊戲嗎？所有紀錄將會被清除。")) {
                return;
            }
            
            this.playerFunds = { 'A': 300, 'B': 220, 'C': 200, 'D': 80 };
            this.currentRound = 1;
            this.selectedPlayers = [];

            this.elements.scoreHistoryBody.innerHTML = `
                <tr id="initial-scores">
                    <td>初始資金</td>
                    <td>$300</td>
                    <td>$220</td>
                    <td>$200</td>
                    <td>$80</td>
                </tr>
            `; 
            
            this.renderScores();
            this.renderRound();
            this.clearSelections(); // 現在直接呼叫 clearSelections() 清理所有選單

            document.getElementById('game-controls').style.display = 'block';
            this.elements.roundDisplay.style.display = 'block';
            if (this.elements.finalResultTitle) {
                this.elements.finalResultTitle.style.display = 'none';
            }
            if (this.elements.finalResultsDiv) {
                this.elements.finalResultsDiv.style.display = 'none';
            }
            
            alert('遊戲已重置！');
        }
    };

    // 啟動應用程式
    calculator.init();
});