/**
 * MathJax Configuration
 * Enables LaTeX-style math rendering with $...$ and $$...$$ syntax
 */

window.MathJax = {
    tex: {
        // Enable inline math with $...$
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
        ],
        // Enable display math with $$...$$
        displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]']
        ],
        // Process escapes: \$ produces a literal dollar sign
        processEscapes: true,
        // Process environments
        processEnvironments: true,
        // Process references
        processRefs: true,
        // Macros for common symbols
        macros: {
            // Common operators
            'dd': '\\mathrm{d}',           // Differential operator
            'e': '\\mathrm{e}',            // Euler's number
            'i': '\\mathrm{i}',            // Imaginary unit
            'j': '\\mathrm{j}',            // Alternative imaginary unit (EE convention)
            
            // Vector and matrix notation
            'vb': ['\\mathbf{#1}', 1],     // Bold vector
            'va': ['\\vec{#1}', 1],        // Arrow vector
            'mat': ['\\mathbf{#1}', 1],    // Matrix
            
            // Bracketing
            'abs': ['\\left|#1\\right|', 1],           // Absolute value
            'norm': ['\\left\\|#1\\right\\|', 1],      // Norm
            'paren': ['\\left(#1\\right)', 1],         // Parentheses
            'brac': ['\\left[#1\\right]', 1],          // Brackets
            'set': ['\\left\\{#1\\right\\}', 1],       // Set braces
            'ang': ['\\left\\langle#1\\right\\rangle', 1], // Angle brackets
            
            // Calculus
            'pdv': ['\\frac{\\partial #1}{\\partial #2}', 2],   // Partial derivative
            'dv': ['\\frac{\\dd #1}{\\dd #2}', 2],              // Total derivative
            'laplacian': '\\nabla^2',                           // Laplacian
            
            // Common sets
            'R': '\\mathbb{R}',            // Real numbers
            'C': '\\mathbb{C}',            // Complex numbers
            'Z': '\\mathbb{Z}',            // Integers
            'N': '\\mathbb{N}',            // Natural numbers
            'Q': '\\mathbb{Q}',            // Rational numbers
            
            // Physics
            'bra': ['\\langle#1|', 1],               // Bra
            'ket': ['|#1\\rangle', 1],               // Ket
            'braket': ['\\langle#1|#2\\rangle', 2],  // Braket
            
            // Control theory
            'tf': ['\\frac{#1}{#2}', 2],   // Transfer function
            'Lap': '\\mathcal{L}',         // Laplace transform
            'Fou': '\\mathcal{F}'          // Fourier transform
        },
        // Tags for equation numbering
        tags: 'ams',
        tagSide: 'right',
        tagIndent: '0.8em'
    },
    // SVG output configuration
    svg: {
        fontCache: 'global',
        scale: 1,
        minScale: 0.5
    },
    // HTML-CSS output configuration
    'HTML-CSS': {
        availableFonts: ['TeX'],
        preferredFont: 'TeX',
        webFont: 'TeX',
        scale: 100,
        minScaleAdjust: 50
    },
    // Startup configuration
    startup: {
        // Typeset page when MathJax is ready
        typeset: true,
        // Ready callback
        ready: function() {
            MathJax.startup.defaultReady();
            console.log('MathJax is ready');
        }
    },
    // Options
    options: {
        // Skip tags that shouldn't be processed
        skipHtmlTags: [
            'script', 'noscript', 'style', 'textarea', 'pre', 
            'code', 'annotation', 'annotation-xml'
        ],
        // Include tags that should be processed
        includeHtmlTags: {
            '[+]': ['br', 'wbr']
        },
        // Process HTML class
        processHtmlClass: 'math-content',
        // Ignore HTML class
        ignoreHtmlClass: 'no-math',
        // Enable assistive MML for accessibility
        enableAssistiveMml: true,
        // Render on page visibility change
        renderActions: {
            addMenu: []
        }
    }
};
