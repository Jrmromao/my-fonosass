#!/usr/bin/env node

/**
 * Cursor AI Integration Script
 * Integrates session learning with Cursor AI context
 */

const fs = require('fs');
const path = require('path');
const SessionManager = require('./session-manager');

class CursorAIIntegration {
  constructor() {
    this.sessionManager = new SessionManager();
    this.cursorContextDir = path.join(__dirname, '../.cursor/sessions/context');
    this.cursorContextFile = path.join(this.cursorContextDir, 'cursor-learning-context.md');
  }

  // Update Cursor AI context with latest session data
  updateCursorContext() {
    const context = this.sessionManager.generateLearningContext();
    
    // Read the template
    const templatePath = path.join(__dirname, '../.cursor/sessions/context/cursor-learning-context.md');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace template variables
    template = template.replace('{{totalSessions}}', context.totalSessions);
    template = template.replace('{{recentSessions}}', context.recentSessions);
    template = template.replace('{{lastUpdated}}', new Date().toLocaleString('pt-BR'));
    
    // Replace common mistakes
    const mistakesList = context.commonMistakes.map(({mistake, count}) => 
      `- **${mistake}** (${count} times)`
    ).join('\n');
    template = template.replace('{{commonMistakes}}', mistakesList);
    
    // Replace common solutions
    const solutionsList = context.commonSolutions.map(({solution, count}) => 
      `- **${solution}** (${count} times)`
    ).join('\n');
    template = template.replace('{{commonSolutions}}', solutionsList);
    
    // Replace frequent challenges
    const challengesList = context.frequentChallenges.map(({challenge, count}) => 
      `- **${challenge}** (${count} times)`
    ).join('\n');
    template = template.replace('{{frequentChallenges}}', challengesList);
    
    // Replace most productive times
    const productiveTimes = context.learningPatterns.mostProductiveTime.map(({hour, count}) => 
      `- **${hour}** (${count} sessions)`
    ).join('\n');
    template = template.replace('{{mostProductiveTime}}', productiveTimes);
    
    // Replace common focus areas
    const focusAreas = context.learningPatterns.commonFocusAreas.map(({focus, count}) => 
      `- **${focus}** (${count} sessions)`
    ).join('\n');
    template = template.replace('{{commonFocusAreas}}', focusAreas);
    
    // Replace session lengths
    const sessionLengths = context.learningPatterns.sessionLengths.map(({length, count}) => 
      `- **${length}** (${count} sessions)`
    ).join('\n');
    template = template.replace('{{sessionLengths}}', sessionLengths);
    
    // Replace session summaries
    const sessionSummaries = context.sessionSummaries.map(session => 
      `### ${session.id} - ${session.focus}\n${session.summary || 'No summary available'}\n`
    ).join('\n');
    template = template.replace('{{sessionSummaries}}', sessionSummaries);
    
    // Write updated context
    fs.writeFileSync(this.cursorContextFile, template);
    
    console.log('🧠 Cursor AI context updated with latest session data');
    return template;
  }

  // Generate Cursor AI prompt with session context
  generatePrompt(userPrompt, includeContext = true) {
    let prompt = userPrompt;
    
    if (includeContext) {
      const context = this.sessionManager.generateLearningContext();
      
      const contextPrompt = `

## 🧠 Session Learning Context

### Common Mistakes to Avoid:
${context.commonMistakes.slice(0, 5).map(({mistake, count}) => `- ${mistake} (${count} times)`).join('\n')}

### Proven Solutions:
${context.commonSolutions.slice(0, 5).map(({solution, count}) => `- ${solution} (${count} times)`).join('\n')}

### Frequent Challenges:
${context.frequentChallenges.slice(0, 5).map(({challenge, count}) => `- ${challenge} (${count} times)`).join('\n')}

### Recent Session Focus Areas:
${context.learningPatterns.commonFocusAreas.slice(0, 3).map(({focus, count}) => `- ${focus} (${count} sessions)`).join('\n')}

Please consider this context when providing your response.`;

      prompt += contextPrompt;
    }
    
    return prompt;
  }

