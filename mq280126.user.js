// ==UserScript==
// @name         QX Trading Console - Clean Version
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  QX Trading Console - No license
// @author       Modified
// @match        https://qxbroker.com/*
// @match        https://*.qxbroker.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ========================================
    // CONFIGURATION - EDIT THESE VALUES
    // ========================================
    const CONFIG = {
        STARTING_BALANCE: 100,                // Yaha par apna Starting Balance set karna bro
        DISPLAY_NAME: "RG",           // Yaha par aona name jo leaderboard me show hoga
        COUNTRY_FLAG: "flag-in",               // Country flag code (flag-in, flag-us, flag-pk, etc.)
        AVATAR_URL: ""                         // Optional: Your avatar URL (leave empty for default)
    };
    // ========================================

    function initializeScript() {
        startMainSystem();
    }

    function startMainSystem() {
        let startingBalance = null;

        function autoStartTrading() {
            startingBalance = CONFIG.STARTING_BALANCE;
            saveNameFlagSettings({
                customName: CONFIG.DISPLAY_NAME,
                customFlagCode: CONFIG.COUNTRY_FLAG,
                avatarUrl: CONFIG.AVATAR_URL
            });
            applyNameFlagChanges(CONFIG.DISPLAY_NAME, CONFIG.COUNTRY_FLAG);
            if (CONFIG.AVATAR_URL) {
                localStorage.setItem('customAvatarUrl', CONFIG.AVATAR_URL);
            }
            startTracking();
            initNameFlagTracking();
        }

        function getCurrentBalance() {
            let el = document.querySelector(".---react-features-Usermenu-styles-module__infoBalance--pVBHU");
            if (!el) el = document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.---react-features-Usermenu-styles-module__usermenu--rymiA > div > div.---react-features-Usermenu-styles-module__infoText--58LeE > div.---react-features-Usermenu-styles-module__infoBalance--pVBHU");
            if (!el) el = document.querySelector(".usermenu__info-balance");
            if (!el) return null;
            const value = parseFloat(el.textContent.replace(/[^\d.-]/g, ""));
            return isNaN(value) ? null : value;
        }

        function updatePnLDisplay(currentBalance) {
            if (startingBalance === null) return;
            const pnlSelectors = [
                ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ",
                ".position__header-money"
            ];

            let pnlEl = null;
            for (const selector of pnlSelectors) {
                pnlEl = document.querySelector(selector);
                if (pnlEl) break;
            }
            if (!pnlEl) return;
            const pnl = currentBalance - startingBalance;
            const isProfit = pnl >= 0;
            const formattedAmount = Math.abs(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const finalText = isProfit ? `${formattedAmount}` : `-${formattedAmount}`;
            pnlEl.textContent = finalText;

            if (pnlEl.classList.contains("---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ")) {
                pnlEl.classList.remove("---react-features-Sidepanel-LeaderBoard-Position-styles-module__green--LD4pW", "---react-features-Sidepanel-LeaderBoard-Position-styles-module__red--LD4pW");
                pnlEl.classList.add(isProfit ? "---react-features-Sidepanel-LeaderBoard-Position-styles-module__green--LD4pW" : "---react-features-Sidepanel-LeaderBoard-Position-styles-module__red--LD4pW");
            } else {
                pnlEl.classList.remove("--green", "--red");
                pnlEl.classList.add(isProfit ? "--green" : "--red");
            }

            if (!isProfit) {
                pnlEl.style.setProperty('color', '#ff4757', 'important');
            } else {
                pnlEl.style.setProperty('color', '#0faf59', 'important');
            }

            if (!document.getElementById('pnl-color-override')) {
                const style = document.createElement('style');
                style.id = 'pnl-color-override';
                style.textContent = `
                    .---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ.---react-features-Sidepanel-LeaderBoard-Position-styles-module__red--LD4pW {
                        color: #ff4757 !important;
                    }
                    .---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ.---react-features-Sidepanel-LeaderBoard-Position-styles-module__green--LD4pW {
                        color: #0faf59 !important;
                    }
                    .position__header-money.--red {
                        color: #ff4757 !important;
                    }
                    .position__header-money.--green {
                        color: #0faf59 !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        function startTracking() {
            setInterval(() => {
                const currentBalance = getCurrentBalance();
                if (startingBalance !== null && currentBalance !== null) updatePnLDisplay(currentBalance);
            }, 10);
        }

        const nameStorageKey = 'customModSettings';
        const nameSelectors = [
            ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__name--xN5cX",
            ".position__header-name"
        ];

        function loadNameFlagSettings() {
            try {
                const saved = localStorage.getItem(nameStorageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (!parsed.avatarUrl) {
                        const savedAvatarUrl = localStorage.getItem('customAvatarUrl');
                        if (savedAvatarUrl) {
                            parsed.avatarUrl = savedAvatarUrl;
                        }
                    }
                    return parsed;
                }
            } catch { }
            const savedAvatarUrl = localStorage.getItem('customAvatarUrl');
            return {
                customName: CONFIG.DISPLAY_NAME,
                customFlagCode: CONFIG.COUNTRY_FLAG,
                avatarUrl: savedAvatarUrl || CONFIG.AVATAR_URL
            };
        }

        function saveNameFlagSettings(settings) {
            localStorage.setItem(nameStorageKey, JSON.stringify(settings));
        }

        function applyNameFlagChanges(name, flagCode) {
            try {
                let headerDiv = null;
                for (const selector of nameSelectors) {
                    headerDiv = document.querySelector(selector);
                    if (headerDiv) break;
                }

                if (!headerDiv) return;
                if (headerDiv.dataset.customized === "true" && headerDiv.dataset.name === name && headerDiv.dataset.flag === flagCode) return;

                const svg = headerDiv.querySelector("svg");
                if (svg) {
                    svg.setAttribute("class", flagCode);
                    const flagLabel = flagCode.replace('flag-', '').toUpperCase();
                    svg.setAttribute("aria-label", `Flag ${flagLabel}`);
                    const useTag = svg.querySelector("use");
                    if (useTag) {
                        useTag.setAttribute("href", `/profile/images/flags.svg#${flagCode}`);
                    }
                }

                const textNodes = [...headerDiv.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                    textNodes.forEach(node => {
                        if (node.textContent.trim() !== name) {
                            node.textContent = name;
                        }
                    });
                } else {
                    headerDiv.appendChild(document.createTextNode(name));
                }

                headerDiv.dataset.customized = "true";
                headerDiv.dataset.name = name;
                headerDiv.dataset.flag = flagCode;
            } catch (error) {
                console.error('NameFlag error:', error);
            }
        }

        function initNameFlagTracking() {
            const settings = loadNameFlagSettings();
            applyNameFlagChanges(settings.customName, settings.customFlagCode);

            // Wait for body to be available
            const startObserver = () => {
                if (document.body) {
                    new MutationObserver(() => {
                        const currentSettings = loadNameFlagSettings();
                        applyNameFlagChanges(currentSettings.customName, currentSettings.customFlagCode);
                    }).observe(document.body, { childList: true, subtree: true });
                } else {
                    setTimeout(startObserver, 10);
                }
            };
            startObserver();
        }

        function initIconsSystem() {
            const config = {
                mobileMaxWidth: 768,
                liveColor: '#0faf59',
                iconBase: '/profile/images/spritemap.svg#',
                icons: { low: 'icon-profile-level-standart', mid: 'icon-profile-level-pro', high: 'icon-profile-level-vip' },
                usermenuSelector: "[class*='usermenu']",
                balanceSelector: "[class*='infoBalance']",
                nameSelector: "[class*='infoName']",
                iconUseSelector: "[class*='infoLevels'] use"
            };
            const cache = {
                isMobile: window.innerWidth <= config.mobileMaxWidth,
                liveText: window.innerWidth <= config.mobileMaxWidth ? 'Live' : 'Live Account',
                processedElements: new WeakSet(),
                lastBalance: new WeakMap(),
                lastIcon: new WeakMap()
            };
            const getBalanceValue = el => {
                const currentText = el?.textContent || '';
                if (cache.lastBalance.has(el)) {
                    const cached = cache.lastBalance.get(el);
                    if (cached.text === currentText) return cached.value;
                }
                const value = parseFloat(currentText.replace(/[^\d.]/g, '').replace(/,/g, '')) || 0;
                cache.lastBalance.set(el, { text: currentText, value });
                return value;
            };
            const getIconForBalance = bal => bal >= 10000 ? config.icons.high : bal >= 5000 ? config.icons.mid : config.icons.low;
            const updateUsermenu = menu => {
                const nameEls = menu.querySelectorAll(config.nameSelector);
                const balanceEl = menu.querySelector(config.balanceSelector);
                const iconEl = menu.querySelector(config.iconUseSelector);
                if (!balanceEl || !iconEl) return;
                for (let i = 0; i < nameEls.length; i++) {
                    nameEls[i].textContent = cache.liveText;
                    nameEls[i].style.color = config.liveColor;
                }
                const currentBalance = getBalanceValue(balanceEl);
                const newIcon = getIconForBalance(currentBalance);
                const newHref = config.iconBase + newIcon;
                const currentHref = iconEl.getAttribute('xlink:href');
                if (currentHref !== newHref) {
                    iconEl.setAttribute('xlink:href', newHref);
                    cache.lastIcon.delete(iconEl);
                }
            };
            const updateAllUsermenus = () => {
                const menus = document.querySelectorAll(config.usermenuSelector);
                for (let i = 0; i < menus.length; i++) updateUsermenu(menus[i]);
            };
            const immediateBalanceUpdate = menu => {
                const balanceEl = menu.querySelector(config.balanceSelector);
                const iconEl = menu.querySelector(config.iconUseSelector);
                if (!balanceEl || !iconEl) return;
                cache.lastBalance.delete(balanceEl);
                updateUsermenu(menu);
            };
            const observeBalanceChanges = () => {
                document.querySelectorAll(config.usermenuSelector).forEach(menu => {
                    const balanceEl = menu.querySelector(config.balanceSelector);
                    if (!balanceEl || cache.processedElements.has(balanceEl)) return;
                    cache.processedElements.add(balanceEl);
                    new MutationObserver((mutations) => {
                        let balanceChanged = false;
                        mutations.forEach(mutation => {
                            if (mutation.type === 'childList' || mutation.type === 'characterData') balanceChanged = true;
                        });
                        if (balanceChanged) immediateBalanceUpdate(menu);
                    }).observe(balanceEl, { characterData: true, childList: true, subtree: true });
                });
            };
            const observeNewMenus = () => {
                let pendingUpdates = new Set();
                let updateScheduled = false;
                const processPendingUpdates = () => {
                    pendingUpdates.forEach(menu => updateUsermenu(menu));
                    pendingUpdates.clear();
                    updateScheduled = false;
                    observeBalanceChanges();
                };
                new MutationObserver(mutations => {
                    mutations.forEach(m => {
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                if (node.matches && node.matches(config.usermenuSelector)) pendingUpdates.add(node);
                                else if (node.querySelectorAll) {
                                    const found = node.querySelectorAll(config.usermenuSelector);
                                    found.forEach(menu => pendingUpdates.add(menu));
                                }
                            }
                        });
                    });
                    if (pendingUpdates.size > 0 && !updateScheduled) {
                        updateScheduled = true;
                        requestAnimationFrame(processPendingUpdates);
                    }
                }).observe(document.body, { childList: true, subtree: true });
            };
            const updateCacheOnResize = () => {
                const wasMobile = cache.isMobile;
                cache.isMobile = window.innerWidth <= config.mobileMaxWidth;
                cache.liveText = cache.isMobile ? 'Live' : 'Live Account';
                if (wasMobile !== cache.isMobile) {
                    cache.processedElements = new WeakSet();
                    updateAllUsermenus();
                }
            };
            const initLiveAccountPatch = () => {
                const menus = document.querySelectorAll(config.usermenuSelector);
                menus.forEach(updateUsermenu);
                observeBalanceChanges();
                observeNewMenus();
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    if (resizeTimeout) clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(updateCacheOnResize, 100);
                });
            };
            initLiveAccountPatch();
        }

        function initDropdownSystem() {
            const formatWithCommas = (num) => {
                const number = parseFloat(num);
                if (isNaN(number)) return "$0.00";
                return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
            };
            const updateLevelUI_Style1 = (dropdown, balance) => {
                const levelEl = dropdown.querySelector('[class*="__level"]');
                if (!levelEl) return;
                const levelNameEl = levelEl.querySelector('[class*="__levelName"]');
                const profitEl = levelEl.querySelector('[class*="__levelProfit"]');
                const iconSvg = levelEl.querySelector('svg');
                const iconUse = iconSvg && iconSvg.querySelector('use');
                if (!levelNameEl || !profitEl || !iconSvg || !iconUse) return;
                if (balance >= 10000) {
                    levelNameEl.textContent = 'vip level:';
                    profitEl.textContent = '+4% profit';
                    iconSvg.setAttribute('class', 'icon-profile-level-vip');
                    iconUse.setAttribute('xlink:href', '/profile/images/spritemap.svg#icon-profile-level-vip');
                } else if (balance >= 5000) {
                    levelNameEl.textContent = 'pro level:';
                    profitEl.textContent = '+2% profit';
                    iconSvg.setAttribute('class', 'icon-profile-level-pro');
                    iconUse.setAttribute('xlink:href', '/profile/images/spritemap.svg#icon-profile-level-pro');
                } else {
                    levelNameEl.textContent = 'standard:';
                    profitEl.textContent = '+0% profit';
                    iconSvg.setAttribute('class', 'icon-profile-level-standart');
                    iconUse.setAttribute('xlink:href', '/profile/images/spritemap.svg#icon-profile-level-standart');
                }
            };
            const updateAccountUI_Style1 = (dropdown) => {
                const allItems = dropdown.querySelectorAll('li[class*="__selectItemRadio"]');
                const demoItem = Array.from(allItems).find(item => item.querySelector('a[class*="__selectName"]') && item.querySelector('a[class*="__selectName"]').textContent.trim() === 'Demo Account');
                const liveItem = Array.from(allItems).find(item => item.querySelector('a[class*="__selectName"]') && item.querySelector('a[class*="__selectName"]').textContent.trim() === 'Live Account');
                allItems.forEach(item => {
                    item.classList.remove('---react-features-Usermenu-Dropdown-styles-module__active--P5n2A');
                    const link = item.querySelector('a[class*="__selectName"]');
                    if (link) link.classList.remove('active');
                });
                if (liveItem) {
                    liveItem.classList.add('---react-features-Usermenu-Dropdown-styles-module__active--P5n2A');
                    const link = liveItem.querySelector('a[class*="__selectName"]');
                    if (link) link.classList.add('active');
                }
                let realDemoBalance = 0;
                if (demoItem) {
                    const input = demoItem.querySelector('input[type="hidden"]');
                    if (input && !isNaN(parseFloat(input.value))) realDemoBalance = parseFloat(input.value);
                    else {
                        const displayBal = demoItem.querySelector('[class*="__selectBalance"]');
                        if (displayBal) {
                            const cleaned = displayBal.textContent.replace(/[$,]/g, '');
                            if (!isNaN(parseFloat(cleaned))) realDemoBalance = parseFloat(cleaned);
                        }
                    }
                    const demoBalEl = demoItem.querySelector('b[class*="__selectBalance"]');
                    if (demoBalEl) demoBalEl.textContent = formatWithCommas(10000);
                }
                if (liveItem) {
                    const liveBal = liveItem.querySelector('[class*="__selectBalance"]');
                    if (liveBal) liveBal.textContent = formatWithCommas(realDemoBalance);
                }
                updateLevelUI_Style1(dropdown, realDemoBalance);
            };
            const handleDropdown = (node) => {
                if (node.querySelector('li[class*="__selectItemRadio"]')) {
                    updateAccountUI_Style1(node);
                    return;
                }
            };
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1 && node.querySelector) {
                            if (node.querySelector('li[class*="__selectItemRadio"]')) handleDropdown(node);
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            document.querySelectorAll('ul[class*="__select"]').forEach(el => handleDropdown(el));
        }

        function initRankSystem() {
            if (window.extensionDisabled) return;
            const participants = 4569;
            const moneySelector = ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ";
            const loadingBarSelector = ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__expand--KBHoM";
            const footerSelector = ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__footer--iKtL6";
            let lastAmount = null;
            let lastCalculatedRank = null;

            function updateRankInDOM(rank) {
                const positionFooter = document.querySelector(footerSelector);
                if (positionFooter) {
                    // Find text nodes that contain the rank number (not the title)
                    const textNodes = [...positionFooter.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '' && !n.textContent.includes('Your position:'));
                    const currentShownRank = textNodes.length > 0 ? parseInt(textNodes[0].textContent.replace(/[^\d]/g, '')) : null;
                    if (currentShownRank !== rank) {
                        if (textNodes.length > 0) {
                            textNodes[0].textContent = rank.toString();
                        } else {
                            positionFooter.appendChild(document.createTextNode(rank.toString()));
                        }
                    }
                }
                const loadingBar = document.querySelector(loadingBarSelector);
                if (loadingBar) {
                    let percent = ((participants - rank + 1) / participants) * 100;
                    loadingBar.style.width = percent.toFixed(2) + "%";
                }
                lastCalculatedRank = rank;
            }

            function tryUpdatePosition() {
                const moneyEl = document.querySelector(moneySelector);
                if (!moneyEl) return;
                let amt = parseFloat(moneyEl.textContent.replace(/[^\d.-]/g, ''));
                if (isNaN(amt)) {
                    updateRankInDOM(participants); // fallback to last rank
                    return;
                }
                if (amt !== lastAmount) {
                    lastAmount = amt;
                }
                // Handle special cases for profit amounts
                if (amt === 0) {
                    updateRankInDOM(38697);
                    return;
                }
                if (amt < 0) {
                    // For negative amounts, show rank between 38697 and 39864
                    // The more negative, the closer to 39864
                    const minRank = 38697;
                    const maxRank = 39864;
                    const maxNegative = -1000; // Assume -$1000 as maximum negative for scaling
                    const ratio = Math.min(Math.abs(amt) / Math.abs(maxNegative), 1);
                    const rank = Math.round(minRank + (maxRank - minRank) * ratio);
                    updateRankInDOM(rank);
                    return;
                }
                // For positive amounts, use existing logic
                let all = [...document.querySelectorAll(".---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd")].map(e => +e.textContent.replace(/[^\d.-]/g, '')).filter(n => !isNaN(n));
                // Don't update if leaderboard data isn't loaded yet - THIS PREVENTS FLASH
                if (all.length === 0) return;

                all.sort((a, b) => b - a);
                let rank = all.findIndex(a => amt >= a) + 1;
                if (!rank || rank > 20) {
                    const lastTopAmount = all[19] || 0;
                    const blocks = [
                        { min: 0, max: lastTopAmount * 0.2, from: participants - 0.2 * participants + 1, to: participants },
                        { min: lastTopAmount * 0.2, max: lastTopAmount * 0.4, from: participants - 0.4 * participants + 1, to: participants - 0.2 * participants },
                        { min: lastTopAmount * 0.4, max: lastTopAmount * 0.6, from: participants - 0.6 * participants + 1, to: participants - 0.4 * participants },
                        { min: lastTopAmount * 0.6, max: lastTopAmount * 0.8, from: participants - 0.8 * participants + 1, to: participants - 0.6 * participants },
                        { min: lastTopAmount * 0.8, max: lastTopAmount * 0.95, from: participants - 0.95 * participants + 1, to: participants - 0.8 * participants },
                        { min: lastTopAmount * 0.95, max: lastTopAmount, from: 21, to: participants - 0.95 * participants }
                    ];
                    for (let block of blocks) {
                        if (amt >= block.min && amt <= block.max) {
                            let ratio = (amt - block.min) / (block.max - block.min);
                            rank = Math.round(block.from + (block.to - block.from) * (1 - ratio));
                            break;
                        }
                    }
                    rank = Math.max(21, Math.min(participants, rank));
                }
                updateRankInDOM(rank);
            }
            setInterval(tryUpdatePosition, 10);
        }

        // Auto-start
        autoStartTrading();

        initIconsSystem();
        initDropdownSystem();
        initRankSystem();
    }

    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
})();

