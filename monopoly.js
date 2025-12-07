document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // 1. 核心資料結構與初始化
    // =========================================================
    const calculator = {
        
        // 🚨 牌庫規則定義 (新增 fixedOnly 規則)
        cardRules: {
            chance: [
                { id: 'C1', fixedCost: 5, percentage: 0.15}, 
                { id: 'C2', fixedCost: 5, percentage: 0.1}, 
                { id: 'C3', fixedCost: 5, percentage: 0.15}, 
                { id: 'C4', fixedCost: 5, percentage: 0.1}, 
                { id: 'C5', fixedCost: 5, percentage: 0.15}, 
                { id: 'C6', fixedCost: 10, percentage: 0.2},   
                { id: 'C7', fixedCost: 10, percentage: 0.15},   
                { id: 'C8', fixedCost: 10, percentage: 0.25},  
                { id: 'C9', fixedCost: 10, percentage: 0.2}   
            ],
            threat: [
                { id: 'T1', fixedCost: 5, percentage: -0.05}, 
                { id: 'T2', fixedCost: 5, percentage: -0.05}, 
                { id: 'T3', fixedCost: 5, percentage: -0.10}, 
                { id: 'T4', fixedCost: 5, percentage: -0.05}, 
                { id: 'T5', fixedCost: 5, percentage: -0.10}, 
                { id: 'T6', fixedCost: 10, percentage: -0.10}, 
                { id: 'T7', fixedCost: 10, percentage: -0.10}, 
                { id: 'T8', fixedCost: 10, percentage: -0.10},  
                { id: 'T9', fixedCost: 10, percentage: -0.10}   
            ],
        },

        // 玩家資金: 儲存玩家當前的資金狀態
        playerFunds: {
            'A': 300,
            'B': 220,
            'C': 200,
            'D': 150
        },
        // 初始資金的25%閾值
        winningThresholds: {},
        // 當前被選中的玩家 (用於多選)
        selectedPlayers: [],
        // 遊戲狀態
        currentRound: 1,
        totalRounds: 100,
        playersOperatedThisRound: 0, 
        totalPlayers: 4,
        
        // DOM 元素引用 (已更新以匹配新版 HTML)
        elements: {
            roundDisplay: document.getElementById('current-round'),
            playerButtons: document.querySelectorAll('#player-select-buttons button'),
            cardSelect: document.getElementById('card-select'),
            playerOutcomeSettings: document.getElementById('player-outcome-settings'),
            executeCalculationButton: document.getElementById('execute-calculation'),
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
            this.calculateWinningThresholds(); // 計算獲勝門檻
            this.renderScores();
            this.renderRound();
            this.setupEventListeners();
        },

        /**
         * 計算每個玩家初始資金的25%作為獲勝門檻
         */
        calculateWinningThresholds() {
            for (const player in this.playerFunds) {
                this.winningThresholds[player] = this.playerFunds[player] * 0.75;
            }
        },
        
        /**
         * 根據 cardRules 動態填充整合後的下拉式選單
         */
        populateCardOptions() {
            const chanceOptgroup = this.elements.cardSelect.querySelector('optgroup[label="機會牌 (獲益)"]');
            const threatOptgroup = this.elements.cardSelect.querySelector('optgroup[label="威脅牌 (損失)"]');

            const createOption = (card, type) => {
                const option = document.createElement('option');
                option.value = `${type}-${card.id}`; // e.g., "chance-C1"
                
                if (type === 'chance') {
                    const percentageDisplay = (card.percentage * 100).toFixed(1);
                    option.textContent = `${card.id} (投入: $${card.fixedCost} / 獲益: +${percentageDisplay}%)`;
                    chanceOptgroup.appendChild(option);
                } else {
                    const percentageDisplay = (Math.abs(card.percentage) * 100).toFixed(1);
                    option.textContent = `${card.id} (投入: $${card.fixedCost} / 損失: -${percentageDisplay}%)`;
                    threatOptgroup.appendChild(option);
                }
            };

            // 1. 填充機會牌
            this.cardRules.chance.forEach(card => createOption(card, 'chance'));

            // 2. 填充威脅牌
            this.cardRules.threat.forEach(card => createOption(card, 'threat'));
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
            this.elements.roundDisplay.textContent = `目前輪次：第 ${this.currentRound} 輪 `; 
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
        // 3. 事件處理與遊戲邏輯
        // =========================================================

        /**
         * 設定所有按鈕和選單的事件監聽
         */
        setupEventListeners() {
            // 監聽步驟 2: 玩家選擇按鈕
            this.elements.playerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const player = button.dataset.player;
                    this.togglePlayerSelection(player, button); 
                });
            });
            this.elements.executeCalculationButton.addEventListener('click', () => this.executeCalculation());

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
             this.renderPlayerOutcomes(); // 每次點擊都更新步驟 3 的 UI
        },

        /**
         * 根據選擇的玩家，渲染步驟 3 的設定選項
         */
        renderPlayerOutcomes() {
            this.elements.playerOutcomeSettings.innerHTML = ''; // 清空現有設定

            this.selectedPlayers.forEach(player => {
                const settingDiv = document.createElement('div');
                settingDiv.className = 'player-outcome-item';
                settingDiv.style.display = 'flex';
                settingDiv.style.alignItems = 'center';
                settingDiv.style.gap = '10px';

                const label = document.createElement('label');
                label.textContent = `玩家 ${player}:`;
                label.style.fontWeight = 'bold';

                const radioAffect = this.createOutcomeRadio(player, 'affect', '影響 (套用獲益/損失)', true);
                const radioFixed = this.createOutcomeRadio(player, 'fixed_cost_only', '不影響 (僅付成本)');

                settingDiv.appendChild(label);
                settingDiv.appendChild(radioAffect.container);
                settingDiv.appendChild(radioFixed.container);
                
                this.elements.playerOutcomeSettings.appendChild(settingDiv);
            });
        },

        /**
         * Helper: 創建單個 radio 按鈕及其標籤
         */
        createOutcomeRadio(player, value, text, checked = false) {
            const container = document.createElement('div');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `outcome-${player}`;
            radio.value = value;
            radio.checked = checked;
            
            const radioLabel = document.createElement('label');
            radioLabel.textContent = text;
            radioLabel.style.marginLeft = '5px';

            container.appendChild(radio);
            container.appendChild(radioLabel);
            return { container, radio };
        },

        /**
         * 執行最終計算
         */
        executeCalculation() {
            // 1. 檢查是否選中玩家
            if (this.selectedPlayers.length === 0) {
                alert('錯誤：請先在步驟 2 選擇至少一位參與計算的玩家！');
                return;
            }

            // 2. 獲取選中的牌卡
            const selectedCardValue = this.elements.cardSelect.value;

            // 3. 檢查是否選中牌號
            if (selectedCardValue === "0") { 
                alert('錯誤：請在步驟 1 的下拉選單中選擇一張牌。');
                return;
            }
            
            // 4. 根據 ID 找到牌的規則
            const [cardType, cardId] = selectedCardValue.split('-'); // e.g., "chance-C1" -> ["chance", "C1"]
            const cardRule = this.cardRules[cardType].find(card => card.id === cardId);

            if (!cardRule) {
                alert('錯誤：找不到對應的牌號規則。');
                return;
            }

            // 5. 執行計算
            this.selectedPlayers.forEach(player => {
                const outcomeChoice = document.querySelector(`input[name="outcome-${player}"]:checked`).value;
                const currentFund = this.playerFunds[player];
                let fundChange;

                if (outcomeChoice === 'fixed_cost_only') {
                    // 不影響：只需付出固定成本
                    fundChange = -cardRule.fixedCost;
                } else {
                    // 影響：套用完整公式
                    const newFund = (currentFund - cardRule.fixedCost) * (1 + cardRule.percentage);
                    fundChange = Math.round(newFund - currentFund);
                }
                
                // 更新資金
                this.playerFunds[player] += fundChange;
            });

            // 6. 更新介面顯示、清理狀態、新增紀錄
            this.renderScores();
            this.clearSelections();
            this.addHistoryEntry();
        },
        
        /**
         * 清理選中的玩家按鈕狀態、下拉選單和步驟 3
         */
        clearSelections() {
            // 清理玩家選中狀態
            this.elements.playerButtons.forEach(button => {
                button.classList.remove('selected');
            });
            this.selectedPlayers = [];
            this.elements.cardSelect.value = "0"; // 重置牌卡選單
            this.renderPlayerOutcomes(); // 清空步驟 3 的 UI
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
                id: player,
                name: `玩家 ${player}`, // 保留 name 供未來可能使用
                score: this.playerFunds[player]
            }));

            finalScores.sort((a, b) => b.score - a.score);

            let resultHTML = '';
            // 顯示獲勝條件
            resultHTML += '<p style="font-weight: bold; margin-bottom: 10px;">獲勝條件：最終資金 >= 初始資金的25%</p>';
            for (const player in this.winningThresholds) {
                resultHTML += `<p>${player}: 初始資金 $${(this.playerFunds[player]).toLocaleString()} 的 25% = $${this.winningThresholds[player].toLocaleString()}</p>`;
            }
            resultHTML += '<hr style="margin: 15px 0;">'; // 分隔線

            finalScores.forEach((p, index) => {
                const displayScore = Math.max(0, p.score);
                let status = '';
                // 移除 <li>, 數字編號, **粗體**, 和 "玩家" 字樣，改用 <p>
                if (p.score < 0) {
                    status = ' (已破產)';
                } else if (p.score >= this.winningThresholds[p.id]) {
                    status = ' (獲勝)';
                } else {
                    status = ' (未獲勝)';
                }
                resultHTML += `<p>${p.id}: 最終資金 $${displayScore.toLocaleString()}${status}</p>`;
            });
            
            if (this.elements.finalResultsDiv) {
                this.elements.finalResultsDiv.innerHTML = resultHTML;
            }
            
            alert('遊戲結束！請查看最終結果。');
        },
        
        restartGame() {
            if (!confirm("確定要重新開始遊戲嗎？所有紀錄將會被清除。")) {
                return;
            }
            
            this.playerFunds = { 'A': 300, 'B': 220, 'C': 200, 'D': 150 };
            this.calculateWinningThresholds(); // 重新計算獲勝門檻
            this.currentRound = 1; // 重新開始時，輪次設定為第一輪
            this.selectedPlayers = [];

            this.elements.scoreHistoryBody.innerHTML = `
                <tr id="initial-scores">
                    <td>初始資金</td>
                    <td>$300</td>
                    <td>$220</td>
                    <td>$200</td>
                    <td>$150</td>
                </tr>
            `; 
            
            this.renderScores();
            this.renderRound();
            this.clearSelections();

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
