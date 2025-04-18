// src/components/reports/ExportMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, File } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const ExportMenu = ({ onExport, data, title = 'Report' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format) => {
    // Call parent's onExport callback if provided
    if (onExport) {
      onExport(format);
    }

    // Handle actual export
    switch (format) {
      case 'pdf':
        exportToPdf();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCsv();
        break;
      default:
        console.error('Unsupported export format:', format);
    }

    setIsOpen(false);
  };

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Add timestamp
      doc.setFontSize(10);
      const timestamp = new Date().toLocaleString();
      doc.text(`Generated: ${timestamp}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add data table
      if (data && data.projects && data.projects.length > 0) {
        doc.setFontSize(12);
        
        // Project data
        doc.text('Project Overview', 14, 45);
        
        let yPos = 55;
        data.projects.forEach((project, index) => {
          // Add page if we're getting close to the bottom
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`${index + 1}. ${project.name} - Status: ${project.status || 'N/A'}`, 20, yPos);
          yPos += 10;
        });
      }
      
      doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export as PDF');
    }
  };

  const exportToExcel = () => {
    try {
      if (!data || !data.projects) return;
      
      // Convert data to worksheets
      const worksheets = {};
      
      // Projects worksheet
      if (data.projects.length > 0) {
        const projectsData = data.projects.map(project => ({
          'Project Name': project.name,
          'Status': project.status || 'Unknown',
          'Progress': project.progress || 0,
          'Start Date': project.startDate || 'N/A',
          'Due Date': project.dueDate || 'N/A',
          'Team Size': project.team?.length || 0
        }));
        
        worksheets['Projects'] = XLSX.utils.json_to_sheet(projectsData);
      }
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add worksheets to workbook
      Object.entries(worksheets).forEach(([name, worksheet]) => {
        XLSX.utils.book_append_sheet(wb, worksheet, name);
      });
      
      // Save workbook
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export as Excel');
    }
  };

  const exportToCsv = () => {
    try {
      if (!data || !data.projects || data.projects.length === 0) return;
      
      const projectsData = data.projects.map(project => ({
        'Project Name': project.name,
        'Status': project.status || 'Unknown',
        'Progress': project.progress || 0,
        'Start Date': project.startDate || 'N/A',
        'Due Date': project.dueDate || 'N/A',
        'Team Size': project.team?.length || 0
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(projectsData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export as CSV');
    }
  };

  const exportOptions = [
    { label: 'PDF Report', icon: FileText, format: 'pdf' },
    { label: 'Excel Spreadsheet', icon: Table, format: 'excel' },
    { label: 'CSV File', icon: File, format: 'csv' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Download size={20} />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
          <div className="py-2">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100"
              >
                <option.icon size={18} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;