/**
 * Mock API service for development and testing
 * This helps when the main API is down or during development
 */

const sampleLatex = `\\documentclass[a4paper,10pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{fontspec}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{fontawesome5}
\\usepackage{xcolor}

\\definecolor{primary}{RGB}{47, 85, 151}
\\hypersetup{colorlinks=true,linkcolor=primary,urlcolor=primary}

\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{8pt}

\\setmainfont{Arial}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
    {\\Large\\textbf{John Doe}}\\\\[4pt]
    {\\small 
    \\faEnvelope\\ email@example.com $|$ 
    \\faPhone\\ (555) 123-4567 $|$ 
    \\faMapMarker\\ New York, NY $|$
    \\faLinkedin\\ linkedin.com/in/johndoe
    }
\\end{center}

\\section{Professional Summary}
Experienced software engineer with a strong background in web development and cloud technologies.
Proven track record of delivering high-quality solutions that meet business requirements.
Passionate about creating efficient and scalable applications.

\\section{Experience}
\\textbf{Senior Software Engineer} at \\textbf{Tech Solutions Inc.} \\hfill Jan 2020 - Present\\\\
\\begin{itemize}[leftmargin=*]
\\item Led development of cloud-based applications using React, Node.js, and AWS
\\item Implemented CI/CD pipelines that reduced deployment time by 40\\%
\\item Mentored junior developers and conducted code reviews to maintain code quality
\\end{itemize}

\\textbf{Software Developer} at \\textbf{Digital Systems LLC} \\hfill Mar 2017 - Dec 2019\\\\
\\begin{itemize}[leftmargin=*]
\\item Developed and maintained web applications using JavaScript, HTML, and CSS
\\item Created RESTful APIs using Node.js and Express
\\item Collaborated with UX designers to implement responsive user interfaces
\\end{itemize}

\\section{Education}
\\textbf{Bachelor of Science in Computer Science}\\\\
University of Technology \\hfill 2013 - 2017

\\section{Skills}
\\textbf{Programming:} JavaScript, TypeScript, Python, Java, HTML, CSS\\\\
\\textbf{Frameworks:} React, Angular, Node.js, Express, Next.js\\\\
\\textbf{Tools:} Git, Docker, Jenkins, AWS, Azure, MongoDB, PostgreSQL\\\\
\\textbf{Soft Skills:} Team Leadership, Problem-solving, Communication, Agile Methodology

\\end{document}`;

export const mockGenerateResume = async (resumeText, jobDescription, customPrompt = '') => {
  return new Promise((resolve) => {
    console.log("Using mock resume generation service");
    console.log("Resume text length:", resumeText?.length || 0);
    console.log("Job description length:", jobDescription?.length || 0);
    
    // Simulate API delay
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          data: {
            outputlatex: sampleLatex
          }
        }
      });
    }, 2000);
  });
};

export const mockHealthCheck = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          status: "ok",
          version: "mock-1.0.0"
        }
      });
    }, 300);
  });
};

export default {
  generateResume: mockGenerateResume,
  healthCheck: mockHealthCheck
};
