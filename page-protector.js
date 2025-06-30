// page-protector.js

/**
 * Page Protection Library
 * 
 * This library provides multiple layers of protection against:
 * - Right-click context menu access
 * - Developer tools keyboard shortcuts
 * - View source functionality
 * - Developer tools detection
 * 
 * Usage:
 * 
 * // Initialize with default options
 * const protector = new PageProtector();
 * protector.init();
 * 
 * // Initialize with custom options
 * const protector = new PageProtector({
 *   disableRightClick: true,
 *   disableShortcuts: true,
 *   disableTextSelection: true,
 *   tamperDetection: true,
 *   obfuscate: true,
 *   tamperCheckInterval: 1000,
 *   tamperThreshold: 100,
 *   onContextMenuBlocked: function(e) { ... },
 *   onShortcutBlocked: function(shortcut) { ... },
 *   onDevToolsDetected: function() { ... }
 * });
 * protector.init();
 * 
 * // To remove protections
 * protector.destroy();
 */

class PageProtector {
    constructor(options = {}) {
        // Default configuration
        this.defaultConfig = {
            disableRightClick: true,
            disableShortcuts: true,
            disableTextSelection: true,
            tamperDetection: true,
            obfuscate: true,
            tamperCheckInterval: 1000,
            tamperThreshold: 100,
            onContextMenuBlocked: null,
            onShortcutBlocked: null,
            onDevToolsDetected: null
        };
        
        // Merge options with defaults
        this.config = {...this.defaultConfig, ...options};
        
        // Store references to event listeners
        this.listeners = {
            contextmenu: null,
            keydown: null,
            keypress: null,
            selectstart: null
        };
        
        // Store interval ID for tamper detection
        this.tamperInterval = null;
    }
    
    init() {
        // Initialize all enabled protections
        if (this.config.disableRightClick) this._disableRightClick();
        if (this.config.disableShortcuts) this._disableShortcuts();
        if (this.config.disableTextSelection) this._disableTextSelection();
        if (this.config.tamperDetection) this._enableTamperDetection();
        if (this.config.obfuscate) this._obfuscateSource();
    }
    
    destroy() {
        // Remove all event listeners
        if (this.listeners.contextmenu) {
            document.removeEventListener('contextmenu', this.listeners.contextmenu);
        }
        
        if (this.listeners.keydown) {
            document.removeEventListener('keydown', this.listeners.keydown);
        }
        
        if (this.listeners.keypress) {
            document.onkeypress = null;
        }
        
        if (this.listeners.selectstart) {
            document.removeEventListener('selectstart', this.listeners.selectstart);
        }
        
        // Clear tamper detection interval
        if (this.tamperInterval) {
            clearInterval(this.tamperInterval);
            this.tamperInterval = null;
        }
    }
    
    _disableRightClick() {
        this.listeners.contextmenu = (e) => {
            e.preventDefault();
            if (this.config.onContextMenuBlocked) {
                this.config.onContextMenuBlocked(e);
            }
        };
        document.addEventListener('contextmenu', this.listeners.contextmenu);
    }
    
    _disableShortcuts() {
        this.listeners.keydown = (e) => {
            // Disable F12
            if (e.key === 'F12') {
                e.preventDefault();
                if (this.config.onShortcutBlocked) {
                    this.config.onShortcutBlocked('F12');
                }
                return;
            }
            
            // Disable Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                if (this.config.onShortcutBlocked) {
                    this.config.onShortcutBlocked('Ctrl+Shift+I');
                }
                return;
            }
            
            // Disable Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                if (this.config.onShortcutBlocked) {
                    this.config.onShortcutBlocked('Ctrl+Shift+J');
                }
                return;
            }
            
            // Disable Ctrl+U (View source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                if (this.config.onShortcutBlocked) {
                    this.config.onShortcutBlocked('Ctrl+U');
                }
                return;
            }
        };
        document.addEventListener('keydown', this.listeners.keydown);
        
        // Block menu bar access to View Source
        this.listeners.keypress = (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                if (this.config.onShortcutBlocked) {
                    this.config.onShortcutBlocked('Ctrl+U');
                }
                return false;
            }
        };
        document.onkeypress = this.listeners.keypress;
    }
    
    _disableTextSelection() {
        this.listeners.selectstart = (e) => {
            e.preventDefault();
        };
        document.addEventListener('selectstart', this.listeners.selectstart);
    }
    
    _enableTamperDetection() {
        this.tamperInterval = setInterval(() => {
            const before = performance.now();
            
            // This will pause execution if dev tools are open
            debugger;
            
            const after = performance.now();
            
            if (after - before > this.config.tamperThreshold) {
                if (this.config.onDevToolsDetected) {
                    this.config.onDevToolsDetected();
                }
                location.reload();
            }
        }, this.config.tamperCheckInterval);
    }
    
    _obfuscateSource() {
        // Add a comment to the body for obfuscation
        document.body.innerHTML += '<!-- Source code protected by PageProtector.js -->';
    }
}