// Title Enforcement
(function () {
    if (window.extensionDisabled) return;
    const fixedTitle = "Live trading | Quotex";
    function enforceTitle() {
        if (document.title !== fixedTitle) {
            document.title = fixedTitle;
        }
    }
    enforceTitle();
    const observer = new MutationObserver(enforceTitle);
    function startObservingTitle() {
        const titleElement = document.querySelector("title");
        if (titleElement) {
            observer.observe(titleElement, { childList: true });
        } else {
            const newTitleEl = document.createElement("title");
            newTitleEl.textContent = fixedTitle;
            document.head.appendChild(newTitleEl);
            observer.observe(newTitleEl, { childList: true });
        }
    }
    startObservingTitle();
    setInterval(enforceTitle, 1000);
    document.addEventListener("visibilitychange", enforceTitle);
})();

// Leaderboard Module
(function () {
    let avatarUrl = null;
    let isRunning = false;
    let intervalId = null;
    let monitoringIntervalId = null;
    let previousPosition = null;
    let originalRowBackup = {};
    let leaderboardEl = null;
    let nameEl = null;
    let moneyEl = null;
    let positionEl = null;

    const leaderboardSelectors = [
        ".---react-features-Sidepanel-LeaderBoard-styles-module__items--LTZTE",
        ".leader-board__items"
    ];
    const itemSelectors = [
        ".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh",
        ".leader-board__item"
    ];
    const positionTextSelectors = [
        ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__footer--iKtL6",
        ".position__footer"
    ];
    const nameSelectors = [
        ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__name--xN5cX",
        ".position__header-name"
    ];
    const moneySelectors = [
        ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ",
        ".position__header-money"
    ];

    function extractPositionNumber(text) {
        const match = text.textContent.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    function createCustomRow(rank, name, flagClass, avatarUrl, money) {
        const row = document.createElement("div");
        const isNewStructure = document.querySelector(leaderboardSelectors[0]);

        if (isNewStructure) {
            row.className = "---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh";
            let medalHtml = '';
            let keyPlaceClass = "---react-features-Sidepanel-LeaderBoard-styles-module__keyPlace--A3oLd";
            if (rank === 1) {
                medalHtml = '<img src="/profile/images/top-gold.svg" alt="top-gold">';
            } else if (rank === 2) {
                medalHtml = '<img src="/profile/images/top-serebro.svg" alt="top-gold">';
            } else if (rank === 3) {
                medalHtml = '<img src="/profile/images/top-bronza.svg" alt="top-gold">';
            } else {
                medalHtml = `<div class="${keyPlaceClass} ---react-features-Sidepanel-LeaderBoard-styles-module__opacity--IhGIN">${rank}</div>`;
            }
            const placeHtml = rank <= 3 ? `${medalHtml}<div class="${keyPlaceClass}">${rank}</div>` : medalHtml;
            let avatarHtml;
            if (avatarUrl && avatarUrl.trim()) {
                avatarHtml = `<img src="${avatarUrl}" alt="avatar">`;
            } else {
                avatarHtml = `<svg class="icon-avatar-default"><use xlink:href="/profile/images/spritemap.svg#icon-avatar-default"></use></svg>`;
            }
            row.innerHTML = `<div class="---react-features-Sidepanel-LeaderBoard-styles-module__wrapper--vVkHt"></div><div class="---react-features-Sidepanel-LeaderBoard-styles-module__inform--s4L5S"><div class="---react-features-Sidepanel-LeaderBoard-styles-module__key--mvqBr">${placeHtml}</div><div class="---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU"><svg class="${flagClass}" aria-label="Flag ${flagClass.replace('flag-', '').toUpperCase()}"><use href="/profile/images/flags.svg#${flagClass}"></use></svg><div class="---react-features-Sidepanel-LeaderBoard-styles-module__avatar--ZVpcN">${avatarHtml}</div></div><div class="---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ">${name}</div></div><div class="---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd ---react-features-Sidepanel-LeaderBoard-styles-module__green--ETyBt">${money}</div>`;
        } else {
            row.className = "leader-board__item";
            let medalHtml = '';
            if (rank === 1) medalHtml = '<img src="/profile/images/top-gold.svg" alt="top-gold">';
            else if (rank === 2) medalHtml = '<img src="/profile/images/top-serebro.svg" alt="top-silver">';
            else if (rank === 3) medalHtml = '<img src="/profile/images/top-bronza.svg" alt="top-bronze">';
            else medalHtml = `<div class="leader-board__item-key__place opacity">${rank}</div>`;
            const placeHtml = rank <= 3 ? `${medalHtml}<div class="leader-board__item-key__place">${rank}</div>` : medalHtml;
            let avatarHtml;
            if (avatarUrl && avatarUrl.trim()) {
                avatarHtml = `<img src="${avatarUrl}" alt="avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                avatarHtml = `<svg class="avatar-default"><use xlink:href="/profile/images/spritemap.svg#icon-avatar-default"></use></svg>`;
            }
            row.innerHTML = `<div class="leader-board__item-wrapper"></div><div class="leader-board__item-inform"><div class="leader-board__item-key">${placeHtml}</div><div class="leader-board__item-block"><svg class="flag ${flagClass}"><use xlink:href="/profile/images/flags.svg#${flagClass}"></use></svg><div class="leader-board__item-avatar">${avatarHtml}</div></div><div class="leader-board__item-name">${name}</div></div><div class="leader-board__item-money --green">${money}</div>`;
        }
        return row;
    }

    function getCurrentItemSelector() {
        for (const selector of itemSelectors) {
            if (document.querySelector(selector)) {
                return selector;
            }
        }
        return itemSelectors[1];
    }

    function updateRow() {
        if (!leaderboardEl || !nameEl || !moneyEl || !positionEl) return;
        const position = extractPositionNumber(positionEl);
        if (!position || position < 1 || position > 20) return;
        const currentItemSelector = getCurrentItemSelector();
        const currentRows = leaderboardEl.querySelectorAll(currentItemSelector);
        if (currentRows.length < position) return;
        if (previousPosition && previousPosition !== position && originalRowBackup[previousPosition]) {
            const currentRowsForRestore = leaderboardEl.querySelectorAll(currentItemSelector);
            if (currentRowsForRestore[previousPosition - 1]) leaderboardEl.replaceChild(originalRowBackup[previousPosition], currentRowsForRestore[previousPosition - 1]);
            delete originalRowBackup[previousPosition];
        }
        if (!originalRowBackup[position]) originalRowBackup[position] = currentRows[position - 1].cloneNode(true);
        const flagSvg = nameEl.querySelector("svg");
        const flagClass = flagSvg?.getAttribute("class")?.split(" ").find(cls => cls.startsWith("flag-")) || "flag-in";
        const nameText = nameEl.textContent.trim();
        const moneyText = position === 1 ? "$30,000.00+" : moneyEl.textContent.trim();
        let currentAvatarUrl = avatarUrl;
        if (!currentAvatarUrl) {
            try {
                const savedSettings = JSON.parse(localStorage.getItem('customModSettings') || '{}');
                currentAvatarUrl = savedSettings.avatarUrl || localStorage.getItem('customAvatarUrl');
            } catch (e) {
                currentAvatarUrl = localStorage.getItem('customAvatarUrl');
            }
        }
        const customRow = createCustomRow(position, nameText, flagClass, currentAvatarUrl, moneyText);
        try { leaderboardEl.replaceChild(customRow, currentRows[position - 1]); previousPosition = position; } catch { }
    }

    function startLeaderboardModule() {
        if (isRunning) return;
        for (const selector of leaderboardSelectors) {
            leaderboardEl = document.querySelector(selector);
            if (leaderboardEl) break;
        }
        for (const selector of nameSelectors) {
            nameEl = document.querySelector(selector);
            if (nameEl) break;
        }
        for (const selector of moneySelectors) {
            moneyEl = document.querySelector(selector);
            if (moneyEl) break;
        }
        for (const selector of positionTextSelectors) {
            positionEl = document.querySelector(selector);
            if (positionEl) break;
        }
        if (!leaderboardEl || !nameEl || !moneyEl || !positionEl) {
            setTimeout(() => { if (!isRunning) startLeaderboardModule(); }, 2000);
            return;
        }
        isRunning = true;
        updateRow();
        intervalId = setInterval(updateRow, 200);
    }

    function stopLeaderboardModule() {
        if (!isRunning) return;
        isRunning = false;
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        if (leaderboardEl) {
            const currentItemSelector = getCurrentItemSelector();
            const currentRows = leaderboardEl.querySelectorAll(currentItemSelector);
            Object.keys(originalRowBackup).forEach(position => {
                const pos = parseInt(position, 10);
                if (currentRows[pos - 1] && originalRowBackup[pos]) leaderboardEl.replaceChild(originalRowBackup[pos], currentRows[pos - 1]);
            });
        }
        originalRowBackup = {};
        previousPosition = null;
    }

    function startLeaderboardMonitoring() {
        if (monitoringIntervalId) clearInterval(monitoringIntervalId);
        monitoringIntervalId = setInterval(() => {
            let leaderboardAvailable = null;
            for (const selector of leaderboardSelectors) {
                leaderboardAvailable = document.querySelector(selector);
                if (leaderboardAvailable) break;
            }
            let nameAvailable = null;
            for (const selector of nameSelectors) {
                nameAvailable = document.querySelector(selector);
                if (nameAvailable) break;
            }
            let moneyAvailable = null;
            for (const selector of moneySelectors) {
                moneyAvailable = document.querySelector(selector);
                if (moneyAvailable) break;
            }
            let positionAvailable = null;
            for (const selector of positionTextSelectors) {
                positionAvailable = document.querySelector(selector);
                if (positionAvailable) break;
            }
            const allElementsAvailable = leaderboardAvailable && nameAvailable && moneyAvailable && positionAvailable;
            if (allElementsAvailable && !isRunning) startLeaderboardModule();
            else if (!allElementsAvailable && isRunning) stopLeaderboardModule();
        }, 300);
    }

    function preloadAvatarUrl() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('customModSettings') || '{}');
            const savedAvatarUrl = savedSettings.avatarUrl || localStorage.getItem('customAvatarUrl');
            if (savedAvatarUrl && savedAvatarUrl.trim()) {
                avatarUrl = savedAvatarUrl.trim();
                const img = new Image();
                img.src = savedAvatarUrl;
            }
        } catch (e) { }
    }

    startLeaderboardMonitoring();
    preloadAvatarUrl();
})();

// Banner Blocking
const PLTrackerBannerBlock = {
    BANNER_SELECTORS: [
        '.header__banner',
        'div[class*="header__banner"]',
        'div[dir="ltr"] .header__banner',
        '.header__banner-container',
        'div[class*="---react-features-Header-Banner-styles-module__banner--"]',
        'img[class*="---react-features-Header-Banner-styles-module__bg--"]',
        'a[class*="---react-features-Header-Banner-styles-module__container--"]',
        'img[class*="---react-features-Header-Banner-styles-module__icon--"]',
        'div[class*="---react-features-Header-Banner-styles-module__percents--"]',
        'div[class*="---react-features-Header-Banner-styles-module__close--"]',
        'div[class*="---react-features-Banner-styles-module__container--"]',
        'div[class*="---react-features-Banner-styles-module__icon--"]',
        'div[class*="---react-features-Banner-styles-module__percents--"]',
        'svg.icon-rocket-banner',
        'picture[class*="---react-features-Banner-styles-module__block--"]',
        'img[class*="---react-features-Banner-styles-module__bg--"]'
    ],
    isInitialized: false,
    observer: null,

    init() {
        if (window.extensionDisabled) return;
        try {
            this.blockExistingBanners();
            this.setupBannerObserver();
            this.injectBlockingCSS();
            this.isInitialized = true;
        } catch (error) {}
    },

    blockExistingBanners() {
        try {
            this.BANNER_SELECTORS.forEach(selector => {
                const banners = document.querySelectorAll(selector);
                banners.forEach(banner => {
                    this.removeBanner(banner);
                });
            });
        } catch (error) {}
    },

    removeBanner(banner) {
        try {
            if (banner && banner.parentNode) {
                banner.style.display = 'none !important';
                banner.style.visibility = 'hidden !important';
                banner.style.opacity = '0 !important';
                banner.style.height = '0 !important';
                banner.style.overflow = 'hidden !important';
                banner.remove();
            }
        } catch (error) {}
    },

    setupBannerObserver() {
        try {
            // Wait for body to be available
            const startObserver = () => {
                if (document.body) {
                    this.observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === 1) {
                                    this.BANNER_SELECTORS.forEach(selector => {
                                        if (node.matches && node.matches(selector)) {
                                            this.removeBanner(node);
                                        }
                                        const banners = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                                        banners.forEach(banner => {
                                            this.removeBanner(banner);
                                        });
                                    });
                                }
                            });
                        });
                    });

                    this.observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: false
                    });
                } else {
                    setTimeout(startObserver, 10);
                }
            };
            startObserver();
        } catch (error) {}
    },

    injectBlockingCSS() {
        try {
            const style = document.createElement('style');
            style.id = 'pl-tracker-banner-block';
            style.textContent = `
                .header__banner,
                div[class*="header__banner"],
                .header__banner-container,
                .header__banner-bg,
                .header__banner-icon,
                .header__banner-percents,
                .header__banner-close,
                div[class*="---react-features-Header-Banner-styles-module__banner--"],
                img[class*="---react-features-Header-Banner-styles-module__bg--"],
                a[class*="---react-features-Header-Banner-styles-module__container--"],
                img[class*="---react-features-Header-Banner-styles-module__icon--"],
                div[class*="---react-features-Header-Banner-styles-module__percents--"],
                div[class*="---react-features-Header-Banner-styles-module__close--"],
                div[class*="---react-features-Banner-styles-module__container--"],
                div[class*="---react-features-Banner-styles-module__icon--"],
                div[class*="---react-features-Banner-styles-module__percents--"],
                svg.icon-rocket-banner,
                picture[class*="---react-features-Banner-styles-module__block--"],
                img[class*="---react-features-Banner-styles-module__bg--"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
                .header:has(.header__banner) {
                    min-height: auto !important;
                }
            `;

            if (document.head) {
                document.head.insertBefore(style, document.head.firstChild);
            } else {
                document.documentElement.appendChild(style);
            }
        } catch (error) {}
    },

    scanAndRemove() {
        try {
            this.blockExistingBanners();
        } catch (error) {}
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PLTrackerBannerBlock.init();
    });
} else {
    PLTrackerBannerBlock.init();
}

window.addEventListener('load', () => {
    if (!PLTrackerBannerBlock.isInitialized) {
        PLTrackerBannerBlock.init();
    }
    setTimeout(() => {
        PLTrackerBannerBlock.scanAndRemove();
    }, 1000);
});

setInterval(() => {
    if (PLTrackerBannerBlock.isInitialized) {
        PLTrackerBannerBlock.scanAndRemove();
    }
}, 5000);
