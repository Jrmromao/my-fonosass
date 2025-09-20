#!/usr/bin/env node

/**
 * FonoSaaS Session Manager for Cursor AI Learning
 * Manages development sessions, summaries, and learning context
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class SessionManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../.cursor/sessions');
    this.historyDir = path.join(this.sessionsDir, 'history');
    this.contextDir = path.join(this.sessionsDir, 'context');
    this.templatesDir = path.join(this.sessionsDir, 'templates');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.sessionsDir, this.historyDir, this.contextDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate session ID based on timestamp
  generateSessionId() {
    const now = new Date();
    return `session_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // Create a new session
  createSession(sessionData = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      type: sessionData.type || 'development',
      focus: sessionData.focus || 'general',
      goals: sessionData.goals || [],
      achievements: [],
      challenges: [],
      learnings: [],
      mistakes: [],
      solutions: [],
      codeChanges: [],
      filesModified: [],
      testsRun: [],
      buildStatus: null,
      nextSteps: [],
      context: sessionData.context || {},
      summary: '',
      tags: sessionData.tags || []
    };

    this.saveSession(session);
    return session;
  }

  // Save session to file
  saveSession(session) {
    const sessionFile = path.join(this.historyDir, `${session.id}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
    console.log(`📝 Session saved: ${session.id}`);
  }

  // Load session by ID
  loadSession(sessionId) {
    const sessionFile = path.join(this.historyDir, `${sessionId}.json`);
    if (fs.existsSync(sessionFile)) {
      return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    }
    return null;
  }

  // List all sessions
  listSessions() {
    const files = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const session = JSON.parse(fs.readFileSync(path.join(this.historyDir, file), 'utf8'));
      return {
        id: session.id,
        startTime: session.startTime,
        type: session.type,
        focus: session.focus,
        summary: session.summary
      };
    }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  // Generate session summary
  generateSummary(sessionId) {
    const session = this.loadSession(sessionId);
    if (!session) {
      console.log('❌ Session not found');
      return;
    }

    const summary = this.createSummaryTemplate(session);
    session.summary = summary;
    session.endTime = new Date().toISOString();
    session.duration = this.calculateDuration(session.startTime, session.endTime);
    
    this.saveSession(session);
    
    // Save summary to context directory for Cursor AI
    const summaryFile = path.join(this.contextDir, `${sessionId}_summary.md`);
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`📋 Summary generated: ${sessionId}`);
    console.log(`📁 Summary saved to: ${summaryFile}`);
    
    return summary;
  }

  // Create summary template
  createSummaryTemplate(session) {
    const template = `# 🧠 Session Summary: ${session.id}

**Date**: ${new Date(session.startTime).toLocaleDateString('pt-BR')}
**Duration**: ${session.duration || 'In progress'}
**Type**: ${session.type}
**Focus**: ${session.focus}

## 🎯 Goals
${session.goals.map(goal => `- ${goal}`).join('\n') || '- No specific goals set'}

## ✅ Achievements
${session.achievements.map(achievement => `- ${achievement}`).join('\n') || '- No achievements recorded'}

## 🚧 Challenges Faced
${session.challenges.map(challenge => `- ${challenge}`).join('\n') || '- No challenges recorded'}

## 📚 Key Learnings
${session.learnings.map(learning => `- ${learning}`).join('\n') || '- No learnings recorded'}

## ❌ Mistakes Made
${session.mistakes.map(mistake => `- ${mistake}`).join('\n') || '- No mistakes recorded'}

## 🔧 Solutions Applied
${session.solutions.map(solution => `- ${solution}`).join('\n') || '- No solutions recorded'}

## 📝 Code Changes
${session.codeChanges.map(change => `- ${change}`).join('\n') || '- No code changes recorded'}

## 📁 Files Modified
${session.filesModified.map(file => `- ${file}`).join('\n') || '- No files modified'}

## 🧪 Tests Run
${session.testsRun.map(test => `- ${test}`).join('\n') || '- No tests run'}

## 🏗️ Build Status
${session.buildStatus || 'Not checked'}

## 🚀 Next Steps
${session.nextSteps.map(step => `- ${step}`).join('\n') || '- No next steps defined'}

## 🏷️ Tags
${session.tags.map(tag => `#${tag}`).join(' ') || 'No tags'}

## 📊 Context
\`\`\`json
${JSON.stringify(session.context, null, 2)}
\`\`\`

---
*Generated by FonoSaaS Session Manager*
`;

    return template;
  }

  // Calculate duration
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    }
    return `${remainingMins}m`;
  }

  // Generate learning context for Cursor AI
  generateLearningContext() {
    const sessions = this.listSessions();
    const recentSessions = sessions.slice(0, 10); // Last 10 sessions
    
    const context = {
      totalSessions: sessions.length,
      recentSessions: recentSessions.length,
      commonMistakes: this.extractCommonMistakes(),
      commonSolutions: this.extractCommonSolutions(),
      frequentChallenges: this.extractFrequentChallenges(),
      learningPatterns: this.extractLearningPatterns(),
      sessionSummaries: recentSessions.map(s => ({
        id: s.id,
        focus: s.focus,
        summary: s.summary
      }))
    };

    const contextFile = path.join(this.contextDir, 'learning_context.json');
    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
    
    console.log('🧠 Learning context generated for Cursor AI');
    return context;
  }

  // Extract common mistakes
  extractCommonMistakes() {
    const sessions = this.listSessions();
    const allMistakes = [];
    
    sessions.forEach(session => {
      const fullSession = this.loadSession(session.id);
      if (fullSession.mistakes) {
        allMistakes.push(...fullSession.mistakes);
      }
    });

    // Count frequency
    const mistakeCount = {};
    allMistakes.forEach(mistake => {
      mistakeCount[mistake] = (mistakeCount[mistake] || 0) + 1;
    });

    return Object.entries(mistakeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([mistake, count]) => ({ mistake, count }));
  }

  // Extract common solutions
  extractCommonSolutions() {
    const sessions = this.listSessions();
    const allSolutions = [];
    
    sessions.forEach(session => {
      const fullSession = this.loadSession(session.id);
      if (fullSession.solutions) {
        allSolutions.push(...fullSession.solutions);
      }
    });

    const solutionCount = {};
    allSolutions.forEach(solution => {
      solutionCount[solution] = (solutionCount[solution] || 0) + 1;
    });

    return Object.entries(solutionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([solution, count]) => ({ solution, count }));
  }

  // Extract frequent challenges
  extractFrequentChallenges() {
    const sessions = this.listSessions();
    const allChallenges = [];
    
    sessions.forEach(session => {
      const fullSession = this.loadSession(session.id);
      if (fullSession.challenges) {
        allChallenges.push(...fullSession.challenges);
      }
    });

    const challengeCount = {};
    allChallenges.forEach(challenge => {
      challengeCount[challenge] = (challengeCount[challenge] || 0) + 1;
    });

    return Object.entries(challengeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([challenge, count]) => ({ challenge, count }));
  }

  // Extract learning patterns
  extractLearningPatterns() {
    const sessions = this.listSessions();
    const patterns = {
      mostProductiveTime: this.analyzeProductiveTime(sessions),
      commonFocusAreas: this.analyzeFocusAreas(sessions),
      sessionLengths: this.analyzeSessionLengths(sessions),
      successFactors: this.analyzeSuccessFactors(sessions)
    };

    return patterns;
  }

  // Analyze productive time
  analyzeProductiveTime(sessions) {
    const hourCount = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    return Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
  }

  // Analyze focus areas
  analyzeFocusAreas(sessions) {
    const focusCount = {};
    sessions.forEach(session => {
      focusCount[session.focus] = (focusCount[session.focus] || 0) + 1;
    });

    return Object.entries(focusCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([focus, count]) => ({ focus, count }));
  }

  // Analyze session lengths
  analyzeSessionLengths(sessions) {
    const lengths = sessions.map(session => {
      const fullSession = this.loadSession(session.id);
      return fullSession.duration || 'Unknown';
    });

    const lengthCount = {};
    lengths.forEach(length => {
      lengthCount[length] = (lengthCount[length] || 0) + 1;
    });

    return Object.entries(lengthCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([length, count]) => ({ length, count }));
  }

  // Analyze success factors
  analyzeSuccessFactors(sessions) {
    const successFactors = [];
    sessions.forEach(session => {
      const fullSession = this.loadSession(session.id);
      if (fullSession.achievements && fullSession.achievements.length > 0) {
        successFactors.push({
          sessionId: session.id,
          achievements: fullSession.achievements.length,
          challenges: fullSession.challenges?.length || 0,
          learnings: fullSession.learnings?.length || 0
        });
      }
    });

    return successFactors.slice(0, 10);
  }

  // Interactive session management
  async startInteractiveSession() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🚀 Starting interactive session management...\n');

    const session = this.createSession();
    console.log(`📝 New session created: ${session.id}\n`);

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      // Get session focus
      const focus = await question('🎯 What is the focus of this session? ');
      session.focus = focus;

      // Get goals
      console.log('\n📋 What are your goals for this session? (Enter one per line, empty line to finish)');
      let goal = await question('Goal: ');
      while (goal.trim()) {
        session.goals.push(goal.trim());
        goal = await question('Goal: ');
      }

      // Get tags
      const tags = await question('\n🏷️ Enter tags (comma-separated): ');
      session.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      this.saveSession(session);
      console.log('\n✅ Session initialized! Start coding...\n');

      // Session monitoring loop
      while (true) {
        const command = await question('💬 Enter command (help for options): ');
        
        if (command === 'help') {
          this.showHelp();
        } else if (command === 'achievement') {
          const achievement = await question('✅ What did you achieve? ');
          session.achievements.push(achievement);
          this.saveSession(session);
        } else if (command === 'challenge') {
          const challenge = await question('🚧 What challenge did you face? ');
          session.challenges.push(challenge);
          this.saveSession(session);
        } else if (command === 'learning') {
          const learning = await question('📚 What did you learn? ');
          session.learnings.push(learning);
          this.saveSession(session);
        } else if (command === 'mistake') {
          const mistake = await question('❌ What mistake did you make? ');
          session.mistakes.push(mistake);
          this.saveSession(session);
        } else if (command === 'solution') {
          const solution = await question('🔧 What solution did you apply? ');
          session.solutions.push(solution);
          this.saveSession(session);
        } else if (command === 'next') {
          const nextStep = await question('🚀 What is the next step? ');
          session.nextSteps.push(nextStep);
          this.saveSession(session);
        } else if (command === 'summary') {
          this.generateSummary(session.id);
          break;
        } else if (command === 'exit') {
          this.generateSummary(session.id);
          break;
        } else {
          console.log('❓ Unknown command. Type "help" for options.');
        }
      }

    } finally {
      rl.close();
    }
  }

  showHelp() {
    console.log(`
🤖 FonoSaaS Session Manager Commands:

📝 Session Management:
  achievement  - Record an achievement
  challenge    - Record a challenge faced
  learning     - Record something learned
  mistake      - Record a mistake made
  solution     - Record a solution applied
  next         - Record next steps
  summary      - Generate session summary
  exit         - Exit and generate summary

📊 Analysis:
  list         - List all sessions
  context      - Generate learning context
  mistakes     - Show common mistakes
  solutions    - Show common solutions
  patterns     - Show learning patterns

❓ Other:
  help         - Show this help
    `);
  }
}

// CLI Interface
if (require.main === module) {
  const sessionManager = new SessionManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      sessionManager.startInteractiveSession();
      break;
    case 'list':
      const sessions = sessionManager.listSessions();
      console.log('📋 Recent Sessions:');
      sessions.forEach(session => {
        console.log(`  ${session.id} - ${session.focus} (${new Date(session.startTime).toLocaleDateString('pt-BR')})`);
      });
      break;
    case 'summary':
      const sessionId = process.argv[3];
      if (sessionId) {
        sessionManager.generateSummary(sessionId);
      } else {
        console.log('❌ Please provide session ID');
      }
      break;
    case 'context':
      sessionManager.generateLearningContext();
      break;
    case 'mistakes':
      const context = sessionManager.generateLearningContext();
      console.log('❌ Common Mistakes:');
      context.commonMistakes.forEach(({mistake, count}) => {
        console.log(`  ${mistake} (${count} times)`);
      });
      break;
    case 'solutions':
      const context2 = sessionManager.generateLearningContext();
      console.log('🔧 Common Solutions:');
      context2.commonSolutions.forEach(({solution, count}) => {
        console.log(`  ${solution} (${count} times)`);
      });
      break;
    case 'patterns':
      const context3 = sessionManager.generateLearningContext();
      console.log('📊 Learning Patterns:');
      console.log('Most Productive Times:', context3.learningPatterns.mostProductiveTime);
      console.log('Common Focus Areas:', context3.learningPatterns.commonFocusAreas);
      break;
    default:
      console.log(`
🤖 FonoSaaS Session Manager

Usage: node session-manager.js <command>

Commands:
  start        - Start interactive session
  list         - List all sessions
  summary <id> - Generate session summary
  context      - Generate learning context
  mistakes     - Show common mistakes
  solutions    - Show common solutions
  patterns     - Show learning patterns
      `);
  }
}

module.exports = SessionManager;
