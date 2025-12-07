/**
 * Common JavaScript for Personal Academic Portfolio & Laboratory
 * Vanilla JavaScript - No frameworks
 */

(function() {
    'use strict';

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function initMobileNav() {
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.querySelector('.nav-list');
        
        if (!navToggle || !navList) return;
        
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            
            // Update aria-label for accessibility
            const isOpen = navList.classList.contains('active');
            navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navList.contains(event.target)) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when pressing Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navList.classList.contains('active')) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // ============================================
    // Active Navigation Link
    // ============================================
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            
            // Remove existing active class
            link.classList.remove('active');
            
            // Check if this link matches current path
            if (href && currentPath.includes(href) && href !== 'index.html') {
                link.classList.add('active');
            } else if (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('index.html'))) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(event) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    event.preventDefault();
                    
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // ============================================
    // Code Block Enhancements
    // ============================================
    function enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(function(codeBlock) {
            const pre = codeBlock.parentElement;
            
            // Add language label if class contains language-*
            const classes = codeBlock.className.split(' ');
            const langClass = classes.find(function(cls) {
                return cls.startsWith('language-');
            });
            
            if (langClass) {
                const language = langClass.replace('language-', '').toUpperCase();
                pre.setAttribute('data-language', language);
                pre.classList.add('code-block');
            }
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.setAttribute('aria-label', 'コードをコピー');
            
            copyBtn.addEventListener('click', function() {
                const code = codeBlock.textContent;
                
                navigator.clipboard.writeText(code).then(function() {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(function() {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                }).catch(function(err) {
                    console.error('Failed to copy:', err);
                    copyBtn.textContent = 'Error';
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(copyBtn);
        });
    }

    // ============================================
    // External Link Handler
    // ============================================
    function handleExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(function(link) {
            // Check if it's an external link
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // Add visual indicator if not already present
                if (!link.classList.contains('external')) {
                    link.classList.add('external');
                }
            }
        });
    }

    // ============================================
    // Table Wrapper for Responsive Tables
    // ============================================
    function wrapTables() {
        const tables = document.querySelectorAll('table:not(.nowrap)');
        
        tables.forEach(function(table) {
            // Skip if already wrapped
            if (table.parentElement.classList.contains('table-wrapper')) return;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            wrapper.style.overflowX = 'auto';
            
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    // ============================================
    // Lazy Loading Images
    // ============================================
    function initLazyLoading() {
        // Check if native lazy loading is supported
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(function(img) {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback for older browsers using Intersection Observer
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    });
                });
                
                document.querySelectorAll('img[data-src]').forEach(function(img) {
                    imageObserver.observe(img);
                });
            }
        }
    }

    // ============================================
    // Utility Functions
    // ============================================
    
    /**
     * Debounce function to limit how often a function can fire
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    /**
     * Format date in Japanese style
     */
    function formatDateJP(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return year + '.' + month + '.' + day;
    }

    // ============================================
    // Tag Filter for Articles
    // ============================================
    function initTagFilter() {
        const tagButtons = document.querySelectorAll('.tag-filter .tag');
        const articles = document.querySelectorAll('.article-card[data-tags]');
        
        if (!tagButtons.length || !articles.length) return;
        
        tagButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const selectedTag = this.getAttribute('data-tag');
                
                // Update active state
                tagButtons.forEach(function(btn) {
                    btn.classList.remove('tag-active');
                });
                this.classList.add('tag-active');
                
                // Filter articles
                articles.forEach(function(article) {
                    const articleTags = article.getAttribute('data-tags').split(' ');
                    
                    if (selectedTag === 'all' || articleTags.includes(selectedTag)) {
                        article.classList.remove('hidden');
                    } else {
                        article.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ============================================
    // Initialize on DOM Ready
    // ============================================
    function init() {
        initMobileNav();
        setActiveNavLink();
        initSmoothScroll();
        enhanceCodeBlocks();
        handleExternalLinks();
        wrapTables();
        initLazyLoading();
        initTagFilter();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utility functions globally if needed
    window.SiteUtils = {
        debounce: debounce,
        formatDateJP: formatDateJP
    };

})();
