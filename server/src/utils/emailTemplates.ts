import { IProject } from '../types';

interface ChangeDetail {
  field: string;
  label: string;
  before: string;
  after: string;
}

/**
 * Format a value for display in emails
 */
function formatValue(value: any, field: string): string {
  if (value === null || value === undefined) return 'Not set';

  // Handle dates
  if (value instanceof Date) {
    return new Date(value).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Handle budget
  if (field === 'budget.amount' && typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  // Handle arrays (tags)
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None';
  }

  // Handle objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Capitalize status/priority
  if (field === 'status' || field === 'priority') {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  return String(value);
}

/**
 * Detect changes between original and updated project
 */
export function detectProjectChanges(
  original: any,
  updated: any,
  updateData: any
): ChangeDetail[] {
  const changes: ChangeDetail[] = [];

  const fieldLabels: Record<string, string> = {
    name: 'Project Name',
    description: 'Description',
    client: 'Client',
    status: 'Status',
    priority: 'Priority',
    startDate: 'Start Date',
    dueDate: 'Due Date',
    'budget.amount': 'Budget Amount',
    tags: 'Tags'
  };

  // Check simple fields
  for (const [field, label] of Object.entries(fieldLabels)) {
    if (field === 'budget.amount') {
      const originalAmount = typeof original.budget === 'object' ? original.budget?.amount : original.budget;
      const updatedAmount = typeof updated.budget === 'object' ? updated.budget?.amount : updated.budget;

      if (originalAmount !== updatedAmount && updatedAmount !== undefined) {
        changes.push({
          field,
          label,
          before: formatValue(originalAmount, field),
          after: formatValue(updatedAmount, field)
        });
      }
    } else if (field === 'tags') {
      const originalTags = JSON.stringify(original[field] || []);
      const updatedTags = JSON.stringify(updated[field] || []);

      if (originalTags !== updatedTags) {
        changes.push({
          field,
          label,
          before: formatValue(original[field], field),
          after: formatValue(updated[field], field)
        });
      }
    } else {
      const originalValue = original[field];
      const updatedValue = updated[field];

      // Compare dates as timestamps
      if (originalValue instanceof Date && updatedValue instanceof Date) {
        if (originalValue.getTime() !== updatedValue.getTime()) {
          changes.push({
            field,
            label,
            before: formatValue(originalValue, field),
            after: formatValue(updatedValue, field)
          });
        }
      } else if (originalValue !== updatedValue && updatedValue !== undefined) {
        changes.push({
          field,
          label,
          before: formatValue(originalValue, field),
          after: formatValue(updatedValue, field)
        });
      }
    }
  }

  return changes;
}

/**
 * Generate HTML email for project updates
 */
export function generateProjectUpdateEmail(
  changes: ChangeDetail[],
  project: any,
  updaterName: string,
  projectUrl: string
): string {
  if (changes.length === 0) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Project Updated: ${project.name}</h2>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Updated by:</strong> ${updaterName}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
        </div>
        
        <p>The project has been updated.</p>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            View Project →
          </a>
        </div>
      </div>
    `;
  }

  const changesHtml = changes.map(change => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 10px; font-weight: bold; color: #374151; width: 35%;">${change.label}</td>
      <td style="padding: 12px 10px; color: #6b7280;">
        <div style="margin-bottom: 4px;">
          <span style="color: #dc2626; text-decoration: line-through;">${change.before}</span>
        </div>
        <div>
          <span style="color: #16a34a; font-weight: bold;">→ ${change.after}</span>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">Project Updated: ${project.name}</h2>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Updated by:</strong> ${updaterName}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
      </div>
      
      <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">Changes Made (${changes.length}):</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        ${changesHtml}
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          View Project →
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This is an automated notification from your Project Management System.</p>
      </div>
    </div>
  `;
}

/**
 * Generate HTML email for project creation
 */
export function generateProjectCreatedEmail(
  project: any,
  creatorName: string,
  projectUrl: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a; margin-bottom: 20px;">🎉 New Project Created: ${project.name}</h2>
      
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Created by:</strong> ${creatorName}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Project Details:</h3>
        <table style="width: 100%;">
          ${project.description ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 35%;">Description:</td>
              <td style="padding: 8px 0; color: #6b7280;">${project.description}</td>
            </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Status:</td>
            <td style="padding: 8px 0; color: #6b7280;">${project.status || 'Active'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Priority:</td>
            <td style="padding: 8px 0; color: #6b7280;">${project.priority || 'Medium'}</td>
          </tr>
          ${project.dueDate ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Due Date:</td>
              <td style="padding: 8px 0; color: #6b7280;">${new Date(project.dueDate).toLocaleDateString('en-IN')}</td>
            </tr>
          ` : ''}
        </table>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${projectUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          View Project →
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This is an automated notification from your Project Management System.</p>
      </div>
    </div>
  `;
}
