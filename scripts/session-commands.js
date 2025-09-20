#!/usr/bin/env node

/**
 * Quick Session Commands for FonoSaaS
 * Provides easy-to-use commands for session management
 */

const SessionManager = require('./session-manager');
const fs = require('fs');
const path = require('path');

class SessionCommands {
  constructor() {
    this.sessionManager = new SessionManager();
    this.currentSession = this.loadCurrentSession();
  }

  // Load current session from file
  loadCurrentSession() {
    const currentSessionFile = path.join(__dirname, '../.cursor/sessions/current-session.json');
    if (fs.existsSync(currentSessionFile)) {
      try {
        return JSON.parse(fs.readFileSync(currentSessionFile, 'utf8'));
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // Save current session to file
  saveCurrentSession() {
    if (this.currentSession) {
      const currentSessionFile = path.join(__dirname, '../.cursor/sessions/current-session.json');
      fs.writeFileSync(currentSessionFile, JSON.stringify(this.currentSession, null, 2));
    }
  }

  // Bank command - save current session and generate summary
  async bank() {
    if (!this.currentSession) {
      console.log('❌ No active session. Starting new session...');
      this.currentSession = this.sessionManager.createSession();
    }

    console.log('🏦 Banking session...');
    const summary = this.sessionManager.generateSummary(this.currentSession.id);
    
    // Generate learning context for Cursor AI
    this.sessionManager.generateLearningContext();
    
    console.log('✅ Session banked successfully!');
    console.log('🧠 Learning context updated for Cursor AI');
    
    // Reset current session
    this.currentSession = null;
    this.saveCurrentSession();
    
    return summary;
  }

  // Start new session
  start(focus = 'general', type = 'development') {
    this.currentSession = this.sessionManager.createSession({
      focus,
      type,
      context: {
        timestamp: new Date().toISOString(),
        workingDirectory: process.cwd(),
        gitBranch: this.getCurrentGitBranch()
      }
    });
    
    this.saveCurrentSession();
    
    console.log(`🚀 New session started: ${this.currentSession.id}`);
    console.log(`🎯 Focus: ${focus}`);
    console.log(`📝 Type: ${type}`);
    
    return this.currentSession;
  }

  // Add achievement to current session
  achievement(achievement) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.achievements.push(achievement);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`✅ Achievement recorded: ${achievement}`);
  }

  // Add challenge to current session
  challenge(challenge) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.challenges.push(challenge);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`🚧 Challenge recorded: ${challenge}`);
  }

  // Add learning to current session
  learning(learning) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.learnings.push(learning);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`📚 Learning recorded: ${learning}`);
  }

  // Add mistake to current session
  mistake(mistake) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.mistakes.push(mistake);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`❌ Mistake recorded: ${mistake}`);
  }

  // Add solution to current session
  solution(solution) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.solutions.push(solution);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`🔧 Solution recorded: ${solution}`);
  }

  // Add next step to current session
  nextStep(step) {
    if (!this.currentSession) {
      console.log('❌ No active session. Start a session first.');
      return;
    }

    this.currentSession.nextSteps.push(step);
    this.sessionManager.saveSession(this.currentSession);
    this.saveCurrentSession();
    console.log(`🚀 Next step recorded: ${step}`);
  }

  // Show session status
  status() {
    if (!this.currentSession) {
      console.log('❌ No active session');
      return;
    }

    console.log(`📊 Session Status: ${this.currentSession.id}`);
    console.log(`🎯 Focus: ${this.currentSession.focus}`);
    console.log(`📝 Type: ${this.currentSession.type}`);
    console.log(`✅ Achievements: ${this.currentSession.achievements.length}`);
    console.log(`🚧 Challenges: ${this.currentSession.challenges.length}`);
    console.log(`📚 Learnings: ${this.currentSession.learnings.length}`);
    console.log(`❌ Mistakes: ${this.currentSession.mistakes.length}`);
    console.log(`🔧 Solutions: ${this.currentSession.solutions.length}`);
    console.log(`🚀 Next Steps: ${this.currentSession.nextSteps.length}`);
  }

  // List recent sessions
  list() {
    const sessions = this.sessionManager.listSessions();
    console.log('📋 Recent Sessions:');
    sessions.slice(0, 10).forEach(session => {
      console.log(`  ${session.id} - ${session.focus} (${new Date(session.startTime).toLocaleDateString('pt-BR')})`);
    });
  }

  // Show learning insights
  insights() {
    const context = this.sessionManager.generateLearningContext();
    
    console.log('🧠 Learning Insights:');
    console.log(`📊 Total Sessions: ${context.totalSessions}`);
    console.log(`📈 Recent Sessions: ${context.recentSessions}`);
    
    console.log('\n❌ Common Mistakes:');
    context.commonMistakes.slice(0, 5).forEach(({mistake, count}) => {
      console.log(`  ${mistake} (${count} times)`);
    });
    
    console.log('\n🔧 Common Solutions:');
    context.commonSolutions.slice(0, 5).forEach(({solution, count}) => {
      console.log(`  ${solution} (${count} times)`);
    });
    
    console.log('\n🚧 Frequent Challenges:');
    context.frequentChallenges.slice(0, 5).forEach(({challenge, count}) => {
      console.log(`  ${challenge} (${count} times)`);
    });
  }

  // Get current git branch
  getCurrentGitBranch() {
    try {
      const { execSync } = require('child_process');
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  // Create session from git commit
  createFromGitCommit(commitHash) {
    try {
      const { execSync } = require('child_process');
      const commitMessage = execSync(`git log --format=%B -n 1 ${commitHash}`, { encoding: 'utf8' }).trim();
      const commitFiles = execSync(`git diff --name-only ${commitHash}^ ${commitHash}`, { encoding: 'utf8' }).trim().split('\n');
      
      const session = this.sessionManager.createSession({
        focus: 'git-commit',
        type: 'development',
        context: {
          commitHash,
          commitMessage,
          filesChanged: commitFiles
        }
      });
      
      console.log(`📝 Session created from git commit: ${commitHash}`);
      return session;
    } catch (error) {
      console.log('❌ Error creating session from git commit:', error.message);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const commands = new SessionCommands();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'bank':
      commands.bank();
      break;
    case 'start':
      commands.start(args[0] || 'general', args[1] || 'development');
      break;
    case 'achievement':
      commands.achievement(args.join(' '));
      break;
    case 'challenge':
      commands.challenge(args.join(' '));
      break;
    case 'learning':
      commands.learning(args.join(' '));
      break;
    case 'mistake':
      commands.mistake(args.join(' '));
      break;
    case 'solution':
      commands.solution(args.join(' '));
      break;
    case 'next':
      commands.nextStep(args.join(' '));
      break;
    case 'status':
      commands.status();
      break;
    case 'list':
      commands.list();
      break;
    case 'insights':
      commands.insights();
      break;
    case 'git':
      commands.createFromGitCommit(args[0]);
      break;
    default:
      console.log(`
🤖 FonoSaaS Session Commands

Usage: node session-commands.js <command> [args...]

Commands:
  bank                    - Save current session and generate summary
  start [focus] [type]    - Start new session
  achievement <text>      - Record achievement
  challenge <text>        - Record challenge
  learning <text>         - Record learning
  mistake <text>          - Record mistake
  solution <text>         - Record solution
  next <text>             - Record next step
  status                  - Show current session status
  list                    - List recent sessions
  insights                - Show learning insights
  git <commit-hash>       - Create session from git commit

Examples:
  node session-commands.js start "feature development" "coding"
  node session-commands.js achievement "Implemented user authentication"
  node session-commands.js mistake "Forgot to validate input"
  node session-commands.js bank
      `);
  }
}

module.exports = SessionCommands;
