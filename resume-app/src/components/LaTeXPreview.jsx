import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';

function LaTeXPreview({ latex }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    if (!latex) {
      setHtmlContent('');
      return;
    }

    try {
      // Process the LaTeX to create a more viewable HTML representation
      const processedHtml = processLatexToHtml(latex);
      setHtmlContent(processedHtml);
      setRenderError(null);
    } catch (error) {
      console.error('Error processing LaTeX:', error);
      setRenderError(error.message);
    }
  }, [latex]);

  // Process LaTeX code to HTML for better rendering
  const processLatexToHtml = (latexCode) => {
    if (!latexCode) return '';
    
    // Extract the document body content
    const bodyMatch = latexCode.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
    if (!bodyMatch || !bodyMatch[1]) {
      throw new Error('Invalid LaTeX: Could not find document body');
    }

    let content = bodyMatch[1];
    
    // Process sections and formatting
    content = content
      // Convert sections to headings
      .replace(/\\section\*?{([^}]*)}/g, '<h2 class="latex-section">$1</h2>')
      .replace(/\\subsection\*?{([^}]*)}/g, '<h3 class="latex-subsection">$1</h3>')
      
      // Process text formatting
      .replace(/\\textbf{([^}]*)}/g, '<strong>$1</strong>')
      .replace(/\\textit{([^}]*)}/g, '<em>$1</em>')
      .replace(/\\underline{([^}]*)}/g, '<u>$1</u>')
      .replace(/\\textrm{([^}]*)}/g, '<span style="font-family:serif">$1</span>')
      .replace(/\\texttt{([^}]*)}/g, '<span style="font-family:monospace">$1</span>')
      
      // Handle environments
      .replace(/\\begin{center}([\s\S]*?)\\end{center}/g, '<div class="latex-center">$1</div>')
      .replace(/\\begin{itemize}([\s\S]*?)\\end{itemize}/g, '<ul class="latex-itemize">$1</ul>')
      .replace(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/g, '<ol class="latex-enumerate">$1</ol>')
      .replace(/\\item\s/g, '<li>')
      .replace(/(<\/li>)?(\s*)<(li|\/ul|\/ol)>/g, '</li>$2<$3>')
      
      // Handle spacing and line breaks
      .replace(/\\\\/g, '<br>')
      .replace(/\\vspace{[^}]*}/g, '<div style="margin-top:0.5em"></div>')
      .replace(/\\hspace{[^}]*}/g, '&nbsp;&nbsp;')
      
      // Handle special commands
      .replace(/\\LaTeX/g, 'LaTeX')
      .replace(/\\TeX/g, 'TeX')
      .replace(/---/g, '—')
      .replace(/--/g, '–')
      .replace(/``/g, '"')
      .replace(/''/g, '"')
      
      // Replace \hfill with justified span
      .replace(/\\hfill/g, '<span style="margin-left:auto">')
      .replace(/<span style="margin-left:auto">([^<]*)/g, '<div style="display:flex;justify-content:space-between"><span></span><span>$1</span></div>')
      
      // Handle URLs and hyperref
      .replace(/\\url{([^}]*)}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\\href{([^}]*)}{([^}]*)}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
      
      // Handle common symbols and icons
      .replace(/\\faEnvelope/g, '📧')
      .replace(/\\faPhone/g, '📞')
      .replace(/\\faMapMarker/g, '📍')
      .replace(/\\faLinkedin/g, '🔗')
      .replace(/\\faGithub/g, '💻')
      .replace(/\\faGlobe/g, '🌐');
    
    return `
      <div class="latex-document">
        ${content}
      </div>
    `;
  };

  if (renderError) {
    return (
      <div className="latex-render-error">
        <p>Error rendering LaTeX preview: {renderError}</p>
        <p>You can still download the PDF to see the final result.</p>
      </div>
    );
  }

  return (
    <div className="latex-preview-paper">
      {htmlContent ? (
        <div 
          className="latex-rendered-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      ) : (
        <div className="latex-no-content">
          <p>No LaTeX content to preview</p>
        </div>
      )}
    </div>
  );
}

export default LaTeXPreview;
