/**
 * Accessibility utilities and testing helpers
 */

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
  selector?: string;
}

export class AccessibilityChecker {
  private issues: AccessibilityIssue[] = [];

  /**
   * Check for missing alt text on images
   */
  checkImageAltText(): AccessibilityIssue[] {
    const images = document.querySelectorAll('img');
    const issues: AccessibilityIssue[] = [];

    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          type: 'error',
          message: 'Image missing alt text or aria-label',
          element: img,
          selector: this.getElementSelector(img),
        });
      }
    });

    return issues;
  }

  /**
   * Check for missing button labels
   */
  checkButtonLabels(): AccessibilityIssue[] {
    const buttons = document.querySelectorAll('button');
    const issues: AccessibilityIssue[] = [];

    buttons.forEach((button) => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          type: 'error',
          message: 'Button missing accessible name',
          element: button,
          selector: this.getElementSelector(button),
        });
      }
    });

    return issues;
  }

  /**
   * Check for missing link labels
   */
  checkLinkLabels(): AccessibilityIssue[] {
    const links = document.querySelectorAll('a');
    const issues: AccessibilityIssue[] = [];

    links.forEach((link) => {
      const hasText = link.textContent?.trim();
      const hasAriaLabel = link.getAttribute('aria-label');
      const hasAriaLabelledBy = link.getAttribute('aria-labelledby');
      const hasTitle = link.getAttribute('title');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
        issues.push({
          type: 'error',
          message: 'Link missing accessible name',
          element: link,
          selector: this.getElementSelector(link),
        });
      }
    });

    return issues;
  }

  /**
   * Check heading hierarchy
   */
  checkHeadingHierarchy(): AccessibilityIssue[] {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: AccessibilityIssue[] = [];
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level > lastLevel + 1) {
        issues.push({
          type: 'warning',
          message: `Heading level ${level} follows heading level ${lastLevel}. Skipped level ${lastLevel + 1}.`,
          element: heading as HTMLElement,
          selector: this.getElementSelector(heading as HTMLElement),
        });
      }

      lastLevel = level;
    });

    return issues;
  }

  /**
   * Check for missing form labels
   */
  checkFormLabels(): AccessibilityIssue[] {
    const inputs = document.querySelectorAll('input, textarea, select');
    const issues: AccessibilityIssue[] = [];

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const placeholder = input.getAttribute('placeholder');

      // Check if input has a label
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);

      if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
        issues.push({
          type: 'error',
          message: 'Form input missing label or accessible name',
          element: input as HTMLElement,
          selector: this.getElementSelector(input as HTMLElement),
        });
      }
    });

    return issues;
  }

  /**
   * Check color contrast (basic check)
   */
  checkColorContrast(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const elements = document.querySelectorAll('*');

    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // This is a simplified check - in a real implementation,
      // you'd want to use a proper contrast calculation library
      if (color === backgroundColor) {
        issues.push({
          type: 'warning',
          message: 'Text and background colors are identical',
          element: element as HTMLElement,
          selector: this.getElementSelector(element as HTMLElement),
        });
      }
    });

    return issues;
  }

  /**
   * Run all accessibility checks
   */
  runAllChecks(): AccessibilityIssue[] {
    this.issues = [];

    this.issues.push(...this.checkImageAltText());
    this.issues.push(...this.checkButtonLabels());
    this.issues.push(...this.checkLinkLabels());
    this.issues.push(...this.checkHeadingHierarchy());
    this.issues.push(...this.checkFormLabels());
    this.issues.push(...this.checkColorContrast());

    return this.issues;
  }

  /**
   * Get a CSS selector for an element
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter((c) => c.trim());
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Get issues by type
   */
  getIssuesByType(type: 'error' | 'warning' | 'info'): AccessibilityIssue[] {
    return this.issues.filter((issue) => issue.type === type);
  }

  /**
   * Get all issues
   */
  getAllIssues(): AccessibilityIssue[] {
    return this.issues;
  }
}

/**
 * Utility function to run accessibility checks
 */
export function runAccessibilityAudit(): AccessibilityIssue[] {
  const checker = new AccessibilityChecker();
  return checker.runAllChecks();
}

/**
 * Utility function to log accessibility issues to console
 */
export function logAccessibilityIssues(issues: AccessibilityIssue[]): void {
  if (issues.length === 0) {
    console.log('✅ No accessibility issues found!');
    return;
  }

  console.group('🔍 Accessibility Audit Results');

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');
  const infos = issues.filter((i) => i.type === 'info');

  if (errors.length > 0) {
    console.group('❌ Errors');
    errors.forEach((issue) => {
      console.error(
        `${issue.message} ${issue.selector ? `(${issue.selector})` : ''}`
      );
    });
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group('⚠️ Warnings');
    warnings.forEach((issue) => {
      console.warn(
        `${issue.message} ${issue.selector ? `(${issue.selector})` : ''}`
      );
    });
    console.groupEnd();
  }

  if (infos.length > 0) {
    console.group('ℹ️ Info');
    infos.forEach((issue) => {
      console.info(
        `${issue.message} ${issue.selector ? `(${issue.selector})` : ''}`
      );
    });
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Hook for React components to run accessibility checks
 */
export function useAccessibilityAudit() {
  const [issues, setIssues] = React.useState<AccessibilityIssue[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const runAudit = React.useCallback(() => {
    setIsRunning(true);
    const results = runAccessibilityAudit();
    setIssues(results);
    logAccessibilityIssues(results);
    setIsRunning(false);
  }, []);

  return {
    issues,
    isRunning,
    runAudit,
    errors: issues.filter((i) => i.type === 'error'),
    warnings: issues.filter((i) => i.type === 'warning'),
    infos: issues.filter((i) => i.type === 'info'),
  };
}

// Make React available for the hook
import React from 'react';
