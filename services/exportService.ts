import { type Exam, type UserAnswers, QuestionType } from '../types';

/**
 * Helper function to sanitize HTML content.
 */
const escapeHTML = (str: string): string => {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
};

/**
 * Generates the complete HTML structure with themes, styles, and interactivity scripts.
 */
const getThemedHTMLWrapper = (title: string, body: string, questionsDataJSON: string = 'null'): string => {
  return `
    <!DOCTYPE html>
    <html lang="en" data-theme="forest">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHTML(title)}</title>
      <style>
        :root, html[data-theme='light'] {
          --bg-primary: #f9fafb; /* gray-50 */
          --bg-secondary: #ffffff;
          --text-primary: #111827; /* gray-900 */
          --text-secondary: #4b5563; /* gray-600 */
          --accent: #3b82f6; /* blue-500 */
          --border-color: #e5e7eb; /* gray-200 */
          --correct-bg: #dcfce7; /* green-100 */
          --correct-text: #166534; /* green-800 */
          --incorrect-bg: #fee2e2; /* red-100 */
          --incorrect-text: #991b1b; /* red-800 */
        }
        html[data-theme='dark'] {
          --bg-primary: #1f2937; /* gray-800 */
          --bg-secondary: #374151; /* gray-700 */
          --text-primary: #f9fafb; /* gray-50 */
          --text-secondary: #9ca3af; /* gray-400 */
          --accent: #60a5fa; /* blue-400 */
          --border-color: #4b5563; /* gray-600 */
          --correct-bg: #14532d; /* green-900 */
          --correct-text: #bbf7d0; /* green-300 */
          --incorrect-bg: #7f1d1d; /* red-900 */
          --incorrect-text: #fecaca; /* red-300 */
        }
        html[data-theme='forest'] {
          --bg-primary: #1c2c2b;
          --bg-secondary: #283c3b;
          --text-primary: #e4e5dc;
          --text-secondary: #a1aaa2;
          --accent: #8bc34a;
          --border-color: #3f5857;
          --correct-bg: #2e4b32;
          --correct-text: #a4f1ac;
          --incorrect-bg: #5a3030;
          --incorrect-text: #da6161;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: var(--text-primary); background-color: var(--bg-primary); max-width: 800px; margin: 20px auto; padding: 20px; transition: background-color 0.3s, color 0.3s; overflow-wrap: break-word; }
        .container { background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 2rem; }
        h1, h2, h3 { color: var(--text-primary); overflow-wrap: break-word; }
        h1 { border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
        .question { margin-bottom: 2rem; border-left: 4px solid var(--accent); padding-left: 1rem; overflow-wrap: break-word; }
        .options { list-style: none; padding: 0; }
        .option { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 0.5rem; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer; transition: border-color 0.2s; overflow-wrap: break-word; }
        .option:hover { border-color: var(--accent); }
        .option input { margin-top: 5px; flex-shrink: 0; }
        .option > div { flex-grow: 1; }
        .option.correct { background-color: var(--correct-bg); color: var(--correct-text); border-color: var(--correct-text); }
        .option.incorrect { background-color: var(--incorrect-bg); color: var(--incorrect-text); border-color: var(--incorrect-text); }
        .option.user-choice { box-shadow: 0 0 0 2px var(--accent); }
        .explanation { font-style: italic; color: var(--text-secondary); margin-top: 0.5rem; border-left: 2px solid var(--border-color); padding-left: 10px; font-size: 0.9em; display: none; overflow-wrap: break-word; }
        .explanation.visible { display: block; }
        .score { font-size: 1.5em; font-weight: bold; color: var(--accent); }
        .button { background-color: var(--accent); color: white; border: none; padding: 12px 24px; font-size: 1em; font-weight: bold; border-radius: 6px; cursor: pointer; transition: opacity 0.2s; }
        .button:hover { opacity: 0.9; }
        .button.secondary { background-color: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); }
        .hidden { display: none; }
        #results-summary { text-align: center; margin-bottom: 2rem; }
        .theme-switcher { position: fixed; top: 15px; right: 20px; }
        .theme-switcher select { background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 5px 10px; border-radius: 5px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="theme-switcher">
        <select id="themeSelector">
          <option value="forest">Forest</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="container">
        ${body}
      </div>
      <script id="questionsData" type="application/json">${questionsDataJSON}</script>
      <script>
        (function() {
          const themeSelector = document.getElementById('themeSelector');
          const htmlEl = document.documentElement;

          function applyTheme(theme) {
            htmlEl.setAttribute('data-theme', theme);
            themeSelector.value = theme;
            localStorage.setItem('exportedQuizTheme', theme);
          }

          themeSelector.addEventListener('change', (e) => applyTheme(e.target.value));

          const savedTheme = localStorage.getItem('exportedQuizTheme');
          if (savedTheme) {
            applyTheme(savedTheme);
          }

          const checkBtn = document.getElementById('check-answers-btn');
          const resetBtn = document.getElementById('reset-btn');
          const resultsSummary = document.getElementById('results-summary');
          const questionsData = JSON.parse(document.getElementById('questionsData').textContent || '[]');

          if (!checkBtn) return; // Not a template, exit script

          checkBtn.addEventListener('click', () => {
            let correctCount = 0;
            const questionElements = document.querySelectorAll('.question');
            
            questionElements.forEach((qEl, qIndex) => {
              const questionInfo = questionsData[qIndex];
              const correctIndices = questionInfo.options.map((opt, i) => opt.isCorrect ? i : -1).filter(i => i !== -1);
              const inputs = qEl.querySelectorAll('input');
              const userIndices = Array.from(inputs).map((input, i) => input.checked ? i : -1).filter(i => i !== -1);
              
              const isCorrect = correctIndices.length === userIndices.length && correctIndices.every(i => userIndices.includes(i));
              if(isCorrect) correctCount++;
              
              inputs.forEach((input, oIndex) => {
                const optionEl = input.closest('.option');
                if (optionEl) {
                    const explanationEl = optionEl.querySelector('.explanation');
                    if(explanationEl) explanationEl.classList.add('visible');
                    if (correctIndices.includes(oIndex)) {
                      optionEl.classList.add('correct');
                    } else if (userIndices.includes(oIndex)) {
                      optionEl.classList.add('incorrect');
                    }
                }
                input.disabled = true;
              });
            });

            const score = (correctCount / questionsData.length) * 100;
            resultsSummary.innerHTML = \`<h2>Final Score: <span class="score">\${score.toFixed(0)}%</span></h2>\`;
            resultsSummary.classList.remove('hidden');
            checkBtn.classList.add('hidden');
            resetBtn.classList.remove('hidden');
          });

          resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.question').forEach(qEl => {
              qEl.querySelectorAll('input').forEach(input => {
                input.checked = false;
                input.disabled = false;
                const optionEl = input.closest('.option');
                 if (optionEl) {
                    optionEl.classList.remove('correct', 'incorrect');
                    const explanationEl = optionEl.querySelector('.explanation');
                    if(explanationEl) explanationEl.classList.remove('visible');
                 }
              });
            });
            resultsSummary.classList.add('hidden');
            checkBtn.classList.remove('hidden');
            resetBtn.classList.add('hidden');
          });
        })();
      </script>
    </body>
    </html>
  `;
};

