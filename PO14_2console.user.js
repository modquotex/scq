// ==UserScript==
// @name         PO Premium - Coder Saurav
// @namespace    https://t.me/codersaurav
// @version      1.0.0
// @description  Premium Level Extension by @codersaurav - Master Level Default
// @author       Coder Saurav
// @match        *://pocketoption.com/*
// @match        *://m.pocketoption.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      firebasedatabase.app
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const DEFAULT_SETTINGS = {
        level: 'master',
        achievements: {
            level: '5',
            progress: '65%',
            curExp: '3280',
            nextExp: '5000',
            gems: { red: 20, blue: 12, green: 9, secret: 2 },
            medals: {
                bronze: [52, 107],
                silver: [23, 62],
                gold: [20, 44]
            }
        }
    };

    const LEVEL_SVGS = {
        beginner: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_56_499)"><path d="M19.2563 0C20.2507 0 21.2048 0.559494 21.528 1.68009L24.4647 11.8795L34.35 15.5859C36.5253 16.4023 36.2892 19.5778 33.9957 20.3942L23.5603 24.0975L19.1133 34.2915C18.6254 35.4152 17.5906 35.9739 16.5962 35.9739C15.6017 35.9739 14.6508 35.4121 14.3245 34.2915L11.3847 24.1006L1.50246 20.3911C-0.669771 19.5748 -0.43981 16.3992 1.85361 15.5859L12.289 11.8796L16.7391 1.68245C17.227 0.56185 18.265 0 19.2563 0Z" fill="#32AC41"/></g><defs><clipPath id="clip0_56_499"><rect width="40" height="40" fill="white"/></clipPath></defs></svg>`,
        master: `<svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_56_487)"><path d="M17.0072 0C17.1027 0 17.1958 0.0138477 17.289 0.0441154C17.6801 0.169843 17.9269 0.542266 17.8967 0.966014L17.2564 9.63657L23.0119 9.63899C23.3681 9.63899 23.6801 9.8369 23.8221 10.1559C23.9665 10.4725 23.9153 10.8567 23.6894 11.1501L11.9991 26.5681C11.7989 26.8358 11.4892 26.9871 11.1795 26.9871C11.0841 26.9871 10.9886 26.9731 10.8978 26.9429C10.5067 26.8172 10.2599 26.4469 10.2901 26.0255L10.9328 17.3503L5.17722 17.3504C4.82099 17.3504 4.50899 17.1524 4.36464 16.8334C4.22261 16.5168 4.27383 16.1349 4.49735 15.8392L16.1877 0.41897C16.3879 0.151217 16.6976 0 17.0072 0Z" fill="#225AAC"/></g><defs><clipPath id="clip0_56_487"><rect width="30" height="30" fill="white"/></clipPath></defs></svg>`,
        guru: `<svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_56_491)"><path d="M14.2146 0C19.9818 0.887078 22.0912 6.45635 18.9969 10.3749L25.43 6.79627C27.6815 12.0442 23.6326 16.6123 19.2251 16.6123C18.8689 16.6123 18.5103 16.5821 18.1541 16.5215L24.373 20.291C22.671 22.6403 20.4777 23.6531 18.4428 23.6531C15.8677 23.6531 13.5441 22.0349 12.7781 19.4482L12.2216 26.9872C6.06796 26.6426 4.54992 20.4959 7.68613 16.6682L1.1739 20.291C-0.493151 15.0198 2.99695 10.2421 7.44631 10.2421C7.56738 10.2421 7.69312 10.2468 7.81419 10.2538L2.11221 6.79858C4.01907 4.60301 6.37064 3.58091 8.49637 3.58091C10.7711 3.58091 12.7851 4.75436 13.7048 6.91268L14.2146 0Z" fill="#E3A02D"/></g><defs><clipPath id="clip0_56_491"><rect width="30" height="30" fill="white"/></clipPath></defs></svg>`
    };

    const LEVEL_COLORS = { beginner: '#32ac41', master: '#002cd2', guru: '#E3A02D' };
    const LEVEL_NAMES = { beginner: 'Beginner', master: 'Master', guru: 'Guru' };
    const LEVEL_NUMBERS = { beginner: 0, master: 1, guru: 2 };

    const FIXED_BALANCE = '50,000.00';

    console.log('%c╔═══════════════════════════════════════════════════════════════════════════════╗', 'color: #40E0D0; font-weight: bold;');
    console.log('%c║                                                                               ║', 'color: #40E0D0; font-weight: bold;');
    console.log('%c║                          ██████╗ ██████╗ ██████╗ ███████╗██████╗             ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                         ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗            ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                         ██║     ██║   ██║██║  ██║█████╗  ██████╔╝            ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                         ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗            ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                         ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║            ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                          ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝            ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                                                                               ║', 'color: #40E0D0; font-weight: bold;');
    console.log('%c║                    ███████╗ █████╗ ██╗   ██╗██████╗  █████╗ ██╗   ██╗       ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                    ██╔════╝██╔══██╗██║   ██║██╔══██╗██╔══██╗██║   ██║       ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                    ███████╗███████║██║   ██║██████╔╝███████║██║   ██║       ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                    ╚════██║██╔══██║██║   ██║██╔══██╗██╔══██║╚██╗ ██╔╝       ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                    ███████║██║  ██║╚██████╔╝██║  ██║██║  ██║ ╚████╔╝        ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                    ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝         ║', 'color: #55f8f3; font-weight: bold;');
    console.log('%c║                                                                               ║', 'color: #40E0D0; font-weight: bold;');
    console.log('%c║                      🚀 PocketOption Premium Mod v1.0.0 🚀                   ║', 'color: #40E0D0; font-weight: bold;');
    console.log('%c║                      ✅ Master Level Active | Licensed                        ║', 'color: #10b981; font-weight: bold;');
    console.log('%c║                      📱 Contact: @codersaurav | +919920015661                ║', 'color: #0088cc; font-weight: bold;');
    console.log('%c║                                                                               ║', 'color: #40E0D0; font-weight: bold;');
    console.log('%c╚═══════════════════════════════════════════════════════════════════════════════╝', 'color: #40E0D0; font-weight: bold;');

    class LicenseManager {
        constructor() {
            this.firebaseUrl = this.getSecureEndpoint();
            this.licenseKey = null;
            this.fingerprint = null;
            this.isValidated = false;
        }

        getSecureEndpoint() {
            const parts = [
                'https://',
                atob('cG9jb2RlcnNhdXJhdg=='),
                '-default-rtdb.',
                'asia-southeast1.',
                ['f', 'i', 'r', 'e', 'b', 'a', 's', 'e', 'd', 'a', 't', 'a', 'b', 'a', 's', 'e'].join(''),
                '.app'
            ];
            return parts.join('');
        }

        async generateFingerprint() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillText('FP', 2, 2);
                const canvasHash = this.hashString(canvas.toDataURL());

                const webglCanvas = document.createElement('canvas');
                const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
                const webglInfo = gl ? {
                    vendor: (gl.getParameter(gl.VENDOR) || '').substring(0, 20),
                    renderer: (gl.getParameter(gl.RENDERER) || '').substring(0, 20)
                } : { vendor: 'unknown', renderer: 'unknown' };

                const fingerprintData = {
                    c: canvasHash,
                    w: webglInfo,
                    s: `${screen.width}x${screen.height}`,
                    t: new Date().getTimezoneOffset(),
                    l: navigator.language,
                    p: navigator.platform.substring(0, 10),
                    u: this.hashString(navigator.userAgent)
                };

                const fingerprintString = JSON.stringify(fingerprintData);
                this.fingerprint = btoa(fingerprintString);
                return this.fingerprint;
            } catch (error) {
                return null;
            }
        }

        hashString(str) {
            let hash = 0;
            if (str.length === 0) return hash.toString();
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        }

        async validateLicense(licenseKey) {
            const maxRetries = 3;
            let lastError = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    if (!this.fingerprint) {
                        await this.generateFingerprint();
                    }

                    const response = await new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: `${this.firebaseUrl}/extension_access/${licenseKey}.json`,
                            timeout: 10000,
                            onload: (res) => resolve(res),
                            onerror: (err) => reject(err),
                            ontimeout: () => reject(new Error('Request timeout'))
                        });
                    });

                    if (response.status === 404) {
                        return { valid: false, error: 'License not found' };
                    } else if (response.status >= 500) {
                        throw new Error(`Server error: ${response.status}`);
                    } else if (response.status !== 200) {
                        return { valid: false, error: 'Connection failed. Please check your internet connection.' };
                    }

                    const licenseData = JSON.parse(response.responseText);

                    if (!licenseData) {
                        return { valid: false, error: 'Invalid license key' };
                    }

                    // Check if license exists but is deleted/inactive
                    if (licenseData.status === 'deleted' || licenseData.status === 'revoked') {
                        return { valid: false, error: 'License has been revoked' };
                    }

                    if (licenseData.status !== 'active') {
                        return { valid: false, error: `License is ${licenseData.status}` };
                    }

                    if (licenseData.fingerprint && licenseData.fingerprint !== this.fingerprint) {
                        return { valid: false, error: 'License already used on another device' };
                    }

                    if (!licenseData.fingerprint) {
                        await this.bindLicenseToDevice(licenseKey, licenseData);
                    } else {
                        await this.updateLastUsed(licenseKey);
                    }

                    return {
                        valid: true,
                        data: licenseData,
                        userName: licenseData.name
                    };

                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                        continue;
                    }
                    break;
                }
            }

            if (lastError) {
                if (lastError.message.includes('timeout')) {
                    return { valid: false, error: 'Request timed out. Please check your internet connection and try again.' };
                } else {
                    return { valid: false, error: 'Validation failed. Please try again later.' };
                }
            }
            return { valid: false, error: 'Validation failed after multiple attempts.' };
        }

        async bindLicenseToDevice(licenseKey, licenseData) {
            try {
                const timestamp = new Date().toISOString();
                await this.safeFirebaseUpdate(`${this.firebaseUrl}/extension_access/${licenseKey}/fingerprint.json`, this.fingerprint);
                await this.safeFirebaseUpdate(`${this.firebaseUrl}/extension_access/${licenseKey}/lastUsed.json`, timestamp);
                await this.safeFirebaseUpdate(`${this.firebaseUrl}/extension_access/${licenseKey}/lastModified.json`, timestamp);
            } catch (error) { }
        }

        async safeFirebaseUpdate(url, data) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'PUT',
                    url: url,
                    data: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    onload: (response) => {
                        if (response.status >= 200 && response.status < 300) {
                            resolve(JSON.parse(response.responseText));
                        } else {
                            reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                        }
                    },
                    onerror: (err) => reject(err)
                });
            });
        }

        async updateLastUsed(licenseKey) {
            try {
                const timestamp = new Date().toISOString();
                await this.safeFirebaseUpdate(`${this.firebaseUrl}/extension_access/${licenseKey}/lastUsed.json`, timestamp);
            } catch (error) { }
        }

        async saveLicenseToStorage(licenseKey, userData) {
            const data = {
                licenseKey,
                fingerprint: this.fingerprint,
                userName: userData.name || 'User',
                licenseValidated: true,
                timestamp: Date.now()
            };
            GM_setValue('licenseKey', data.licenseKey);
            GM_setValue('fingerprint', data.fingerprint);
            GM_setValue('userName', data.userName);
            GM_setValue('licenseValidated', data.licenseValidated);
            GM_setValue('timestamp', data.timestamp);
        }

        async loadLicenseFromStorage() {
            const licenseKey = GM_getValue('licenseKey');
            const fingerprint = GM_getValue('fingerprint');
            const userName = GM_getValue('userName');
            const licenseValidated = GM_getValue('licenseValidated');

            if (licenseKey && fingerprint && licenseValidated) {
                this.licenseKey = licenseKey;
                this.fingerprint = fingerprint;
                return {
                    licenseKey: licenseKey,
                    userData: { name: userName || 'User' }
                };
            }
            return null;
        }

        async clearLicenseFromStorage() {
            GM_deleteValue('licenseKey');
            GM_deleteValue('fingerprint');
            GM_deleteValue('userName');
            GM_deleteValue('licenseValidated');
            GM_deleteValue('timestamp');
        }
    }

    async function checkLicense() {
        const licenseManager = new LicenseManager();
        const stored = await licenseManager.loadLicenseFromStorage();
        
        if (stored) {
            // Load features immediately with stored license
            console.log('[License] ✅ Stored license found - loading features...');
            
            // Validate in background (non-blocking)
            setTimeout(async () => {
                console.log('[License] Background validation started...');
                const result = await licenseManager.validateLicense(stored.licenseKey);
                
                if (!result.valid) {
                    console.log('[License] ❌ Background validation failed:', result.error);
                    await licenseManager.clearLicenseFromStorage();
                    
                    // Show alert and reload
                    alert('⚠️ License Validation Failed\n\n' + result.error + '\n\nPlease contact @codersaurav');
                    location.reload();
                } else {
                    console.log('[License] ✅ Background validation successful');
                }
            }, 2000); // 2 seconds delay for background check
            
            // Periodic validation every 10 minutes
            setInterval(async () => {
                console.log('[License] Periodic validation check...');
                const recheck = await licenseManager.validateLicense(stored.licenseKey);
                if (!recheck.valid) {
                    console.log('[License] ❌ License revoked or expired');
                    await licenseManager.clearLicenseFromStorage();
                    alert('⚠️ Your license has been revoked or expired.\n\nPlease contact @codersaurav for renewal.');
                    location.reload();
                }
            }, 10 * 60 * 1000); // 10 minutes
            
            return true;
        } else {
            // No stored license - show overlay immediately
            console.log('[License] ❌ No stored license found');
            showLicenseOverlay();
            return false;
        }
    }

    function showLicenseOverlay() {
        if (document.getElementById('pl-license-overlay')) return;

        // Wait for body to be available
        if (!document.body) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showLicenseOverlay, { once: true });
            } else {
                setTimeout(showLicenseOverlay, 100);
            }
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'pl-license-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #000000 0%, #00171f 50%, #020002 100%);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
            ">
                <div style="
                    position: relative;
                    max-width: 500px;
                    padding: 40px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 20px;
                        margin: 0 auto 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.7 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
                        </svg>
                    </div>
                    <h1 style="font-size: 32px; margin: 0 0 12px 0; color: #55f8f3; text-shadow: 0 0 15px rgba(85, 248, 243, 0.4);">CODER SAURAV</h1>
                    <h2 style="font-size: 18px; margin: 0 0 30px 0; color: #ffffff;">License Required</h2>
                    <input type="text" id="license-input" placeholder="Enter License Key" style="
                        width: 100%;
                        padding: 15px;
                        margin-bottom: 15px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 10px;
                        color: white;
                        font-size: 14px;
                        text-align: center;
                        outline: none;
                    ">
                    <button id="validate-btn" style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 15px;
                    ">Validate License</button>
                    <button onclick="window.open('https://t.me/codersaurav', '_blank')" style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Get License Key</button>
                    <div id="license-error" style="
                        margin-top: 15px;
                        padding: 10px;
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid #ef4444;
                        border-radius: 8px;
                        color: #ef4444;
                        font-size: 13px;
                        display: none;
                    "></div>
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: rgba(255,255,255,0.6);">
                    Created by <span style="color: #0088cc; font-weight: 500;">@codersaurav</span>
                </p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add validation logic
        const validateBtn = document.getElementById('validate-btn');
        const licenseInput = document.getElementById('license-input');
        const errorDiv = document.getElementById('license-error');

        validateBtn.addEventListener('click', async () => {
            const key = licenseInput.value.trim();
            if (!key) {
                errorDiv.textContent = 'Please enter a license key';
                errorDiv.style.display = 'block';
                return;
            }

            validateBtn.textContent = 'Validating...';
            validateBtn.disabled = true;
            errorDiv.style.display = 'none';

            const licenseManager = new LicenseManager();
            const result = await licenseManager.validateLicense(key);

            if (result.valid) {
                await licenseManager.saveLicenseToStorage(key, result.data);
                overlay.remove();
                location.reload();
            } else {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
                validateBtn.textContent = 'Validate License';
                validateBtn.disabled = false;
            }
        });

        licenseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') validateBtn.click();
        });
    }

    // Check license before running any features
    checkLicense().then(isLicensed => {
        if (!isLicensed) {
            console.log('[License] ❌ No valid license - features blocked');
            return;
        }

        console.log('[License] 🚀 Loading all features...');
        // All features run immediately if stored license exists
        // Background validation will handle invalid licenses
        runAllFeatures();
    }).catch(err => {
        console.error('[License] Error during check:', err);
        // Even on error, if stored license exists, load features
        const stored = GM_getValue('licenseValidated');
        if (stored) {
            console.log('[License] ⚠️ Error but stored license exists - loading features anyway');
            runAllFeatures();
        } else {
            showLicenseOverlay();
        }
    });

    function runAllFeatures() {

    const currentLevel = DEFAULT_SETTINGS.level;
    const LEVEL_SVG = LEVEL_SVGS[currentLevel];
    const LEVEL_NAME = LEVEL_NAMES[currentLevel];
    const LEVEL_NUM = LEVEL_NUMBERS[currentLevel];
    const LEVEL_COLOR = LEVEL_COLORS[currentLevel];

    const bannerStyle = document.createElement('style');
    bannerStyle.textContent = `
        .right-block__item.bonus-btn-wrap { display: none !important; }
        .balance-info-block__label { 
            visibility: hidden; 
            position: relative; 
        }
        .balance-info-block__label::after { 
            content: "QT Real"; 
            visibility: visible; 
            position: absolute; 
            left: 0;
        }
        
        /* Force Demo label to show Real */
        .type-of-trade-label--demo {
            background-color: #025b44 !important;
        }
        .type-of-trade-label--demo::before {
            content: "You are trading on Real account" !important;
            display: block !important;
            color: white !important;
        }
        .type-of-trade-label--demo a,
        .type-of-trade-label--demo > *:not(::before) {
            display: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(bannerStyle);

    // Cleanup bonus buttons
    const cleanupBonusButtons = () => {
        document.querySelectorAll('.right-block__item.bonus-btn-wrap').forEach(n => n.remove());
    };

    if (document.body) {
        cleanupBonusButtons();
    } else {
        document.addEventListener('DOMContentLoaded', cleanupBonusButtons, { once: true });
    }

    const aiTradingStyle = document.createElement('style');
    aiTradingStyle.id = 'ai-trading-style';
    aiTradingStyle.textContent = `
        .button-ai-trading-wrap {
            opacity: 1;
        }
        .ai-trading-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }
        .ai-trading-btn__icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ai-trading-btn__badge {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ai-trading-btn__text {
            font-weight: 500;
        }
    `;
    (document.head || document.documentElement).appendChild(aiTradingStyle);

    const AI_TRADING_HTML = `<div class="action-high-low button-ai-trading-wrap"><a class="ai-trading-btn"><div class="ai-trading-btn__icon"><div class="ai-trading-btn__badge"><div><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" role="img"><g filter="url(#filter0_i_ai_trading)"><path d="M16.835 21.1405H12.2638L14.3219 15.0961C14.3363 15.0239 14.3652 14.9661 14.4086 14.9228C14.4663 14.8794 14.5313 14.8578 14.6035 14.8578C14.6758 14.8578 14.7335 14.8794 14.7769 14.9228C14.8346 14.9516 14.878 15.0094 14.9068 15.0961L16.835 21.1405Z" fill="url(#paint0_linear_ai_trading)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19.9981 39.9962C31.0427 39.9962 39.9962 31.0427 39.9962 19.9981C39.9962 8.95345 31.0427 0 19.9981 0C8.95345 0 0 8.95345 0 19.9981C0 31.0427 8.95345 39.9962 19.9981 39.9962ZM11.4622 13.6662L6.54431 27.0766H10.3356L11.3322 24.1519H17.7666L18.7198 27.0766H22.6411L17.7016 13.6445C17.4561 12.9657 17.0516 12.4674 16.4884 12.1497C15.9251 11.8175 15.2896 11.6514 14.5819 11.6514C13.8742 11.6514 13.2387 11.8247 12.6754 12.1713C12.1121 12.5035 11.7077 13.0018 11.4622 13.6662ZM23.6196 24.0436V27.0766H32.4804V24.0436H29.859V14.9444H32.4804V11.9114H23.6196V14.9444H26.241V24.0436H23.6196Z" fill="url(#paint1_linear_ai_trading)"/><path class="path" fill-rule="evenodd" clip-rule="evenodd" d="M19.9981 39.9962C31.0427 39.9962 39.9962 31.0427 39.9962 19.9981C39.9962 8.95345 31.0427 0 19.9981 0C8.95345 0 0 8.95345 0 19.9981C0 31.0427 8.95345 39.9962 19.9981 39.9962ZM11.4622 13.6662L6.54431 27.0766H10.3356L11.3322 24.1519H17.7666L18.7198 27.0766H22.6411L17.7016 13.6445C17.4561 12.9657 17.0516 12.4674 16.4884 12.1497C15.9251 11.8175 15.2896 11.6514 14.5819 11.6514C13.8742 11.6514 13.2387 11.8247 12.6754 12.1713C12.1121 12.5035 11.7077 13.0018 11.4622 13.6662ZM23.6196 24.0436V27.0766H32.4804V24.0436H29.859V14.9444H32.4804V11.9114H23.6196V14.9444H26.241V24.0436H23.6196Z" fill="url(#fill_ai_trading)"/></g><defs><filter id="filter0_i_ai_trading" x="0" y="0" width="39.9962" height="39.9961" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="1"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><linearGradient id="paint0_linear_ai_trading" x1="27.4984" y1="-1.04364" x2="21.6656" y2="18.9545" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient><linearGradient id="paint1_linear_ai_trading" x1="27.4984" y1="-1.04364" x2="21.6656" y2="18.9545" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient><linearGradient id="fill_ai_trading" x1="27.4984" y1="-1.04364" x2="21.6656" y2="18.9545" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="0" stop-color="white"/></linearGradient></defs></svg></div></div></div><div class="ai-trading-btn__text">Trading</div></a></div>`;

    let aiInjected = false;
    function injectAITradingButton() {
        if (aiInjected) return;
        const container = document.querySelector('.tour-action-buttons-container:not(.has-ai-trading)');
        if (!container) return;
        const buyButton = container.querySelector('.button-call-wrap');
        if (!buyButton) return;
        if (container.querySelector('.button-ai-trading-wrap')) {
            container.classList.add('has-ai-trading');
            aiInjected = true;
            return;
        }
        buyButton.insertAdjacentHTML('afterend', AI_TRADING_HTML);
        container.classList.add('has-ai-trading');
        aiInjected = true;
    }

    injectAITradingButton();
    const aiObserver = new MutationObserver(() => {
        if (!aiInjected) injectAITradingButton();
    });

    const startAIObserver = () => {
        aiObserver.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.body) {
        startAIObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startAIObserver, { once: true });
    }

    const levelSelector = '.user-avatar__profile-level-icon';

    const updateBadge = (badge) => {
        badge.className = badge.className.replace(/your-level-badge--\d/, `your-level-badge--${LEVEL_NUM}`);
        badge.setAttribute('data-level', LEVEL_NUM);
        badge.style.backgroundColor = LEVEL_COLOR;
        const link = badge.querySelector('a');
        if (link) link.textContent = LEVEL_NAME;
    };

    let isApplyingLevel = false;
    const applyLevelChanges = () => {
        if (isApplyingLevel) return;
        isApplyingLevel = true;
        try {
            document.querySelectorAll(levelSelector).forEach(el => {
                if (el.innerHTML.trim() !== LEVEL_SVG.trim()) el.innerHTML = LEVEL_SVG;
            });
            document.querySelectorAll('.tooltip-content .tooltip-text').forEach(el => {
                const text = el.textContent.toLowerCase();
                if ((text === 'beginner' || text === 'master' || text === 'guru') && el.textContent !== LEVEL_NAME) {
                    el.textContent = LEVEL_NAME;
                }
            });
            document.querySelectorAll('.your-level-badge').forEach(updateBadge);
            document.querySelectorAll('.header-avatar__chat-counter').forEach(el => el.remove());
            
            const oldStyle = document.getElementById('level-custom-style');
            if (oldStyle) oldStyle.remove();
            const style = document.createElement('style');
            style.id = 'level-custom-style';
            style.textContent = `.user-avatar--level-0, .user-avatar--level-1, .user-avatar--level-2 { color: ${LEVEL_COLOR} !important; } .your-level-badge { background-color: ${LEVEL_COLOR} !important; }`;
            document.head.appendChild(style);
        } catch (e) {}
        isApplyingLevel = false;
    };

    applyLevelChanges();
    let levelTimeout;
    new MutationObserver(() => { 
        clearTimeout(levelTimeout); 
        levelTimeout = setTimeout(applyLevelChanges, 100); 
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });

    const FAKE = DEFAULT_SETTINGS.achievements;
    const safe = (fn) => { try { fn(); } catch (e) {} };
    let lastState = '';

    const set = (sel, val) => safe(() => {
        const n = document.querySelector(sel);
        if (n && n.textContent !== String(val)) n.textContent = val;
    });

    const setStyle = (sel, prop, val) => safe(() => {
        const n = document.querySelector(sel);
        if (n && n.style[prop] !== val) n.style[prop] = val;
    });

    const fixAccountLabel = () => safe(() => {
        // Find all possible label elements
        const labels = document.querySelectorAll('.type-of-trade-label');
        
        labels.forEach(lbl => {
            // Remove demo class and add real class
            if (lbl.classList.contains('type-of-trade-label--demo')) {
                lbl.classList.remove('type-of-trade-label--demo');
                lbl.classList.add('type-of-trade-label--real');
            }
            
            // Fix the text content
            if (lbl.textContent.includes('Demo account')) {
                lbl.innerHTML = `<a class="mfp-ajax-modal" href="https://pocketoption.com/en/cabinet/ajax/modal/account-comparison/">You are trading on Real account</a>`;
            }
        });
        
        // If no label exists, create one
        if (labels.length === 0) {
            const ach = document.querySelector('.your-achievements');
            if (ach) {
                const lbl = document.createElement('div');
                lbl.className = 'type-of-trade-label type-of-trade-label--real';
                lbl.innerHTML = `<a class="mfp-ajax-modal" href="https://pocketoption.com/en/cabinet/ajax/modal/account-comparison/">You are trading on Real account</a>`;
                ach.parentNode.insertBefore(lbl, ach);
            }
        }
    });

    const injectFake = () => safe(() => {
        const root = document.querySelector('.drop-down-user-info__l');
        if (!root) return;

        const currentState = `${FAKE.level}-${FAKE.progress}-${FAKE.curExp}`;
        if (lastState === currentState && document.querySelector('.wreath-levels__level')?.textContent === String(FAKE.level)) return;
        lastState = currentState;

        set('.wreath-levels__level', FAKE.level);
        setStyle('.progress__bar', 'width', FAKE.progress);
        set('.current-exp', FAKE.curExp);
        set('.next-level-exp', FAKE.nextExp);
        Object.entries(FAKE.gems).forEach(([c, v]) => set(`.js-${c}-gem-count`, v));
        ['bronze', 'silver', 'gold'].forEach(m => {
            set(`.js-${m}-awards-current-count`, FAKE.medals[m][0]);
            set(`.js-${m}-awards-total-count`, FAKE.medals[m][1]);
        });
    });

    const killChatCounter = () => safe(() => {
        document.querySelectorAll('.header-avatar__chat-counter').forEach(n => n.remove());
    });

    const runAchievements = () => { 
        fixAccountLabel(); 
        injectFake(); 
        killChatCounter(); 
    };

    runAchievements();
    let achTimeout;
    const achObserver = new MutationObserver(() => {
        clearTimeout(achTimeout);
        achTimeout = setTimeout(runAchievements, 100);
    });

    if (document.body) {
        achObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            achObserver.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Additional aggressive observer for type-of-trade-label
    const labelObserver = new MutationObserver(() => {
        fixAccountLabel();
    });

    // Watch for label changes specifically
    const watchLabel = () => {
        const labels = document.querySelectorAll('.type-of-trade-label');
        labels.forEach(label => {
            labelObserver.observe(label, { 
                attributes: true, 
                attributeFilter: ['class'],
                childList: true,
                characterData: true,
                subtree: true
            });
        });
    };

    // Run label watcher periodically
    setInterval(() => {
        fixAccountLabel();
        watchLabel();
    }, 500);

    function modifyDropdown() {
        // Get the demo element
        const demoBottom = document.querySelector("#ddm_balance > div > div.drop-down-modal__in > div > div.balance-item.balance-item--current.balance-item--demo > div.balance-item__bottom");

        if (demoBottom && !demoBottom.dataset.modified) {
            demoBottom.dataset.modified = 'true';
            // Replace with the real balance structure
            demoBottom.innerHTML = `
                <a class="btn btn-green-v2 js-deposit-btn" href="https://pocketoption.com/en/cabinet/deposit-step-1/" data-deposit-source="header-balances-real">
                    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.1 4.00005H13.3V3.20005C13.3 2.56353 13.0471 1.95308 12.5971 1.50299C12.147 1.05291 11.5365 0.800049 10.9 0.800049H2.9C2.26348 0.800049 1.65303 1.05291 1.20294 1.50299C0.752856 1.95308 0.5 2.56353 0.5 3.20005V12.8C0.5 13.4366 0.752856 14.047 1.20294 14.4971C1.65303 14.9472 2.26348 15.2 2.9 15.2H14.1C14.7365 15.2 15.347 14.9472 15.7971 14.4971C16.2471 14.047 16.5 13.4366 16.5 12.8V6.40005C16.5 5.76353 16.2471 5.15308 15.7971 4.70299C15.347 4.25291 14.7365 4.00005 14.1 4.00005ZM2.9 2.40005H10.9C11.1122 2.40005 11.3157 2.48433 11.4657 2.63436C11.6157 2.78439 11.7 2.98788 11.7 3.20005V4.00005H2.9C2.68783 4.00005 2.48434 3.91576 2.33431 3.76573C2.18429 3.6157 2.1 3.41222 2.1 3.20005C2.1 2.98788 2.18429 2.78439 2.33431 2.63436C2.48434 2.48433 2.68783 2.40005 2.9 2.40005ZM14.9 10.4H14.1C13.8878 10.4 13.6843 10.3158 13.5343 10.1657C13.3843 10.0157 13.3 9.81222 13.3 9.60005C13.3 9.38788 13.3843 9.18439 13.5343 9.03436C13.6843 8.88433 13.8878 8.80005 14.1 8.80005H14.9V10.4ZM14.9 7.20005H14.1C13.4635 7.20005 12.853 7.4529 12.4029 7.90299C11.9529 8.35308 11.7 8.96353 11.7 9.60005C11.7 10.2366 11.9529 10.847 12.4029 11.2971C12.853 11.7472 13.4635 12 14.1 12H14.9V12.8C14.9 13.0122 14.8157 13.2157 14.6657 13.3657C14.5157 13.5158 14.3122 13.6 14.1 13.6H2.9C2.68783 13.6 2.48434 13.5158 2.33431 13.3657C2.18429 13.2157 2.1 13.0122 2.1 12.8V5.46405C2.35701 5.55446 2.62755 5.60045 2.9 5.60005H14.1C14.3122 5.60005 14.5157 5.68433 14.6657 5.83436C14.8157 5.98439 14.9 6.18788 14.9 6.40005V7.20005Z" fill="currentColor"></path>
                    </svg>
                    <span class="btn__text"> Top up </span>
                </a>
                <a href="https://pocketoption.com/en/cabinet/withdrawal/" class="btn btn-blue-v2">
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.99995 8C8.52528 8 8.06126 8.14076 7.66658 8.40447C7.2719 8.66819 6.96429 9.04302 6.78264 9.48156C6.60099 9.9201 6.55346 10.4027 6.64607 10.8682C6.73867 11.3338 6.96725 11.7614 7.30289 12.0971C7.63854 12.4327 8.06618 12.6613 8.53173 12.7539C8.99729 12.8465 9.47985 12.799 9.91839 12.6173C10.3569 12.4357 10.7318 12.128 10.9955 11.7334C11.2592 11.3387 11.4 10.8747 11.4 10.4C11.4 9.76348 11.1471 9.15303 10.697 8.70294C10.2469 8.25286 9.63647 8 8.99995 8ZM8.99995 11.2C8.84173 11.2 8.68705 11.1531 8.5555 11.0652C8.42394 10.9773 8.3214 10.8523 8.26085 10.7061C8.2003 10.56 8.18446 10.3991 8.21532 10.2439C8.24619 10.0887 8.32238 9.9462 8.43427 9.83432C8.54615 9.72243 8.68869 9.64624 8.84388 9.61537C8.99906 9.5845 9.15992 9.60035 9.3061 9.6609C9.45228 9.72145 9.57722 9.82398 9.66513 9.95554C9.75303 10.0871 9.79995 10.2418 9.79995 10.4C9.79995 10.6122 9.71567 10.8157 9.56564 10.9657C9.41561 11.1157 9.21212 11.2 8.99995 11.2ZM8.43195 6.168C8.50803 6.24083 8.59775 6.29792 8.69595 6.336C8.79171 6.37832 8.89526 6.40019 8.99995 6.40019C9.10465 6.40019 9.20819 6.37832 9.30395 6.336C9.40215 6.29792 9.49187 6.24083 9.56795 6.168L11.4 4.368C11.5548 4.21311 11.6419 4.00304 11.6419 3.784C11.6419 3.56496 11.5548 3.35489 11.4 3.2C11.2451 3.04511 11.035 2.9581 10.816 2.9581C10.5969 2.9581 10.3868 3.04511 10.232 3.2L9.79995 3.672V0.8C9.79995 0.587827 9.71567 0.384344 9.56564 0.234315C9.41561 0.0842854 9.21212 0 8.99995 0C8.78778 0 8.5843 0.0842854 8.43427 0.234315C8.28424 0.384344 8.19995 0.587827 8.19995 0.8V3.672L7.76795 3.2C7.61307 3.04511 7.40299 2.9581 7.18395 2.9581C6.96491 2.9581 6.75484 3.04511 6.59995 3.2C6.44507 3.35489 6.35805 3.56496 6.35805 3.784C6.35805 4.00304 6.44507 4.21311 6.59995 4.368L8.43195 6.168ZM14.6 10.4C14.6 10.2418 14.553 10.0871 14.4651 9.95554C14.3772 9.82398 14.2523 9.72145 14.1061 9.6609C13.9599 9.60035 13.7991 9.5845 13.6439 9.61537C13.4887 9.64624 13.3461 9.72243 13.2343 9.83432C13.1224 9.9462 13.0462 10.0887 13.0153 10.2439C12.9845 10.3991 13.0003 10.56 13.0608 10.7061C13.1214 10.8523 13.2239 10.9773 13.3555 11.0652C13.4871 11.1531 13.6417 11.2 13.8 11.2C14.0121 11.2 14.2156 11.1157 14.3656 10.9657C14.5157 10.8157 14.6 10.6122 14.6 10.4ZM15.4 4.8H13C12.7878 4.8 12.5843 4.88429 12.4343 5.03431C12.2842 5.18434 12.2 5.38783 12.2 5.6C12.2 5.81217 12.2842 6.01566 12.4343 6.16569C12.5843 6.31571 12.7878 6.4 13 6.4H15.4C15.6121 6.4 15.8156 6.48429 15.9656 6.63432C16.1157 6.78434 16.2 6.98783 16.2 7.2V13.6C16.2 13.8122 16.1157 14.0157 15.9656 14.1657C15.8156 14.3157 15.6121 14.4 15.4 14.4H2.59995C2.38778 14.4 2.18429 14.3157 2.03427 14.1657C1.88424 14.0157 1.79995 13.8122 1.79995 13.6V7.2C1.79995 6.98783 1.88424 6.78434 2.03427 6.63432C2.18429 6.48429 2.38778 6.4 2.59995 6.4H4.99995C5.21212 6.4 5.41561 6.31571 5.56564 6.16569C5.71567 6.01566 5.79995 5.81217 5.79995 5.6C5.79995 5.38783 5.71567 5.18434 5.56564 5.03431C5.41561 4.88429 5.21212 4.8 4.99995 4.8H2.59995C1.96343 4.8 1.35298 5.05286 0.902895 5.50294C0.452808 5.95303 0.199951 6.56348 0.199951 7.2V13.6C0.199951 14.2365 0.452808 14.847 0.902895 15.2971C1.35298 15.7471 1.96343 16 2.59995 16H15.4C16.0365 16 16.6469 15.7471 17.097 15.2971C17.5471 14.847 17.8 14.2365 17.8 13.6V7.2C17.8 6.56348 17.5471 5.95303 17.097 5.50294C16.6469 5.05286 16.0365 4.8 15.4 4.8ZM3.39995 10.4C3.39995 10.5582 3.44687 10.7129 3.53478 10.8445C3.62268 10.976 3.74762 11.0786 3.8938 11.1391C4.03999 11.1997 4.20084 11.2155 4.35602 11.1846C4.51121 11.1538 4.65375 11.0776 4.76564 10.9657C4.87752 10.8538 4.95371 10.7113 4.98458 10.5561C5.01545 10.4009 4.99961 10.24 4.93905 10.0939C4.8785 9.94767 4.77597 9.82273 4.64441 9.73482C4.51285 9.64692 4.35818 9.6 4.19995 9.6C3.98778 9.6 3.7843 9.68429 3.63427 9.83432C3.48424 9.98434 3.39995 10.1878 3.39995 10.4Z" fill="currentColor"></path>
                    </svg>
                </a>
                <a href="https://pocketoption.com/en/cabinet/ajax/modal/exchange-modal/" class="btn btn-blue-v2 mfp-ajax-modal">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="7.1" stroke="currentColor" stroke-width="1.8"></circle>
                        <path d="M3.06408 6.3379C3.10216 6.2397 3.15925 6.14998 3.23208 6.0739L5.03208 4.2419C5.18697 4.08701 5.39704 4 5.61608 4C5.83512 4 6.04519 4.08701 6.20008 4.2419C6.35497 4.39679 6.44198 4.60686 6.44198 4.8259C6.44198 5.04494 6.35497 5.25501 6.20008 5.4099L5.72808 5.8419L7.93431 5.8419C8.14649 5.8419 8.34997 5.92619 8.5 6.07622C8.65003 6.22624 8.73431 6.42973 8.73431 6.6419C8.73431 6.85407 8.65003 7.05756 8.5 7.20759C8.34997 7.35761 8.14649 7.4419 7.93431 7.4419L5.72808 7.4419L6.20008 7.8739C6.35497 8.02879 6.44198 8.23886 6.44198 8.4579C6.44198 8.67694 6.35497 8.88701 6.20008 9.0419C6.04519 9.19679 5.83512 9.2838 5.61608 9.2838C5.39704 9.2838 5.18697 9.19679 5.03208 9.0419L3.23208 7.2099C3.15925 7.13382 3.10216 7.0441 3.06408 6.9459C3.02176 6.85014 2.99989 6.7466 2.99989 6.6419C2.99989 6.5372 3.02176 6.43366 3.06408 6.3379Z" fill="currentColor"></path>
                        <path d="M12.6701 9.94591C12.632 10.0441 12.5749 10.1338 12.5021 10.2099L10.7021 12.0419C10.5472 12.1968 10.3371 12.2838 10.1181 12.2838C9.89901 12.2838 9.68894 12.1968 9.53405 12.0419C9.37916 11.887 9.29215 11.677 9.29215 11.4579C9.29215 11.2389 9.37916 11.0288 9.53405 10.8739L10.0061 10.4419L7.79982 10.4419C7.58764 10.4419 7.38416 10.3576 7.23413 10.2076C7.0841 10.0576 6.99982 9.85409 6.99982 9.64191C6.99982 9.42974 7.0841 9.22626 7.23413 9.07623C7.38416 8.9262 7.58764 8.84191 7.79982 8.84191L10.0061 8.84191L9.53405 8.40991C9.37916 8.25503 9.29215 8.04496 9.29215 7.82591C9.29215 7.60687 9.37916 7.3968 9.53405 7.24191C9.68894 7.08703 9.89901 7.00001 10.1181 7.00001C10.3371 7.00001 10.5472 7.08703 10.7021 7.24191L12.5021 9.07391C12.5749 9.15 12.632 9.23971 12.6701 9.33791C12.7124 9.43367 12.7342 9.53722 12.7342 9.64191C12.7342 9.74661 12.7124 9.85015 12.6701 9.94591Z" fill="currentColor"></path>
                    </svg>
                </a>
            `;

            // Apply complete PocketOption styling
            demoBottom.style.cssText = `
                font-family: Noto Sans, Arial, sans-serif !important;
                font-weight: 400 !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                color: #fff !important;
                cursor: default !important;
                visibility: visible !important;
                pointer-events: all !important;
                user-select: none !important;
                box-sizing: border-box !important;
                outline: none !important;
                border-radius: 10px !important;
                padding: 10px !important;
                background-color: #1f2536 !important;
                display: grid !important;
                align-items: center !important;
                gap: 10px !important;
                margin-top: 10px !important;
                grid-template-columns: 4fr 1fr 1fr !important;
            `;
        }

        const demoSvgMarkup = `<svg class="svg-icon qt-demo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M12.034 3.115a1 1 0 0 1 .932 0l10.5 5.526a1 1 0 0 1 0 1.77l-3.887 2.046v5.47a1 1 0 0 1-.18.572l-.006.009.006-.008h-.001l-.002.003-.003.005-.01.012a2.324 2.324 0 0 1-.115.15 5.772 5.772 0 0 1-.324.365c-.282.292-.7.672-1.263 1.05-1.135.758-2.846 1.494-5.186 1.494s-4.05-.736-5.182-1.495a7.671 7.671 0 0 1-1.26-1.05 5.74 5.74 0 0 1-.438-.516l-.01-.012-.003-.006-.001-.002H5.6s.006.008.002.002l-.003-.003a1 1 0 0 1-.178-.57v-5.47L3 11.183v2.764a1 1 0 1 1-2 0v-4.42a1 1 0 0 1 .534-.886l10.5-5.526ZM4.988 9.084a.5.5 0 0 0 0 .885l7.28 3.831a.5.5 0 0 0 .465 0l7.28-3.831a.5.5 0 0 0 0-.885l-7.28-3.831a.5.5 0 0 0-.466 0l-7.28 3.83ZM7.42 13.51v4.059l.075.08c.197.204.504.487.93.773.847.567 2.174 1.157 4.07 1.157 1.894 0 3.224-.59 4.073-1.157a5.716 5.716 0 0 0 1.01-.855V13.51l-4.613 2.428a1 1 0 0 1-.932 0L7.421 13.51Z" clip-rule="evenodd"/></svg>`;
        const realRowIcon = document.querySelector('#ddm_balance > div > div.drop-down-modal__in > div > a > div.balance-item__icon > svg');
        if (realRowIcon && !realRowIcon.dataset.swapped) {
            realRowIcon.outerHTML = demoSvgMarkup;
            realRowIcon.dataset.swapped = 'true';
        }

        const label = document.querySelector('#ddm_balance > div > div.drop-down-modal__in > div > a > div.balance-item__info > div.balance-item__label');
        if (label && label.textContent !== 'QT Demo') {
            label.textContent = 'QT Demo';
        }

        const balanceSpan = document.querySelector('#ddm_balance > div > div.drop-down-modal__in > div > a > div.balance-item__info .js-balance-real-USD');
        if (balanceSpan && !balanceSpan.dataset.fixed) {
            balanceSpan.dataset.hdShow = FIXED_BALANCE.replace(/,/g, '');
            balanceSpan.textContent = FIXED_BALANCE;
            balanceSpan.dataset.fixed = 'true';
        }

        const currentDemoIcon = document.querySelector('#ddm_balance > div > div.drop-down-modal__in > div > div.balance-item.balance-item--current.balance-item--demo > div.balance-item__top > div.balance-item__start > div.balance-item__icon > svg');
        const realSvgMarkup = `<svg class="svg-icon qt-real" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M7.832 1.858C8.822 1.308 10.12 1 11.5 1c1.38 0 2.678.309 3.668.858C16.123 2.388 17 3.282 17 4.5v16.11c0 1.207-.901 2.069-1.842 2.57-.984.525-2.278.82-3.658.82s-2.673-.295-3.658-.82C6.901 22.68 6 21.818 6 20.61V4.5c0-1.218.877-2.111 1.832-2.642ZM8 7.231V8.5c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98V7.231c-.966.494-2.197.769-3.5.769S8.966 7.725 8 7.231ZM15 4.5c0 .162-.13.52-.804.894-.64.355-1.59.606-2.696.606-1.105 0-2.057-.251-2.696-.606C8.13 5.019 8 4.662 8 4.5c0-.162.13-.52.804-.894C9.444 3.251 10.394 3 11.5 3c1.105 0 2.057.251 2.696.606.674.375.804.732.804.894Zm0 6.83c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.17c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98v-1.17Zm0 4c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.17c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98v-1.17Zm0 4c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.28c0 .108.099.441.783.806.64.341 1.597.584 2.717.584s2.076-.243 2.717-.584c.684-.365.783-.698.783-.805V19.33Z" clip-rule="evenodd"/><path fill="currentColor" d="M16.584 21.951c.416.049.4.049.916.049 1.38 0 2.674-.295 3.658-.82.941-.501 1.842-1.363 1.842-2.57V14.5c0-1.218-.877-2.111-1.832-2.642-.99-.55-2.288-.858-3.668-.858-.515 0-.02-.082-.5 0v2c.45-.104-.044 0 .5 0 1.105 0 2.057.251 2.696.606.674.374.804.732.804.894 0 .162-.13.52-.804.894-.64.355-1.59.606-2.696.606-.544 0-.05.104-.5 0v2h.5c1.303 0 2.534-.275 3.5-.769v1.38c0 .107-.099.44-.783.805-.64.341-1.597.584-2.717.584H17l-.416 1.951ZM6 6.014A9.163 9.163 0 0 0 5.5 6c-1.38 0-2.679.309-3.668.858C.877 7.388 0 8.282 0 9.5c0 .104.006.206.019.306A1.005 1.005 0 0 0 0 10v7.61c0 1.207.901 2.069 1.842 2.57.985.525 2.278.82 3.658.82.168 0 .335-.004.5-.013v-2.003c-.163.01-.33.016-.5.016-1.12 0-2.077-.243-2.717-.584C2.099 18.05 2 17.718 2 17.61v-1.508c.966.573 2.193.897 3.5.897.168 0 .335-.005.5-.016V14.98a5.83 5.83 0 0 1-.5.021c-1.08 0-2.005-.293-2.631-.712C2.236 13.864 2 13.388 2 13v-.769c.966.494 2.197.769 3.5.769.168 0 .335-.005.5-.014v-2.003a7.43 7.43 0 0 1-.5.017c-1.105 0-2.057-.251-2.696-.606C2.13 10.02 2 9.662 2 9.5c0-.162.13-.52.804-.894C3.444 8.251 4.394 8 5.5 8c.17 0 .337.006.5.017V6.014Z"/></svg>`;
        if (currentDemoIcon && !currentDemoIcon.dataset.swapped) {
            currentDemoIcon.outerHTML = realSvgMarkup;
            currentDemoIcon.dataset.swapped = 'true';
        }

        const demoTopSection = document.querySelector('#ddm_balance > div > div.drop-down-modal__in > div > div.balance-item.balance-item--current.balance-item--demo > div.balance-item__top');
        if (demoTopSection) {
            const existingEnd = demoTopSection.querySelector('.balance-item__end');
            if (existingEnd && !existingEnd.innerHTML.trim()) {
                existingEnd.innerHTML = `<a class="balance-item__change-currency-link mfp-ajax-modal" data-mfp-no-close="" href="https://pocketoption.com/en/cabinet/ajax/modal/change-account-currency/">USD</a>`;
            } else if (!existingEnd) {
                const currencyEndDiv = document.createElement('div');
                currencyEndDiv.className = 'balance-item__end';
                currencyEndDiv.innerHTML = `<a class="balance-item__change-currency-link mfp-ajax-modal" data-mfp-no-close="" href="https://pocketoption.com/en/cabinet/ajax/modal/change-account-currency/">USD</a>`;
                demoTopSection.appendChild(currencyEndDiv);
            }
        }

        function relabel() {
            const demoLabel = document.querySelector('#ddm_balance .balance-item--demo .balance-item__label');
            if (demoLabel && demoLabel.textContent !== 'QT Real') {
                demoLabel.textContent = 'QT Real';
            }
        }

        document.addEventListener('click', e => {
            if (e.target.closest('[data-dropdown-target="ddm_balance"]')) {
                setTimeout(relabel, 50);
            }
        });

        relabel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(modifyDropdown, 500);
            setInterval(modifyDropdown, 2000);
        });
    } else {
        setTimeout(modifyDropdown, 500);
        setInterval(modifyDropdown, 2000);
    }

    function initProfitLossTracker() {
        const log = (...a) => console.log('[PnL]', ...a);

        function readTodayDeals() {
            const today = new Date().toLocaleDateString('en-CA');
            let pos = 0, neg = 0, trades = 0;

            document.querySelectorAll('.deals-list__group-label').forEach(label => {
                if (label.textContent.trim() !== today) return;
                let row = label.nextElementSibling;
                while (row && !row.classList.contains('deals-list__group-label')) {
                    if (row.classList.contains('deals-list__item')) {
                        trades++;
                        const dir = row.querySelector('i.fa-arrow-up') ? 1 : -1;
                        const $val = row.querySelector('.price-up');
                        const val = $val ? parseFloat($val.textContent.replace(/[^0-9.-]/g, '')) || 0
                                         : parseFloat(row.textContent.replace(/[^0-9.-]/g, '')) || 0;
                        if (dir === 1) pos += val; else neg += val;
                    }
                    row = row.nextElementSibling;
                }
            });
            return { net: (pos - neg).toFixed(2), turnover: (pos + neg).toFixed(2), trades };
        }

        function writeUI({ net, turnover, trades }) {
            document.querySelectorAll('p').forEach(p => {
                const span = p.querySelector('span');
                if (!span) return;
                if (p.textContent.includes('Trading profit:')) span.textContent = '$ ' + net;
                if (p.textContent.includes('Net turnover:')) span.textContent = '$ ' + turnover;
                if (p.textContent.includes('Trading turnover:')) span.textContent = '$ ' + turnover;
                if (p.textContent.includes('Trades:')) span.textContent = trades;
            });
        }

        function tick() {
            try { writeUI(readTodayDeals()); } catch (e) { log('tick error', e); }
        }

        function start() {
            if (!document.querySelector('.deals-list__group-label')) {
                return setTimeout(start, 1000);
            }
            log('started');
            setInterval(tick, 1000);
            tick();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    initProfitLossTracker();

    } // End runAllFeatures

})();
