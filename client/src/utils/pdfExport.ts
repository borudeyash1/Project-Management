import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reminder } from '../services/reminderService';

export const exportRemindersToPDF = (reminders: Reminder[], filename: string = 'reminders.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Reminders Report', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
  
  // Add summary
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text(`Total Reminders: ${reminders.length}`, 14, 38);
  const completedCount = reminders.filter(r => r.completed).length;
  doc.text(`Completed: ${completedCount}`, 14, 44);
  doc.text(`Pending: ${reminders.length - completedCount}`, 14, 50);
  
  // Prepare table data
  const tableData = reminders.map(reminder => [
    reminder.title,
    reminder.type,
    reminder.priority,
    new Date(reminder.dueDate).toLocaleDateString(),
    new Date(reminder.dueDate).toLocaleTimeString(),
    reminder.completed ? 'Yes' : 'No',
    reminder.project?.name || '-',
    reminder.assignee?.name || '-',
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 58,
    head: [['Title', 'Type', 'Priority', 'Date', 'Time', 'Completed', 'Project', 'Assignee']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo color
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Title
      1: { cellWidth: 20 }, // Type
      2: { cellWidth: 20 }, // Priority
      3: { cellWidth: 25 }, // Date
      4: { cellWidth: 20 }, // Time
      5: { cellWidth: 20 }, // Completed
      6: { cellWidth: 25 }, // Project
      7: { cellWidth: 25 }, // Assignee
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didParseCell: (data) => {
      // Color code priority
      if (data.column.index === 2 && data.section === 'body') {
        const priority = data.cell.raw as string;
        switch (priority) {
          case 'urgent':
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fontStyle = 'bold';
            break;
          case 'high':
            data.cell.styles.textColor = [234, 88, 12]; // Orange
            break;
          case 'medium':
            data.cell.styles.textColor = [202, 138, 4]; // Yellow
            break;
          case 'low':
            data.cell.styles.textColor = [107, 114, 128]; // Gray
            break;
        }
      }
      
      // Color code completion status
      if (data.column.index === 5 && data.section === 'body') {
        const completed = data.cell.raw as string;
        if (completed === 'Yes') {
          data.cell.styles.textColor = [34, 197, 94]; // Green
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });
  
  // Add footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(filename);
};

export const exportReminderDetailsToPDF = (reminder: Reminder, filename: string = 'reminder-details.pdf') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('Reminder Details', 14, 22);
  
  let yPos = 35;
  const lineHeight = 8;
  
  // Helper function to add field
  const addField = (label: string, value: string) => {
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(value, 60, yPos);
    yPos += lineHeight;
  };
  
  // Add fields
  addField('Title', reminder.title);
  addField('Type', reminder.type);
  addField('Priority', reminder.priority);
  addField('Due Date', new Date(reminder.dueDate).toLocaleDateString());
  addField('Due Time', new Date(reminder.dueDate).toLocaleTimeString());
  addField('Status', reminder.completed ? 'Completed' : 'Pending');
  
  if (reminder.completedAt) {
    addField('Completed At', new Date(reminder.completedAt).toLocaleString());
  }
  
  if (reminder.project) {
    addField('Project', reminder.project.name);
  }
  
  if (reminder.assignee) {
    addField('Assignee', reminder.assignee.name);
  }
  
  if (reminder.description) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 14, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(reminder.description, 180);
    doc.text(splitDescription, 14, yPos);
    yPos += splitDescription.length * 6;
  }
  
  if (reminder.tags && reminder.tags.length > 0) {
    yPos += 5;
    addField('Tags', reminder.tags.join(', '));
  }
  
  if (reminder.recurring) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text('Recurring:', 14, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`Frequency: ${reminder.recurring.frequency}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Interval: Every ${reminder.recurring.interval} ${reminder.recurring.frequency}`, 20, yPos);
    if (reminder.recurring.endDate) {
      yPos += lineHeight;
      doc.text(`End Date: ${new Date(reminder.recurring.endDate).toLocaleDateString()}`, 20, yPos);
    }
  }
  
  // Save
  doc.save(filename);
};
