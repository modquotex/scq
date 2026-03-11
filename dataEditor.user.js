// ==UserScript==
// @name         QX Transaction Editor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Edit transaction data on Quotex platform
// @author       ModQuotex
// @match        *://*.qxbroker.com/*
// @match        *://*.quotex.io/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Userscript storage wrapper to replace Chrome storage
    const UserStorage = {
        async get(keys) {
            const result = {};
            if (Array.isArray(keys)) {
                keys.forEach(key => {
                    result[key] = GM_getValue(key, null);
                });
            } else if (typeof keys === 'object') {
                Object.keys(keys).forEach(key => {
                    result[key] = GM_getValue(key, keys[key]);
                });
            } else {
                result[keys] = GM_getValue(keys, null);
            }
            return result;
        },
        
        async set(data) {
            Object.keys(data).forEach(key => {
                GM_setValue(key, data[key]);
            });
        }
    };

    // Mock QuotexAuthManager for userscript
    window.QuotexAuthManager = {
        requireAuth: () => true
    };

    class QXTransactionEditor {
        constructor(isVisible = true) {
            if (!window.QuotexAuthManager || !window.QuotexAuthManager.requireAuth('Transaction Editor')) {
                return;
            }

            this.editButtonsVisible = isVisible;
            this.editedTransactions = {};
            this.currentRow = null;
            this.storageKey = 'qxbroker_edited_transactions';
            this.modalOverlay = null;
            this.isInitialized = false;
            
            // Wait for page to load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
        async init() {
            if (this.isInitialized) return;
            
            try {
                await this.loadEditedData();
                this.createModal();
                this.observeTransactionTable();
                this.applyEditsToExistingTransactions();
                this.addLongPressGesture();
                this.isInitialized = true;
                console.log('QX Transaction Editor initialized');
            } catch (error) {
                console.error('Failed to initialize QX Transaction Editor:', error);
            }
        }

        // Add triple tap gesture to control edit buttons visibility
        addLongPressGesture() {
            let pressTimer = null;
            let isLongPress = false;
            let startTime = 0;
            let progressInterval = null;
            const longPressDuration = 3000; // 3 seconds

            const startPress = (event) => {
                // Ignore if clicking on buttons or inputs
                if (event.target.closest('button, input, select, textarea, a, .modal-overlay')) {
                    return;
                }

                isLongPress = false;
                startTime = Date.now();

                // Set long press timer
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    
                    // Haptic feedback for mobile
                    if (navigator.vibrate) {
                        navigator.vibrate([50, 50, 50]); // Triple vibration
                    }
                    
                    // Toggle edit buttons
                    this.toggleEditButtons(!this.editButtonsVisible);
                    
                    // Prevent default action
                    event.preventDefault();
                    event.stopPropagation();
                }, longPressDuration);
            };

            const endPress = (event) => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
                
                isLongPress = false;
            };

            const cancelPress = () => {
                endPress();
            };

            // Add event listeners for both touch and mouse
            document.addEventListener('touchstart', startPress, { passive: false });
            document.addEventListener('mousedown', startPress, { passive: false });
            
            document.addEventListener('touchend', endPress, { passive: false });
            document.addEventListener('mouseup', endPress, { passive: false });
            
            // Cancel on move (prevents accidental triggers)
            document.addEventListener('touchmove', cancelPress, { passive: true });
            document.addEventListener('mousemove', cancelPress, { passive: true });
            
            // Cancel on scroll
            document.addEventListener('scroll', cancelPress, { passive: true });
        }

        injectModalStyles() {
            if (document.getElementById('transaction-editor-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'transaction-editor-styles';
            style.textContent = `
                .modal-overlay.active {
                    display: flex !important;
                }
                .transaction-modal-container {
                    background: #0f0f23;
                    border: 1px solid #374151;
                    border-radius: 20px;
                    padding: 0;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    width: 90%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow: hidden;
                    position: relative;
                    animation: modalSlideIn 0.3s ease-out;
                }
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    color: white;
                    padding: 20px 24px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .modal-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                    pointer-events: none;
                }
                .modal-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.5px;
                }
                .modal-subtitle {
                    font-size: 13px;
                    opacity: 0.9;
                    margin: 0;
                    font-weight: 400;
                }
                .modal-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }
                .modal-body {
                    padding: 24px;
                    background: #0f0f23;
                    max-height: calc(90vh - 100px);
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .modal-body::-webkit-scrollbar {
                    display: none;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                .form-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #b8bcc8;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-input, .form-select {
                    padding: 10px 14px;
                    border: 2px solid #374151;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #ffffff;
                    background: #1a1a2e;
                    transition: all 0.2s ease;
                    outline: none;
                }
                .form-input:focus, .form-select:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background: #16213e;
                }
                .form-select {
                    cursor: pointer;
                }
                .modal-actions {
                    display: flex;
                    gap: 10px;
                    padding-top: 20px;
                    border-top: 1px solid #374151;
                }
                .btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-secondary {
                    background: #16213e;
                    color: #b8bcc8;
                    border: 2px solid #374151;
                }
                .btn-secondary:hover {
                    background: #1a1a2e;
                    color: #ffffff;
                    border-color: #4b5563;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                }
                .editBtn {
                    width: 30px;
                    height: 20px;
                    border-radius: 4px;
                    border: none;
                    background-color: #10b981;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.123);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s;
                }
                .editBtn::before {
                    content: "";
                    width: 200%;
                    height: 200%;
                    background-color: #059669;
                    position: absolute;
                    z-index: 1;
                    transform: scale(0);
                    transition: all 0.3s;
                    border-radius: 4px;
                    filter: blur(10px);
                }
                .editBtn:hover::before {
                    transform: scale(1);
                }
                .editBtn:hover {
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.336);
                }
                .editBtn svg {
                    height: 12px;
                    fill: white;
                    z-index: 3;
                    transition: all 0.2s;
                    transform-origin: bottom;
                }
                .editBtn:hover svg {
                    transform: rotate(-15deg) translateX(5px);
                }
                .editBtn::after {
                    content: "";
                    width: 20px;
                    height: 1px;
                    position: absolute;
                    bottom: 3px;
                    left: -5px;
                    background-color: white;
                    border-radius: 2px;
                    z-index: 2;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.5s ease-out;
                }
                .editBtn:hover::after {
                    transform: scaleX(1);
                    left: 0px;
                    transform-origin: right;
                }
                .editBtn[hidden] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                @media (max-width: 640px) {
                    .transaction-modal-container {
                        width: 96%;
                        max-width: none;
                        margin: 8px;
                        max-height: 96vh;
                        border-radius: 16px;
                    }
                    .modal-header {
                        padding: 16px 20px;
                    }
                    .modal-title {
                        font-size: 18px;
                        margin: 0 0 4px 0;
                    }
                    .modal-subtitle {
                        font-size: 11px;
                    }
                    .modal-close {
                        width: 28px;
                        height: 28px;
                        top: 10px;
                        right: 10px;
                    }
                    .modal-body {
                        padding: 16px;
                        max-height: calc(96vh - 80px);
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .form-label {
                        font-size: 11px;
                        margin-bottom: 5px;
                    }
                    .form-input, .form-select {
                        padding: 9px 12px;
                        font-size: 13px;
                        border-radius: 8px;
                    }
                    .modal-actions {
                        flex-direction: column;
                        gap: 8px;
                        padding-top: 16px;
                    }
                    .btn {
                        padding: 11px 16px;
                        font-size: 12px;
                        border-radius: 8px;
                    }
                }
                @media (max-width: 400px) {
                    .transaction-modal-container {
                        width: 98%;
                        margin: 4px;
                        border-radius: 12px;
                    }
                    .modal-header {
                        padding: 14px 16px;
                    }
                    .modal-title {
                        font-size: 16px;
                    }
                    .modal-body {
                        padding: 14px;
                    }
                    .form-grid {
                        gap: 10px;
                    }
                }
                @media (max-width: 768px) {
                    [class*="__status-icon--"] {
                        display: none !important;
                    }
                }
                
                /* iOS-style Time Picker */
                .ios-time-picker {
                    background: #1a1a2e;
                    border: 2px solid #374151;
                    border-radius: 12px;
                    padding: 10px;
                    position: relative;
                }
                
                .time-wheel-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    height: 150px;
                    position: relative;
                }
                
                .time-wheel {
                    width: 70px;
                    height: 150px;
                    position: relative;
                    overflow: hidden;
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%);
                }
                
                .wheel-overlay {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 40px;
                    transform: translateY(-50%);
                    border-top: 2px solid #3b82f6;
                    border-bottom: 2px solid #3b82f6;
                    background: rgba(59, 130, 246, 0.1);
                    pointer-events: none;
                    z-index: 2;
                    border-radius: 8px;
                }
                
                .wheel-items {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 55px 0;
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    cursor: grab;
                    user-select: none;
                }
                
                .wheel-items:active {
                    cursor: grabbing;
                }
                
                .wheel-item {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 600;
                    color: #666;
                    transition: all 0.3s ease;
                }
                
                .wheel-item.active {
                    color: #ffffff;
                    font-size: 24px;
                    transform: scale(1.1);
                }
                
                .time-separator {
                    font-size: 28px;
                    font-weight: 700;
                    color: #3b82f6;
                    margin: 0 5px;
                    line-height: 150px;
                }
            `;
            document.head.appendChild(style);
        }
        createModal() {
            this.injectModalStyles();
            this.modalOverlay = document.createElement('div');
            this.modalOverlay.className = 'modal-overlay transaction-modal-overlay';
            this.modalOverlay.style.cssText = `
                background: rgba(0, 0, 0, 0.8);
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
                z-index: 10000;
                display: none;
                backdrop-filter: blur(5px);
            `;
            
            const modalHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
                    <div class="transaction-modal-container">
                        <div class="modal-header">
                            <h2 class="modal-title">ModQuotex</h2>
                            <p class="modal-subtitle">Created By @ModQuotex</p>
                            <button class="modal-close" id="modal-close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label" for="edit-order-id">Order ID</label>
                                    <input type="text" id="edit-order-id" class="form-input" placeholder="Enter order ID">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="edit-status">Status</label>
                                    <select id="edit-status" class="form-select">
                                        <option value="Aguardando confirmação">Aguardando confirmação</option>
                                        <option value="Bem-sucedido">Bem-sucedido</option>
                                        <option value="Falhado">Falhado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="edit-date">Date</label>
                                    <input type="date" id="edit-date" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="edit-time">Time (24h format)</label>
                                    <input type="time" id="edit-time" class="form-input" step="1">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="edit-type">Type</label>
                                    <select id="edit-type" class="form-select">
                                        <option value="Depósito">Depósito</option>
                                        <option value="Pagamento">Pagamento</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="edit-amount">Amount</label>
                                    <input type="text" id="edit-amount" class="form-input" placeholder="Enter amount">
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label" for="edit-method">Payment Method</label>
                                    <input type="text" id="edit-method" class="form-input" placeholder="Enter payment method">
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                                <button class="btn btn-primary" id="modal-save">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.modalOverlay.innerHTML = modalHTML;
            document.body.appendChild(this.modalOverlay);
            
            this.modalOverlay.querySelector('#modal-close').addEventListener('click', () => this.closeModal());
            this.modalOverlay.querySelector('#modal-cancel').addEventListener('click', () => this.closeModal());
            this.modalOverlay.querySelector('#modal-save').addEventListener('click', () => this.saveChanges());
            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) {
                    this.closeModal();
                }
            });
        }

        showModal(row) {
            this.currentRow = row;
            const transactionId = this.getTransactionId(row);
            let orderId = '', dateText = '', status = '', type = '', method = '', amount = '';
            
            const edited = this.editedTransactions[transactionId];
            if (edited) {
                orderId = edited.id || '';
                dateText = edited.date || '';
                status = edited.status || '';
                type = edited.type || '';
                method = edited.method || '';
                amount = edited.amount || '';
            } else {
                orderId = row.querySelector('[class*="__id--"]')?.textContent.trim() || '';
                dateText = row.querySelector('[class*="__date--"]')?.textContent.trim() || '';
                status = row.querySelector('[class*="__status-text--"]')?.textContent.trim() || '';
                type = row.querySelector('[class*="__type--"]')?.textContent.trim() || '';
                method = row.querySelector('[class*="__method--"]')?.textContent.trim() || '';
                
                const amountElement = row.querySelector('[class*="__amount--"]');
                if (amountElement) {
                    let amountText = '';
                    amountElement.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            amountText += node.textContent;
                        } else if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            !node.classList.contains('edit-btn-wrapper') &&
                            !node.classList.contains('edit-btn')
                        ) {
                            amountText += node.textContent;
                        }
                    });
                    amount = amountText.trim();
                }
            }

            const modal = this.modalOverlay;
            modal.querySelector('#edit-order-id').value = orderId;
            
            if (dateText) {
                try {
                    // Parse format: "09/09/2025, 12:01:21" or "DD/MM/YYYY, HH:MM:SS"
                    const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2}):(\d{2})/);
                    if (dateMatch) {
                        const [, day, month, year, hours, minutes, seconds] = dateMatch;
                        modal.querySelector('#edit-date').value = `${year}-${month}-${day}`;
                        modal.querySelector('#edit-time').value = `${hours}:${minutes}:${seconds}`;
                    } else {
                        // Fallback to Date parsing
                        const dateObj = new Date(dateText);
                        if (!isNaN(dateObj.getTime())) {
                            modal.querySelector('#edit-date').value = dateObj.toISOString().split('T')[0];
                            const pad = n => n.toString().padStart(2, '0');
                            const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
                            modal.querySelector('#edit-time').value = timeStr;
                        }
                    }
                } catch (error) {
                    // Fallback for simple date format
                    const dateMatch = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                    if (dateMatch) {
                        const [, day, month, year] = dateMatch;
                        modal.querySelector('#edit-date').value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }
            }
            
            modal.querySelector('#edit-status').value = status || 'Aguardando confirmação';
            modal.querySelector('#edit-type').value = type || 'Depósito';
            modal.querySelector('#edit-method').value = method;
            modal.querySelector('#edit-amount').value = amount;
            
            this.modalOverlay.classList.add('active');
            this.modalOverlay.style.display = 'flex';
        }

        closeModal() {
            this.modalOverlay.classList.remove('active');
            this.modalOverlay.style.display = 'none';
            this.currentRow = null;
        }

        async saveChanges() {
            if (!this.currentRow) return;
            
            const modal = this.modalOverlay;
            const data = {
                id: modal.querySelector('#edit-order-id').value,
                status: modal.querySelector('#edit-status').value,
                type: modal.querySelector('#edit-type').value,
                method: modal.querySelector('#edit-method').value,
                amount: modal.querySelector('#edit-amount').value
            };
            
            const dateStr = modal.querySelector('#edit-date').value;
            const timeStr = modal.querySelector('#edit-time').value;
            
            if (dateStr && timeStr) {
                const dateTime = new Date(`${dateStr}T${timeStr}`);
                const pad = n => n.toString().padStart(2, '0');
                const formatted = `${pad(dateTime.getDate())}/${pad(dateTime.getMonth() + 1)}/${dateTime.getFullYear()}, ${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}:${pad(dateTime.getSeconds())}`;
                data.date = formatted;
            }
            
            const transactionId = this.getTransactionId(this.currentRow);
            if (transactionId) {
                this.editedTransactions[transactionId] = data;
                await this.saveEditedData();
                this.applyEditToRow(this.currentRow, data);
            }
            
            this.closeModal();
        }

        async loadEditedData() {
            try {
                const result = await UserStorage.get([this.storageKey]);
                this.editedTransactions = result[this.storageKey] || {};
            } catch (error) {
                this.editedTransactions = {};
            }
        }

        async saveEditedData() {
            try {
                await UserStorage.set({
                    [this.storageKey]: this.editedTransactions
                });
            } catch (error) {
                console.error('Failed to save edited data:', error);
            }
        }
        observeTransactionTable() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP')) {
                                this.addEditButton(node);
                                this.applyEditToRow(node);
                            } else {
                                const transactionItems = node.querySelectorAll && node.querySelectorAll('[class*="__transaction--"]');
                                if (transactionItems) {
                                    transactionItems.forEach(item => {
                                        this.addEditButton(item);
                                        this.applyEditToRow(item);
                                    });
                                }
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        applyEditsToExistingTransactions() {
            setTimeout(() => {
                const transactionItems = document.querySelectorAll('[class*="__transaction--"]');
                transactionItems.forEach(item => {
                    this.addEditButton(item);
                    this.applyEditToRow(item);
                });
            }, 100);
        }

        getTransactionId(row) {
            const marker = row.getAttribute && row.getAttribute('data-mq-id');
            if (marker) return marker.trim();
            
            const idElement = row.querySelector('[class*="__id--"]');
            return idElement ? idElement.textContent.trim() : null;
        }

        addEditButton(row) {
            const existingBtn = row.querySelector('.editBtn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            const editBtn = document.createElement('button');
            editBtn.className = 'editBtn';
            editBtn.innerHTML = `
                <svg height="1em" viewBox="0 0 512 512">
                    <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                </svg>
            `;
            editBtn.onclick = () => this.showModal(row);
            editBtn.hidden = !this.editButtonsVisible;
            
            const amountColumn = row.querySelector('[class*="__amount-col--"]');
            if (amountColumn) {
                let buttonWrapper = amountColumn.querySelector('.edit-btn-wrapper');
                if (!buttonWrapper) {
                    buttonWrapper = document.createElement('div');
                    buttonWrapper.className = 'edit-btn-wrapper';
                    buttonWrapper.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: ${this.editButtonsVisible ? '70px' : '0px'};
                        transition: min-width 0.3s ease;
                    `;
                    amountColumn.appendChild(buttonWrapper);
                }
                buttonWrapper.style.minWidth = this.editButtonsVisible ? '35px' : '0px';
                buttonWrapper.appendChild(editBtn);
            }
        }

        applyEditToRow(row, editData = null) {
            const transactionId = this.getTransactionId(row);
            if (!transactionId) return;
            
            const data = editData || this.editedTransactions[transactionId];
            if (!data) return;
            
            if (data.id) {
                const idElement = row.querySelector('[class*="__id--"]');
                if (idElement) {
                    idElement.textContent = data.id;
                }
                if (row.setAttribute) {
                    row.setAttribute('data-mq-id', String(data.id));
                }
            }
            
            if (data.date) {
                const dateElement = row.querySelector('[class*="__date--"]');
                if (dateElement) {
                    dateElement.textContent = data.date;
                }
            }
            
            if (data.status) {
                const statusText = row.querySelector('[class*="__status-text--"]');
                const statusIcon = row.querySelector('[class*="__status-icon--"]');
                const statusBlock = statusText?.parentElement;
                
                if (statusText && statusBlock) {
                    while (statusBlock.firstChild) statusBlock.removeChild(statusBlock.firstChild);
                    
                    const iconDiv = document.createElement('div');
                    iconDiv.style.display = 'flex';
                    const textSpan = document.createElement('span');
                    textSpan.textContent = data.status;
                    textSpan.classList.remove('text-success', 'text-danger');
                    
                    if (data.status.toLowerCase() === 'aguardando confirmação' || data.status.toLowerCase() === 'em processamento' || data.status.toLowerCase() === 'processing') {
                        iconDiv.className = statusIcon ? statusIcon.className.replace(/success|danger|close-tiny|check-tiny/g, 'muted') : '';
                        iconDiv.innerHTML = '<svg class="icon-pending"><use xlink:href="/profile/images/spritemap.svg#icon-pending"></use></svg>';
                        textSpan.className = statusText.className.replace(/check-tiny|close-tiny/g, 'pending');
                        textSpan.classList.add('text-muted');
                        iconDiv.style.background = 'grey';
                        textSpan.style.color = 'white';
                    } else if (data.status.toLowerCase() === 'bem-sucedido' || data.status.toLowerCase() === 'successed' || data.status.toLowerCase() === 'succeeded') {
                        iconDiv.className = statusIcon ? statusIcon.className.replace(/muted|danger|close-tiny/g, 'success') : '';
                        iconDiv.innerHTML = '<svg class="icon-check-tiny"><use xlink:href="/profile/images/spritemap.svg#icon-check-tiny"></use></svg>';
                        textSpan.className = statusText.className.replace(/pending|close-tiny/g, 'check-tiny');
                        textSpan.classList.add('text-success');
                        iconDiv.style.background = '#0faf59';
                        textSpan.style.color = '#0faf59';
                    } else if (data.status.toLowerCase() === 'falhado' || data.status.toLowerCase() === 'failed') {
                        iconDiv.className = statusIcon ? statusIcon.className.replace(/muted|success|check-tiny/g, 'danger') : '';
                        iconDiv.innerHTML = '<svg class="icon-close-tiny"><use xlink:href="/profile/images/spritemap.svg#icon-close-tiny"></use></svg>';
                        textSpan.className = statusText.className.replace(/pending|check-tiny/g, 'close-tiny');
                        textSpan.classList.add('text-danger');
                        iconDiv.style.background = '#ff6251';
                        textSpan.style.color = '#ff6251';
                    }
                    
                    iconDiv.style.borderRadius = '50%';
                    iconDiv.style.padding = '2px';
                    statusBlock.appendChild(iconDiv);
                    statusBlock.appendChild(textSpan);
                    
                    if (data.status.toLowerCase() === 'aguardando confirmação' || data.status.toLowerCase() === 'em processamento' || data.status.toLowerCase() === 'processing') {
                        statusBlock.classList.add('---react-ui-TransactionsScreenItem-styles-module__cancel--VkPhi');
                        const cancelBtn = document.createElement('a');
                        cancelBtn.href = '#';
                        cancelBtn.className = '---react-ui-TransactionsScreenItem-styles-module__close--kIFLU';
                        cancelBtn.textContent = 'Cancelar';
                        cancelBtn.onclick = (e) => {
                            e.preventDefault();
                            if (confirm('Tem certeza de que deseja cancelar esta transação?')) {
                                // Handle cancellation
                            }
                        };
                        statusBlock.appendChild(cancelBtn);
                    } else {
                        statusBlock.classList.remove('---react-ui-TransactionsScreenItem-styles-module__cancel--VkPhi');
                        const existingCancelBtn = statusBlock.querySelector('.---react-ui-TransactionsScreenItem-styles-module__close--kIFLU');
                        if (existingCancelBtn) {
                            existingCancelBtn.remove();
                        }
                    }
                    
                    let processedDiv = row.querySelector('[class*="__status-processed"]');
                    if (data.status.toLowerCase() === 'aguardando confirmação' || data.status.toLowerCase() === 'em processamento' || data.status.toLowerCase() === 'processing') {
                        if (!processedDiv) {
                            processedDiv = document.createElement('div');
                            processedDiv.className = '---react-ui-TransactionsScreenItem-styles-module__processed--LyUrN';
                            statusBlock.parentElement.appendChild(processedDiv);
                        }
                        processedDiv.textContent = "A retirada está sendo processada no lado do operador financeiro. Aguarde - os fundos devem ser recebidos dentro de 48 horas.";
                        processedDiv.style.display = '';
                        processedDiv.style.maxWidth = '300px';
                        processedDiv.style.marginTop = '10px';
                        processedDiv.style.background = 'hsla(0, 0%, 100%, .05)';
                        processedDiv.style.padding = '12px';
                        processedDiv.style.borderRadius = '10px';
                        processedDiv.style.fontSize = '12px';
                        processedDiv.style.lineHeight = '16px';
                    } else if (processedDiv) {
                        processedDiv.textContent = '';
                        processedDiv.style.display = 'none';
                    }
                }
            }
            
            if (data.type) {
                const typeElement = row.querySelector('[class*="__type--"]');
                if (typeElement) {
                    typeElement.textContent = data.type;
                }
            }
            
            if (data.method) {
                const methodElement = row.querySelector('[class*="__method--"]');
                if (methodElement) {
                    methodElement.textContent = data.method;
                }
            }
            
            if (data.amount) {
                const amountElement = row.querySelector('[class*="__amount--"]');
                const amountColumn = row.querySelector('[class*="__amount-col--"]');
                const targetElement = amountElement || amountColumn;
                
                if (targetElement) {
                    const wrapper = targetElement.querySelector('.edit-btn-wrapper');
                    const buttons = targetElement.querySelectorAll('.edit-btn');
                    
                    targetElement.innerHTML = '';
                    
                    const amountSpan = document.createElement('b');
                    amountSpan.textContent = data.amount;
                    amountSpan.className = '---react-ui-TransactionsScreenItem-styles-module__amount--h5o4H';
                    
                    if (data.amount.toString().startsWith('-')) {
                        amountSpan.style.color = '#ff6251';
                        amountSpan.classList.add('---react-ui-TransactionsScreenItem-styles-module__red--lqlCl');
                    } else if (data.amount.toString().startsWith('+')) {
                        amountSpan.style.color = '#0faf59';
                        amountSpan.classList.add('---react-ui-TransactionsScreenItem-styles-module__green--jGuz_');
                    }
                    
                    targetElement.appendChild(amountSpan);
                    
                    if (wrapper) {
                        targetElement.appendChild(wrapper);
                        buttons.forEach(btn => wrapper.appendChild(btn));
                    }
                }
            }
        }

        toggleEditButtons(visible) {
            this.editButtonsVisible = visible;
            
            // Save state to userscript storage
            UserStorage.set({ transactionEditEnabled: visible });
            
            const buttons = document.querySelectorAll('.editBtn');
            const wrappers = document.querySelectorAll('.edit-btn-wrapper');
            
            buttons.forEach(button => {
                button.hidden = !visible;
                if (!visible) {
                    button.style.display = 'none';
                    button.style.visibility = 'hidden';
                    button.style.opacity = '0';
                } else {
                    button.style.display = 'flex';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                }
            });
            
            wrappers.forEach(wrapper => {
                wrapper.style.minWidth = visible ? '35px' : '0px';
                wrapper.style.overflow = visible ? 'visible' : 'hidden';
                if (!visible) {
                    wrapper.style.width = '0px';
                }
            });
            
            setTimeout(() => {
                const transactionItems = document.querySelectorAll('[class*="__transaction--"]');
                transactionItems.forEach(item => {
                    this.addEditButton(item);
                });
            }, 100);
        }
    }

    // Initialize the transaction editor
    let transactionEditor = null;

    // Function to initialize or reinitialize the editor
    function initializeEditor() {
        if (transactionEditor && transactionEditor.isInitialized) {
            return; // Already initialized
        }
        
        // Get saved state
        UserStorage.get(['transactionEditEnabled']).then(result => {
            const isEnabled = result.transactionEditEnabled !== null ? result.transactionEditEnabled : true;
            transactionEditor = new QXTransactionEditor(isEnabled);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEditor);
    } else {
        initializeEditor();
    }

    // Reinitialize on page navigation (for SPA)
    let currentUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(initializeEditor, 1000); // Delay to allow page to load
        }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });

    // Expose to global scope for debugging
    window.QXTransactionEditor = QXTransactionEditor;
    window.transactionEditor = transactionEditor;

})();