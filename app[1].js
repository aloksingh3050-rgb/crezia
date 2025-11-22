// Crezia SEO Platform - Main Application
class CreziaApp {
    constructor() {
        this.currentUser = null;
        this.testAccounts = [
            {email: "demo@crezia.com", password: "demo123", plan: "free", dailyLimit: 10, usage: 3, name: "Demo User"},
            {email: "premium@crezia.com", password: "premium123", plan: "premium", dailyLimit: -1, usage: 25, name: "Premium User"}
        ];
        this.sampleResults = {
            keyword: {keyword: "SEO tools", volume: 15000, difficulty: 68, cpc: 3.45, trend: [12000, 13500, 14200, 15000, 16500]},
            seoScore: {overall: 85, technical: 78, content: 92, mobile: 88, speed: 76, issues: ["Missing meta descriptions", "Slow image loading", "Large image files"]},
            plagiarism: {percentage: 15, unique: 85, sources: ["wikipedia.org", "medium.com"], grade: "Pass"},
            grammar: {errors: 3, corrections: ["Subject-verb agreement corrected", "Spelling error fixed", "Punctuation improved"], score: 92}
        };
        this.init();
    }

    init() {
        this.loadUserSession();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('signupBtn').addEventListener('click', () => this.showModal('signupModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Modal closes
        document.getElementById('loginClose').addEventListener('click', () => this.hideModal('loginModal'));
        document.getElementById('signupClose').addEventListener('click', () => this.hideModal('signupModal'));
        document.getElementById('toolClose').addEventListener('click', () => this.hideModal('toolModal'));

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const toolId = card.dataset.tool;
                this.openTool(toolId);
            });
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.showLoading();

        setTimeout(() => {
            const user = this.testAccounts.find(acc => acc.email === email && acc.password === password);
            
            if (user) {
                this.currentUser = {...user};
                this.saveUserSession();
                this.updateUI();
                this.hideModal('loginModal');
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification('Invalid credentials. Try demo@crezia.com / demo123', 'error');
            }
            
            this.hideLoading();
        }, 1000);
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        this.showLoading();

        setTimeout(() => {
            // Check if user already exists
            const existingUser = this.testAccounts.find(acc => acc.email === email);
            
            if (existingUser) {
                this.showNotification('Account already exists. Please login.', 'error');
            } else {
                // Create new user
                const newUser = {
                    email,
                    password,
                    name,
                    plan: 'free',
                    dailyLimit: 10,
                    usage: 0
                };
                
                this.testAccounts.push(newUser);
                this.currentUser = {...newUser};
                this.saveUserSession();
                this.updateUI();
                this.hideModal('signupModal');
                this.showNotification('Account created successfully!', 'success');
            }
            
            this.hideLoading();
        }, 1000);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('creziaUser');
        this.updateUI();
        this.showNotification('Logged out successfully', 'info');
    }

