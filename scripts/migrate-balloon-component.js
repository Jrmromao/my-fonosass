#!/usr/bin/env node

/**
 * Balloon Component Migration Script
 * 
 * This script helps migrate from the original Balloon component
 * to the optimized version while preserving functionality.
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function createBackup() {
    const originalPath = path.join(__dirname, '../components/Balloon.tsx');
    const backupPath = path.join(__dirname, '../components/Balloon.tsx.backup');
    
    if (fs.existsSync(originalPath)) {
        fs.copyFileSync(originalPath, backupPath);
        log('✅ Backup created: components/Balloon.tsx.backup', 'green');
        return true;
    } else {
        log('❌ Original Balloon.tsx not found', 'red');
        return false;
    }
}

function migrateComponent() {
    const optimizedPath = path.join(__dirname, '../components/Balloon/BalloonOptimized.tsx');
    const targetPath = path.join(__dirname, '../components/Balloon.tsx');
    
    if (fs.existsSync(optimizedPath)) {
        fs.copyFileSync(optimizedPath, targetPath);
        log('✅ Optimized component installed', 'green');
        return true;
    } else {
        log('❌ Optimized component not found', 'red');
        return false;
    }
}

function verifyMigration() {
    const targetPath = path.join(__dirname, '../components/Balloon.tsx');
    
    if (fs.existsSync(targetPath)) {
        const content = fs.readFileSync(targetPath, 'utf8');
        
        // Check for optimization markers
        const hasSpatialPartitioning = content.includes('hitDetectionGridRef');
        const hasCaching = content.includes('cachedGradientsRef');
        const hasBatchProcessing = content.includes('BALLOON_UPDATE_BATCH_SIZE');
        
        if (hasSpatialPartitioning && hasCaching && hasBatchProcessing) {
            log('✅ Migration verification passed', 'green');
            return true;
        } else {
            log('⚠️  Migration verification failed - optimizations not detected', 'yellow');
            return false;
        }
    } else {
        log('❌ Target file not found', 'red');
        return false;
    }
}

function rollback() {
    const backupPath = path.join(__dirname, '../components/Balloon.tsx.backup');
    const targetPath = path.join(__dirname, '../components/Balloon.tsx');
    
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, targetPath);
        log('✅ Rollback completed', 'green');
        return true;
    } else {
        log('❌ Backup file not found', 'red');
        return false;
    }
}

function showUsage() {
    log('\n🚀 Balloon Component Migration Script\n', 'cyan');
    log('Usage:', 'bright');
    log('  node scripts/migrate-balloon-component.js [command]\n', 'reset');
    log('Commands:', 'bright');
    log('  migrate    - Migrate to optimized component', 'green');
    log('  rollback   - Rollback to original component', 'yellow');
    log('  verify     - Verify current migration status', 'blue');
    log('  help       - Show this help message\n', 'magenta');
    log('Examples:', 'bright');
    log('  node scripts/migrate-balloon-component.js migrate', 'reset');
    log('  node scripts/migrate-balloon-component.js rollback', 'reset');
    log('  node scripts/migrate-balloon-component.js verify', 'reset');
}

function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            log('🚀 Starting Balloon component migration...\n', 'cyan');
            
            if (createBackup()) {
                if (migrateComponent()) {
                    if (verifyMigration()) {
                        log('\n🎉 Migration completed successfully!', 'green');
                        log('\nNext steps:', 'bright');
                        log('1. Test the application to ensure functionality is preserved', 'reset');
                        log('2. Monitor performance improvements', 'reset');
                        log('3. Run your test suite to verify no regressions', 'reset');
                        log('\nIf issues arise, run: node scripts/migrate-balloon-component.js rollback', 'yellow');
                    } else {
                        log('\n⚠️  Migration completed but verification failed', 'yellow');
                        log('Please test the application manually', 'reset');
                    }
                } else {
                    log('\n❌ Migration failed', 'red');
                }
            } else {
                log('\n❌ Cannot create backup - migration aborted', 'red');
            }
            break;
            
        case 'rollback':
            log('🔄 Starting rollback...\n', 'yellow');
            
            if (rollback()) {
                log('\n✅ Rollback completed successfully!', 'green');
                log('The original Balloon component has been restored.', 'reset');
            } else {
                log('\n❌ Rollback failed', 'red');
            }
            break;
            
        case 'verify':
            log('🔍 Verifying migration status...\n', 'blue');
            
            if (verifyMigration()) {
                log('\n✅ Optimized component is active', 'green');
            } else {
                log('\n⚠️  Original component is active or verification failed', 'yellow');
            }
            break;
            
        case 'help':
        case '--help':
        case '-h':
            showUsage();
            break;
            
        default:
            log('❌ Unknown command: ' + (command || 'none'), 'red');
            log('Use "help" to see available commands', 'yellow');
            showUsage();
            break;
    }
}

// Run the script
main();
