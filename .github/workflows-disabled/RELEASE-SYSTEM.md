# 🚀 Automatic Release System

This repository includes an automatic release system that creates version tags and GitHub releases based on different triggers.

## 📋 **Release Triggers**

### 1. **Production Deployment Releases** 🚀
- **Trigger**: Successful production deployment
- **Version**: Patch increment (1.5.0 → 1.5.1)
- **Workflow**: `release-manager.yml`
- **When**: Every time code is deployed to production

### 2. **Daily Releases** 📅
- **Trigger**: Scheduled daily at 9 AM UTC
- **Version**: Patch increment (1.5.0 → 1.5.1)
- **Workflow**: `release-manager.yml`
- **When**: Every day automatically

### 3. **Manual Releases** 👤
- **Trigger**: Manual workflow dispatch
- **Version**: Configurable (patch/minor/major)
- **Workflow**: `release-manager.yml`
- **When**: On-demand by developers

## 🏷️ **Versioning Strategy**

### **Starting Version**: 1.5.0
- All releases start from version 1.5.0
- Follows [Semantic Versioning](https://semver.org/)

### **Version Increments**:
- **Patch** (1.5.0 → 1.5.1): Bug fixes, small changes
- **Minor** (1.5.0 → 1.6.0): New features, backward compatible
- **Major** (1.5.0 → 2.0.0): Breaking changes

### **Automatic Versioning**:
- **Production deployments**: Always patch increment
- **Daily releases**: Always patch increment
- **Manual releases**: Configurable (patch/minor/major)

## 📊 **Release Information**

Each release includes:

### **Release Notes**:
- Version number and date
- Commit hash and trigger information
- List of changes since last release
- Links to commits and comparisons

### **GitHub Release**:
- Tagged with version number (e.g., `v1.5.1`)
- Detailed release notes
- Download links for source code
- Links to commit history

### **Package.json Update**:
- Version automatically updated in `package.json`
- Committed back to repository
- Tagged with `[skip ci]` to prevent loops

## 🔄 **Workflow Process**

### **1. Trigger Detection**
```yaml
# Production deployment
workflow_run:
  workflows: ["Deploy to Production", "Bulletproof Production Deploy"]
  types: [completed]
  branches: [main]

# Daily schedule
schedule:
  - cron: '0 9 * * *'

# Manual dispatch
workflow_dispatch:
  inputs:
    release_type: [patch, minor, major]
    custom_version: string
    release_notes: string
```

### **2. Version Calculation**
```bash
# Get latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 || echo "v1.5.0")

# Calculate next version based on type
case "$RELEASE_TYPE" in
  "major") NEW_VERSION="$((MAJOR + 1)).0.0" ;;
  "minor") NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
  "patch") NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
esac
```

### **3. Release Creation**
```bash
# Create annotated tag
git tag -a "v$NEW_VERSION" -m "Release $NEW_VERSION - $REASON"

# Push tag
git push origin "v$NEW_VERSION"

# Create GitHub release
gh release create "v$NEW_VERSION" --title "Release $NEW_VERSION" --notes "$NOTES"
```

## 🎯 **Usage Examples**

### **Automatic Production Release**
```bash
# When you push to main and deployment succeeds:
# ✅ Creates v1.5.1 automatically
# ✅ Updates package.json
# ✅ Creates GitHub release
# ✅ Includes deployment details
```

### **Daily Release**
```bash
# Every day at 9 AM UTC:
# ✅ Creates v1.5.2 automatically
# ✅ Includes all commits since last release
# ✅ Updates package.json
# ✅ Creates GitHub release
```

### **Manual Release**
```bash
# Go to Actions → Release Manager → Run workflow
# Choose release type: patch/minor/major
# Optionally provide custom version or release notes
# ✅ Creates release with your specifications
```

## 📈 **Release History**

### **Viewing Releases**:
- **GitHub**: Go to Releases tab in repository
- **Tags**: View all version tags in repository
- **Commits**: Each release includes commit history

### **Release URLs**:
- **Latest Release**: `https://github.com/owner/repo/releases/latest`
- **Specific Release**: `https://github.com/owner/repo/releases/tag/v1.5.1`
- **Compare Versions**: `https://github.com/owner/repo/compare/v1.5.0...v1.5.1`

## 🔧 **Configuration**

### **Environment Variables**:
```yaml
env:
  STARTING_VERSION: "1.5.0"  # Starting version for releases
```

### **Required Secrets**:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### **Customization**:
- **Schedule**: Modify cron expression in workflow
- **Starting Version**: Change `STARTING_VERSION` environment variable
- **Release Notes**: Customize template in workflow

## 🚨 **Troubleshooting**

### **Common Issues**:

1. **Tag Already Exists**
   ```
   ⚠️ Tag v1.5.1 already exists
   ```
   **Solution**: The release was already created, this is normal for rapid deployments

2. **No Commits Since Last Release**
   ```
   - No new commits since last release
   ```
   **Solution**: This is normal for daily releases with no changes

3. **Permission Denied**
   ```
   ❌ Permission denied to push tag
   ```
   **Solution**: Check `GITHUB_TOKEN` permissions

### **Manual Override**:
If automatic releases fail, you can manually create releases:
```bash
# Create tag manually
git tag -a v1.5.1 -m "Manual release v1.5.1"
git push origin v1.5.1

# Create GitHub release manually
gh release create v1.5.1 --title "Release 1.5.1" --notes "Manual release"
```

## 📊 **Benefits**

### **For Development**:
- ✅ **Automatic versioning** - No manual version management
- ✅ **Release tracking** - Every deployment gets a release
- ✅ **Change history** - Clear record of what changed
- ✅ **Rollback capability** - Easy to revert to previous versions

### **For Production**:
- ✅ **Deployment tracking** - Know exactly what's deployed
- ✅ **Version consistency** - package.json always matches releases
- ✅ **Audit trail** - Complete history of all releases
- ✅ **Automated process** - No human intervention required

## 🎯 **Best Practices**

1. **Use Semantic Versioning** - Follow semver for meaningful version numbers
2. **Review Release Notes** - Check generated release notes for accuracy
3. **Monitor Release Frequency** - Daily releases ensure regular updates
4. **Keep Release History** - Don't delete old releases
5. **Use Manual Releases** - For major version bumps or special releases

---

**🎉 Your release system is now fully automated! Every deployment and daily update will create a proper release with version tags and detailed release notes.**
