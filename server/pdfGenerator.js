const PDFDocument = require('pdfkit');

/**
 * Generates a PDF from resume data
 * @param {Object} resumeData - The resume data from the form
 * @returns {Promise<Buffer>} - PDF as buffer
 */
async function generatePdf(resumeData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Buffer to store PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Extract resume data
      const { personalInfo, workExperience, education, skills } = resumeData;
      
      // Set default fonts
      doc.font('Helvetica');
      
      // Header with personal info
      doc.fontSize(24).text(personalInfo.fullName, { align: 'center' });
      doc.moveDown(0.5);
      
      // Contact info line
      const contactInfo = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.address
      ].filter(Boolean).join(' | ');
      
      doc.fontSize(10).text(contactInfo, { align: 'center' });
      
      // Add links if provided
      const links = [
        personalInfo.linkedin,
        personalInfo.github,
        personalInfo.website
      ].filter(Boolean);
      
      if (links.length > 0) {
        doc.moveDown(0.3);
        doc.fontSize(10).text(links.join(' | '), { align: 'center' });
      }
      
      doc.moveDown();
      doc.lineWidth(1).lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Objective/Summary
      if (personalInfo.objective) {
        doc.fontSize(12).text('PROFESSIONAL SUMMARY', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(personalInfo.objective);
        doc.moveDown();
      }
      
      // Work Experience
      doc.fontSize(12).text('WORK EXPERIENCE', { underline: true });
      doc.moveDown(0.5);
      
      workExperience.forEach(job => {
        doc.fontSize(11).text(`${job.position} - ${job.company}`, { bold: true });
        
        const dateText = `${formatDate(job.startDate)} - ${job.current ? 'Present' : formatDate(job.endDate)}`;
        doc.fontSize(10).text(dateText, { italics: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).text(job.description);
        doc.moveDown();
      });
      
      // Education
      doc.fontSize(12).text('EDUCATION', { underline: true });
      doc.moveDown(0.5);
      
      education.forEach(edu => {
        doc.fontSize(11).text(`${edu.degree} in ${edu.field}`, { bold: true });
        doc.fontSize(10).text(`${edu.institution}`, { bold: true });
        
        const eduDateText = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
        doc.fontSize(10).text(eduDateText, { italics: true });
        
        if (edu.gpa) {
          doc.fontSize(10).text(`GPA: ${edu.gpa}`);
        }
        
        doc.moveDown();
      });
      
      // Skills
      doc.fontSize(12).text('SKILLS', { underline: true });
      doc.moveDown(0.5);
      
      const technicalSkills = skills.technical.split(',').map(skill => skill.trim());
      doc.fontSize(10).text('Technical Skills:', { bold: true });
      doc.fontSize(10).text(technicalSkills.join(', '));
      doc.moveDown(0.5);
      
      if (skills.soft) {
        const softSkills = skills.soft.split(',').map(skill => skill.trim());
        doc.fontSize(10).text('Soft Skills:', { bold: true });
        doc.fontSize(10).text(softSkills.join(', '));
        doc.moveDown(0.5);
      }
      
      if (skills.languages) {
        const languages = skills.languages.split(',').map(lang => lang.trim());
        doc.fontSize(10).text('Languages:', { bold: true });
        doc.fontSize(10).text(languages.join(', '));
        doc.moveDown(0.5);
      }
      
      if (skills.certifications) {
        const certifications = skills.certifications.split(',').map(cert => cert.trim());
        doc.fontSize(10).text('Certifications:', { bold: true });
        doc.fontSize(10).text(certifications.join(', '));
      }
      
      // Footer with page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format date from YYYY-MM to Month YYYY
 * @param {string} dateString - Date in YYYY-MM format
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  if (!dateString || dateString === 'Present') return 'Present';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

module.exports = { generatePdf };