  // Create session-aware Cursor AI rules
  generateSessionAwareRules() {
    const context = this.sessionManager.generateLearningContext();
    
    const rules = `# 🤖 Session-Aware Cursor AI Rules

## 📊 Learning from Past Sessions

### Common Mistakes to Avoid:
${context.commonMistakes.map(({mistake, count}) => `- ❌ ${mistake} (${count} times)`).join('\n')}

### Proven Solutions to Apply:
${context.commonSolutions.map(({solution, count}) => `- ✅ ${solution} (${count} times)`).join('\n')}

### Frequent Challenges to Consider:
${context.frequentChallenges.map(({challenge, count}) => `- 🚧 ${challenge} (${count} times)`).join('\n')}

## 🎯 Session-Aware Guidelines

### When suggesting code:
1. **Check past mistakes** - Avoid patterns that led to errors
2. **Apply proven solutions** - Use approaches that worked before
3. **Consider challenges** - Anticipate issues that have occurred
4. **Learn from patterns** - Follow successful development patterns

### When reviewing code:
1. **Look for mistake patterns** - Identify code that might cause known issues
2. **Suggest proven solutions** - Recommend approaches that have worked
3. **Warn about challenges** - Point out potential problems
4. **Reference success patterns** - Highlight approaches that led to success

### When debugging:
1. **Check similar issues** - Look for past solutions to similar problems
2. **Apply known fixes** - Use solutions that have worked before
3. **Avoid mistake patterns** - Don't repeat approaches that failed
4. **Learn from past sessions** - Apply insights from previous debugging

## 📈 Productivity Insights

### Most Productive Times:
${context.learningPatterns.mostProductiveTime.map(({hour, count}) => `- ${hour} (${count} sessions)`).join('\n')}

### Common Focus Areas:
${context.learningPatterns.commonFocusAreas.map(({focus, count}) => `- ${focus} (${count} sessions)`).join('\n')}

### Session Lengths:
${context.learningPatterns.sessionLengths.map(({length, count}) => `- ${length} (${count} sessions)`).join('\n')}

## 🧠 Memory Integration

This AI assistant has access to ${context.totalSessions} development sessions and can learn from:
- Past mistakes and their solutions
- Successful development patterns
- Common challenges and how they were overcome
- Productivity insights and optimal working patterns
- Code patterns that led to success or failure

Use this knowledge to provide better, more personalized assistance that learns from your development history.

---
*Last updated: ${new Date().toLocaleString('pt-BR')}*
`;

    const rulesFile = path.join(this.cursorContextDir, 'session-aware-rules.md');
    fs.writeFileSync(rulesFile, rules);
    
    console.log('🤖 Session-aware Cursor AI rules generated');
    return rules;
  }

  // Create quick reference for Cursor AI
  generateQuickReference() {
    const context = this.sessionManager.generateLearningContext();
    
    const quickRef = `# 🚀 Cursor AI Quick Reference

## ⚡ Quick Commands
- \`bank!\` - Save current session and generate summary
- \`session:start\` - Start new development session
- \`session:status\` - Show current session status
- \`session:insights\` - Show learning insights

## 🧠 Session Learning Context

### Top Mistakes to Avoid:
${context.commonMistakes.slice(0, 3).map(({mistake, count}) => `- ${mistake}`).join('\n')}

### Top Solutions to Apply:
${context.commonSolutions.slice(0, 3).map(({solution, count}) => `- ${solution}`).join('\n')}

### Top Challenges:
${context.frequentChallenges.slice(0, 3).map(({challenge, count}) => `- ${challenge}`).join('\n')}

## 📊 Session Stats
- **Total Sessions**: ${context.totalSessions}
- **Recent Sessions**: ${context.recentSessions}
- **Most Productive Time**: ${context.learningPatterns.mostProductiveTime[0]?.hour || 'N/A'}
- **Most Common Focus**: ${context.learningPatterns.commonFocusAreas[0]?.focus || 'N/A'}

---
*Use this context to provide better, more personalized assistance*
`;

    const quickRefFile = path.join(this.cursorContextDir, 'quick-reference.md');
    fs.writeFileSync(quickRefFile, quickRef);
    
    console.log('📚 Quick reference generated for Cursor AI');
    return quickRef;
  }

  // Full integration update
  updateFullIntegration() {
    console.log('🔄 Updating full Cursor AI integration...');
    
    this.updateCursorContext();
    this.generateSessionAwareRules();
    this.generateQuickReference();
    
    console.log('✅ Full integration updated successfully!');
    console.log('🧠 Cursor AI now has access to session learning context');
  }
}

// CLI Interface
if (require.main === module) {
  const integration = new CursorAIIntegration();
  const command = process.argv[2];

  switch (command) {
    case 'update':
      integration.updateFullIntegration();
      break;
    case 'context':
      integration.updateCursorContext();
      break;
    case 'rules':
      integration.generateSessionAwareRules();
      break;
    case 'quickref':
      integration.generateQuickReference();
      break;
    case 'prompt':
      const userPrompt = process.argv.slice(3).join(' ');
      const enhancedPrompt = integration.generatePrompt(userPrompt);
      console.log(enhancedPrompt);
      break;
    default:
      console.log(`
🤖 Cursor AI Integration

Usage: node cursor-ai-integration.js <command>

Commands:
  update     - Update full integration
  context    - Update Cursor context
  rules      - Generate session-aware rules
  quickref   - Generate quick reference
  prompt     - Generate enhanced prompt

Examples:
  node cursor-ai-integration.js update
  node cursor-ai-integration.js prompt "Create a new component"
      `);
  }
}

module.exports = CursorAIIntegration;