    saveUserSession() {
        if (this.currentUser) {
            localStorage.setItem('creziaUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserSession() {
        const saved = localStorage.getItem('creziaUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        
        if (this.currentUser) {
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            
            document.getElementById('userName').textContent = this.currentUser.name || 'User';
            
            const usageText = this.currentUser.plan === 'premium' 
                ? 'Unlimited' 
                : `${this.currentUser.usage}/${this.currentUser.dailyLimit} today`;
            document.getElementById('usageCounter').textContent = usageText;
        } else {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    canUseTools() {
        if (!this.currentUser) {
            this.showNotification('Please login to use SEO tools', 'error');
            this.showModal('loginModal');
            return false;
        }

        if (this.currentUser.plan === 'premium') {
            return true;
        }

        if (this.currentUser.usage >= this.currentUser.dailyLimit) {
            this.showNotification('Daily limit reached! Upgrade to Premium for unlimited usage.', 'warning');
            return false;
        }

        return true;
    }

    incrementUsage() {
        if (this.currentUser && this.currentUser.plan !== 'premium') {
            this.currentUser.usage++;
            this.saveUserSession();
            this.updateUI();
        }
    }

    openTool(toolId) {
        if (!this.canUseTools()) return;

        const toolConfigs = {
            'keyword-research': {
                title: 'Keyword Research',
                template: this.getKeywordResearchTemplate()
            },
            'seo-score': {
                title: 'Website SEO Score',
                template: this.getSEOScoreTemplate()
            },
            'plagiarism': {
                title: 'Plagiarism Checker',
                template: this.getPlagiarismTemplate()
            },
            'grammar': {
                title: 'Grammar Fixer',
                template: this.getGrammarTemplate()
            },
            'backlinks': {
                title: 'Backlink Analysis',
                template: this.getBacklinkTemplate()
            },
            'content': {
                title: 'Content Optimizer',
                template: this.getContentTemplate()
            },
            'competitor': {
                title: 'Competitor Analysis',
                template: this.getCompetitorTemplate()
            }
        };

        const config = toolConfigs[toolId];
        if (config) {
            document.getElementById('toolModalTitle').textContent = config.title;
            document.getElementById('toolModalBody').innerHTML = config.template;
            this.showModal('toolModal');
            this.setupToolEventListeners(toolId);
        }
    }

    getKeywordResearchTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Enter Keyword</label>
                    <input type="text" id="keywordInput" class="form-control" placeholder="e.g., SEO tools">
                </div>
                <button id="analyzeKeyword" class="btn btn--primary">Analyze Keyword</button>
            </div>
            <div id="keywordResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Keyword Metrics</h3>
                    <div class="metric">
                        <span class="metric-label">Search Volume</span>
                        <span class="metric-value" id="searchVolume">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Difficulty</span>
                        <span class="metric-value" id="difficulty">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">CPC</span>
                        <span class="metric-value" id="cpc">-</span>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Trend Analysis</h3>
                    <div class="chart-container">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    getSEOScoreTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Website URL</label>
                    <input type="url" id="websiteUrl" class="form-control" placeholder="https://example.com">
                </div>
                <button id="analyzeSEO" class="btn btn--primary">Analyze Website</button>
            </div>
            <div id="seoResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>SEO Score Overview</h3>
                    <div class="chart-container">
                        <canvas id="seoChart"></canvas>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Issues Found</h3>
                    <ul id="seoIssues" class="issues-list"></ul>
                </div>
            </div>
        `;
    }

    getPlagiarismTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Content to Check</label>
                    <textarea id="contentText" class="form-control" rows="6" placeholder="Paste your content here..."></textarea>
                </div>
                <button id="checkPlagiarism" class="btn btn--primary">Check Plagiarism</button>
            </div>
            <div id="plagiarismResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Plagiarism Report</h3>
                    <div class="metric">
                        <span class="metric-label">Unique Content</span>
                        <span class="metric-value" id="uniquePercent">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Plagiarized</span>
                        <span class="metric-value" id="plagiarizedPercent">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Grade</span>
                        <span class="metric-value" id="plagiarismGrade">-</span>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Sources Found</h3>
                    <ul id="plagiarismSources" class="issues-list"></ul>
                </div>
            </div>
        `;
    }

    getGrammarTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Text to Check</label>
                    <textarea id="grammarText" class="form-control" rows="6" placeholder="Enter your text here..."></textarea>
                </div>
                <button id="checkGrammar" class="btn btn--primary">Check Grammar</button>
            </div>
            <div id="grammarResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Grammar Score: <span id="grammarScore">-</span></h3>
                    <div class="metric">
                        <span class="metric-label">Errors Found</span>
                        <span class="metric-value" id="errorCount">-</span>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Corrections Made</h3>
                    <div id="corrections" class="corrections-list"></div>
                </div>
            </div>
        `;
    }

    getBacklinkTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Domain to Analyze</label>
                    <input type="text" id="backlinkDomain" class="form-control" placeholder="example.com">
                </div>
                <button id="analyzeBacklinks" class="btn btn--primary">Analyze Backlinks</button>
            </div>
            <div id="backlinkResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Domain Metrics</h3>
                    <div class="metric">
                        <span class="metric-label">Domain Authority</span>
                        <span class="metric-value" id="domainAuthority">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Total Backlinks</span>
                        <span class="metric-value" id="totalBacklinks">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Referring Domains</span>
                        <span class="metric-value" id="referringDomains">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Quality Score</span>
                        <span class="metric-value" id="qualityScore">-</span>
                    </div>
                </div>
            </div>
        `;
    }

    getContentTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Content to Optimize</label>
                    <textarea id="optimizeContent" class="form-control" rows="6" placeholder="Enter your content here..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Target Keywords</label>
                    <input type="text" id="targetKeywords" class="form-control" placeholder="keyword1, keyword2, keyword3">
                </div>
                <button id="optimizeBtn" class="btn btn--primary">Optimize Content</button>
            </div>
            <div id="contentResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Content Analysis</h3>
                    <div class="metric">
                        <span class="metric-label">SEO Score</span>
                        <span class="metric-value" id="contentSEOScore">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Word Count</span>
                        <span class="metric-value" id="wordCount">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Keyword Density</span>
                        <span class="metric-value" id="keywordDensity">-</span>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Optimization Suggestions</h3>
                    <ul id="optimizationSuggestions" class="issues-list"></ul>
                </div>
            </div>
        `;
    }

    getCompetitorTemplate() {
        return `
            <div class="tool-input">
                <div class="form-group">
                    <label class="form-label">Your Domain</label>
                    <input type="text" id="yourDomain" class="form-control" placeholder="yourdomain.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Competitor Domains (comma-separated)</label>
                    <input type="text" id="competitorDomains" class="form-control" placeholder="competitor1.com, competitor2.com">
                </div>
                <button id="compareCompetitors" class="btn btn--primary">Compare</button>
            </div>
            <div id="competitorResults" class="tool-results" style="display:none;">
                <div class="result-section">
                    <h3>Competitive Analysis</h3>
                    <div class="chart-container">
                        <canvas id="competitorChart"></canvas>
                    </div>
                </div>
                <div class="result-section">
                    <h3>Gap Analysis</h3>
                    <ul id="gapAnalysis" class="issues-list"></ul>
                </div>
            </div>
        `;
    }

    setupToolEventListeners(toolId) {
        const buttonMap = {
            'keyword-research': 'analyzeKeyword',
            'seo-score': 'analyzeSEO',
            'plagiarism': 'checkPlagiarism',
            'grammar': 'checkGrammar',
            'backlinks': 'analyzeBacklinks',
            'content': 'optimizeBtn',
            'competitor': 'compareCompetitors'
        };

        const button = document.getElementById(buttonMap[toolId]);
        if (button) {
            button.addEventListener('click', () => this.processTool(toolId));
        }
    }

    processTool(toolId) {
        this.showLoading();
        this.incrementUsage();

        setTimeout(() => {
            const processors = {
                'keyword-research': () => this.processKeywordResearch(),
                'seo-score': () => this.processSEOScore(),
                'plagiarism': () => this.processPlagiarism(),
                'grammar': () => this.processGrammar(),
                'backlinks': () => this.processBacklinks(),
                'content': () => this.processContentOptimization(),
                'competitor': () => this.processCompetitorAnalysis()
            };

            processors[toolId]?.();
            this.hideLoading();
        }, 2000);
    }

    processKeywordResearch() {
        const keyword = document.getElementById('keywordInput').value;
        if (!keyword) return;

        const data = this.sampleResults.keyword;
        document.getElementById('searchVolume').textContent = data.volume.toLocaleString();
        document.getElementById('difficulty').textContent = `${data.difficulty}/100`;
        document.getElementById('cpc').textContent = `$${data.cpc}`;

        document.getElementById('keywordResults').style.display = 'block';

        // Create trend chart
        const ctx = document.getElementById('trendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Search Volume',
                    data: data.trend,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    processSEOScore() {
        const url = document.getElementById('websiteUrl').value;
        if (!url) return;

        const data = this.sampleResults.seoScore;
        
        // Create SEO score chart
        const ctx = document.getElementById('seoChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Overall', 'Technical', 'Content', 'Mobile', 'Speed'],
                datasets: [{
                    label: 'SEO Scores',
                    data: [data.overall, data.technical, data.content, data.mobile, data.speed],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Display issues
        const issuesList = document.getElementById('seoIssues');
        issuesList.innerHTML = '';
        data.issues.forEach(issue => {
            const li = document.createElement('li');
            li.textContent = issue;
            issuesList.appendChild(li);
        });

        document.getElementById('seoResults').style.display = 'block';
    }

    processPlagiarism() {
        const content = document.getElementById('contentText').value;
        if (!content) return;

        const data = this.sampleResults.plagiarism;
        document.getElementById('uniquePercent').textContent = `${data.unique}%`;
        document.getElementById('plagiarizedPercent').textContent = `${data.percentage}%`;
        document.getElementById('plagiarismGrade').textContent = data.grade;

        const sourcesList = document.getElementById('plagiarismSources');
        sourcesList.innerHTML = '';
        data.sources.forEach(source => {
            const li = document.createElement('li');
            li.textContent = source;
            sourcesList.appendChild(li);
        });

        document.getElementById('plagiarismResults').style.display = 'block';
    }

    processGrammar() {
        const text = document.getElementById('grammarText').value;
        if (!text) return;

        const data = this.sampleResults.grammar;
        document.getElementById('grammarScore').textContent = `${data.score}/100`;
        document.getElementById('errorCount').textContent = data.errors;

        const correctionsList = document.getElementById('corrections');
        correctionsList.innerHTML = '';
        data.corrections.forEach(correction => {
            const div = document.createElement('div');
            div.className = 'correction-item';
            div.textContent = correction;
            correctionsList.appendChild(div);
        });

        document.getElementById('grammarResults').style.display = 'block';
    }

    processBacklinks() {
        const domain = document.getElementById('backlinkDomain').value;
        if (!domain) return;

        // Generate realistic backlink data
        const da = Math.floor(Math.random() * 40) + 30;
        const backlinks = Math.floor(Math.random() * 50000) + 5000;
        const domains = Math.floor(Math.random() * 500) + 100;
        const quality = Math.floor(Math.random() * 30) + 60;

        document.getElementById('domainAuthority').textContent = `${da}/100`;
        document.getElementById('totalBacklinks').textContent = backlinks.toLocaleString();
        document.getElementById('referringDomains').textContent = domains.toLocaleString();
        document.getElementById('qualityScore').textContent = `${quality}/100`;

        document.getElementById('backlinkResults').style.display = 'block';
    }

    processContentOptimization() {
        const content = document.getElementById('optimizeContent').value;
        const keywords = document.getElementById('targetKeywords').value;
        if (!content) return;

        const wordCount = content.split(' ').length;
        const seoScore = Math.floor(Math.random() * 30) + 65;
        const density = ((keywords.split(',').length / wordCount) * 100).toFixed(2);

        document.getElementById('contentSEOScore').textContent = `${seoScore}/100`;
        document.getElementById('wordCount').textContent = wordCount;
        document.getElementById('keywordDensity').textContent = `${density}%`;

        const suggestions = [
            'Add more internal links',
            'Include target keywords in headings',
            'Optimize meta description',
            'Add alt text to images',
            'Improve content structure'
        ];

        const suggestionsList = document.getElementById('optimizationSuggestions');
        suggestionsList.innerHTML = '';
        suggestions.slice(0, 3).forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });

        document.getElementById('contentResults').style.display = 'block';
    }

    processCompetitorAnalysis() {
        const yourDomain = document.getElementById('yourDomain').value;
        const competitors = document.getElementById('competitorDomains').value;
        if (!yourDomain || !competitors) return;

        const competitorList = competitors.split(',').map(c => c.trim());
        
        // Create competitor comparison chart
        const ctx = document.getElementById('competitorChart').getContext('2d');
        const labels = [yourDomain, ...competitorList];
        const data = labels.map(() => Math.floor(Math.random() * 40) + 30);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Domain Authority',
                    data: data,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Gap analysis
        const gaps = [
            'Competitors have more backlinks',
            'Missing opportunities in organic keywords',
            'Lower content freshness score',
            'Fewer social media mentions'
        ];

        const gapsList = document.getElementById('gapAnalysis');
        gapsList.innerHTML = '';
        gaps.slice(0, 3).forEach(gap => {
            const li = document.createElement('li');
            li.textContent = gap;
            gapsList.appendChild(li);
        });

        document.getElementById('competitorResults').style.display = 'block';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `status status--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.creziaApp = new CreziaApp();
});