/**
 * Creates the HTML body for an interactive exam template.
 */
const createExamTemplateBody = (exam: Exam): string => {
  let body = `<h1>${escapeHTML(exam.title)}</h1>`;
  body += `<h2>Topic: ${escapeHTML(exam.topic)}</h2>`;

  exam.questions.forEach((q, qIndex) => {
    body += `
      <div class="question" id="q${qIndex}">
        <h3>${qIndex + 1}. ${escapeHTML(q.questionText)}</h3>
        <div class="options">
          ${q.options.map((opt, oIndex) => `
            <label class="option">
              <input type="${q.questionType === QuestionType.MULTIPLE_CHOICE ? 'radio' : 'checkbox'}" name="q${qIndex}">
              <div>
                <span>${escapeHTML(opt.optionText)}</span>
                <div class="explanation">${escapeHTML(opt.explanation)}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  body += `
    <div id="results-summary" class="hidden"></div>
    <div style="text-align: center; margin-top: 2rem;">
      <button id="check-answers-btn" class="button">Check Answers</button>
      <button id="reset-btn" class="button secondary hidden">Reset Quiz</button>
    </div>
  `;

  return body;
};

/**
 * Creates the HTML body for exam results.
 */
const createExamResultsBody = (exam: Exam, results: { userAnswers: UserAnswers; score: number }): string => {
  let body = `<h1>Results: ${escapeHTML(exam.title)}</h1>`;
  body += `<div id="results-summary"><h2>Final Score: <span class="score">${results.score.toFixed(0)}%</span></h2></div>`;

  exam.questions.forEach((q, qIndex) => {
    const correctIndices = q.options.map((opt, i) => opt.isCorrect ? i : -1).filter(i => i !== -1);
    const userIndices = results.userAnswers[qIndex] || [];
    
    body += `
      <div class="question">
        <h3>${qIndex + 1}. ${escapeHTML(q.questionText)}</h3>
        <div class="options">
          ${q.options.map((opt, oIndex) => {
            const isCorrect = correctIndices.includes(oIndex);
            const isUserChoice = userIndices.includes(oIndex);
            let optionClasses = 'option';
            if (isCorrect) optionClasses += ' correct';
            if (isUserChoice && !isCorrect) optionClasses += ' incorrect';
            if (isUserChoice) optionClasses += ' user-choice';

            return `
              <div class="${optionClasses}" style="cursor: default;">
                <div>
                    <span>${escapeHTML(opt.optionText)}</span>
                    <div class="explanation visible">${escapeHTML(opt.explanation)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
  return body;
};

/**
 * Triggers a file download in the browser.
 */
const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


/**
 * Exports an exam template (interactive) to an HTML file.
 */
export const exportExamTemplateToHTML = (exam: Exam): void => {
  const questionsData = exam.questions.map(q => ({
    questionType: q.questionType,
    options: q.options.map(opt => ({
        isCorrect: opt.isCorrect,
        explanation: opt.explanation,
    })),
  }));
  const questionsDataJSON = JSON.stringify(questionsData);
  const body = createExamTemplateBody(exam);
  const htmlContent = getThemedHTMLWrapper(`${exam.title} - Template`, body, questionsDataJSON);
  const filename = `${exam.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.html`;
  downloadFile(filename, htmlContent, 'text/html');
};

/**
 * Exports exam results to an HTML file.
 */
export const exportExamToHTML = (exam: Exam, results: { userAnswers: UserAnswers; score: number }): void => {
  const body = createExamResultsBody(exam, results);
  const htmlContent = getThemedHTMLWrapper(`${exam.title} - Results`, body);
  const filename = `${exam.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.html`;
  downloadFile(filename, htmlContent, 'text/html');
};
