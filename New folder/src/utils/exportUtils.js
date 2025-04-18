// src/utils/exportUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (data, title) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  // Project data table
  const projectTableData = data.projects.map(project => [
    project.name,
    project.status,
    `${project.progress}%`,
    project.team.length,
    project.resources.length
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Project', 'Status', 'Progress', 'Team Size', 'Resources']],
    body: projectTableData,
  });

  // Resource utilization table
  const resourceTableData = data.resources.map(resource => [
    resource.resource,
    `${resource.used}%`,
    `${resource.available}%`
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Resource', 'Used', 'Available']],
    body: resourceTableData,
  });

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (data, title) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Projects worksheet
  const projectsWS = XLSX.utils.json_to_sheet(data.projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Progress': `${project.progress}%`,
    'Team Size': project.team.length,
    'Resources': project.resources.length,
    'Start Date': new Date(project.startDate).toLocaleDateString(),
    'End Date': new Date(project.endDate).toLocaleDateString()
  })));

  // Resources worksheet
  const resourcesWS = XLSX.utils.json_to_sheet(data.resources.map(resource => ({
    'Resource': resource.resource,
    'Used (%)': resource.used,
    'Available (%)': resource.available
  })));

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, projectsWS, 'Projects');
  XLSX.utils.book_append_sheet(wb, resourcesWS, 'Resources');

  // Save the file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (data, title) => {
  // Convert projects to CSV
  const projectsCSV = data.projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Progress': `${project.progress}%`,
    'Team Size': project.team.length,
    'Resources': project.resources.length,
    'Start Date': new Date(project.startDate).toLocaleDateString(),
    'End Date': new Date(project.endDate).toLocaleDateString()
  }));

  const csv = XLSX.utils.json_to_csv(projectsCSV);
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};