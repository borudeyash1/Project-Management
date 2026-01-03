import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reminder } from '../services/reminderService';

export const exportRemindersToPDF = async (reminders: Reminder[], filename: string = 'reminders.pdf') => {
  const doc = new jsPDF();
  
  // Sartthi Brand Colors
  const sartthiYellow = [255, 193, 7]; // #FFC107
  const sartthiOrange = [255, 152, 0]; // #FF9800
  const darkGray = [51, 51, 51];
  const lightGray = [245, 245, 245];
  
  // Add branded header with gradient effect
  doc.setFillColor(sartthiYellow[0], sartthiYellow[1], sartthiYellow[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add Sartthi logo (load asynchronously)
  try {
    // Load the logo image
    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = '/logosartthi.png';
    });
    
    // Add logo to PDF (small chevron icon at x=14, y=12, width=15, height=15)
    doc.addImage(logoImg, 'PNG', 14, 12, 15, 15);
  } catch (error) {
    console.warn('Logo image not found:', error);
    // Continue without logo - just show text
  }
  
  // Add Sartthi text
  doc.setFontSize(32);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SARTTHI', 14, 22);
  
  // Add subtitle
  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Project Management System', 14, 30);
  
  // Add decorative line
  doc.setDrawColor(sartthiOrange[0], sartthiOrange[1], sartthiOrange[2]);
  doc.setLineWidth(2);
  doc.line(14, 35, 196, 35);
  
  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Reminders Report', 14, 50);
  
  // Add generation date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, 57);
  
  // Add summary box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, 63, 182, 20, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  const completedCount = reminders.filter(r => r.completed).length;
  const overdueCount = reminders.filter(r => !r.completed && new Date(r.dueDate) < new Date()).length;
  const withMeetingLinks = reminders.filter(r => (r as any).meetingLink).length;
  const withLocation = reminders.filter(r => (r as any).location).length;
  
  doc.text(`Total: ${reminders.length}`, 20, 71);
  doc.text(`Completed: ${completedCount}`, 70, 71);
  doc.text(`Pending: ${reminders.length - completedCount}`, 120, 71);
  doc.text(`Overdue: ${overdueCount}`, 20, 78);
  doc.text(`With Links: ${withMeetingLinks}`, 70, 78);
  doc.text(`With Location: ${withLocation}`, 120, 78);
  
  // Prepare comprehensive table data with all fields including links and location
  const tableData = reminders.map(reminder => {
    const reminderAny = reminder as any;
    return [
      reminder.title,
      reminder.description?.substring(0, 40) + (reminder.description && reminder.description.length > 40 ? '...' : '') || '-',
      reminder.type,
      reminder.priority,
      new Date(reminder.dueDate).toLocaleDateString(),
      new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reminder.completed ? 'Yes' : 'No',
      reminder.project?.name || '-',
      reminderAny.location?.substring(0, 25) || '-',
      reminderAny.meetingLink ? 'Yes' : '-',
      reminder.tags?.join(', ').substring(0, 20) || '-',
    ];
  });
  
  // Add comprehensive table
  autoTable(doc, {
    startY: 90,
    head: [['Title', 'Description', 'Type', 'Priority', 'Date', 'Time', 'Done', 'Project', 'Location', 'Link', 'Tags']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [sartthiOrange[0], sartthiOrange[1], sartthiOrange[2]],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' }, // Title
      1: { cellWidth: 30 }, // Description
      2: { cellWidth: 15, halign: 'center' }, // Type
      3: { cellWidth: 15, halign: 'center' }, // Priority
      4: { cellWidth: 18, halign: 'center' }, // Date
      5: { cellWidth: 13, halign: 'center' }, // Time
      6: { cellWidth: 8, halign: 'center' }, // Done
      7: { cellWidth: 18 }, // Project
      8: { cellWidth: 20 }, // Location
      9: { cellWidth: 10, halign: 'center' }, // Link
      10: { cellWidth: 18 }, // Tags
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    didParseCell: (data) => {
      // Color code priority
      if (data.column.index === 3 && data.section === 'body') {
        const priority = data.cell.raw as string;
        switch (priority) {
          case 'urgent':
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [254, 226, 226];
            break;
          case 'high':
            data.cell.styles.textColor = [234, 88, 12];
            data.cell.styles.fillColor = [255, 237, 213];
            break;
          case 'medium':
            data.cell.styles.textColor = [202, 138, 4];
            data.cell.styles.fillColor = [254, 249, 195];
            break;
          case 'low':
            data.cell.styles.textColor = [107, 114, 128];
            break;
        }
      }
      
      // Color code completion status
      if (data.column.index === 6 && data.section === 'body') {
        const completed = data.cell.raw as string;
        if (completed === 'Yes') {
          data.cell.styles.textColor = [34, 197, 94];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [220, 252, 231];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
      
      // Highlight meeting links
      if (data.column.index === 9 && data.section === 'body') {
        const hasLink = data.cell.raw as string;
        if (hasLink === 'Yes') {
          data.cell.styles.textColor = [37, 99, 235];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [219, 234, 254];
        }
      }
    },
  });
  
  // Add detailed section for reminders with meeting links
  const remindersWithLinks = reminders.filter(r => (r as any).meetingLink);
  if (remindersWithLinks.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 90;
    
    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Meeting Links & Details', 14, finalY + 15);
    
    let yPos = finalY + 25;
    
    remindersWithLinks.forEach((reminder, index) => {
      const reminderAny = reminder as any;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Reminder title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`${index + 1}. ${reminder.title}`, 14, yPos);
      yPos += 6;
      
      // Meeting link (without emoji)
      if (reminderAny.meetingLink) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.textWithLink('Link: ' + reminderAny.meetingLink, 20, yPos, { url: reminderAny.meetingLink });
        yPos += 5;
      }
      
      // Location (without emoji)
      if (reminderAny.location) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Location: ' + reminderAny.location, 20, yPos);
        yPos += 5;
      }
      
      // Notes (without emoji)
      if (reminderAny.notes) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const noteLines = doc.splitTextToSize('Notes: ' + reminderAny.notes, 170);
        doc.text(noteLines, 20, yPos);
        yPos += noteLines.length * 4;
      }
      
      yPos += 3;
    });
  }
  
  // Add footer with branding
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(sartthiYellow[0], sartthiYellow[1], sartthiYellow[2]);
    doc.setLineWidth(0.5);
    doc.line(14, doc.internal.pageSize.getHeight() - 15, 196, doc.internal.pageSize.getHeight() - 15);
    
    // Page number
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    
    // Sartthi branding (without emoji)
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Powered by SARTTHI PMS',
      196,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
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
