import Handlebars from "handlebars";
import type { ResumeData } from "../types/resume.js";

// Register Handlebars helpers
Handlebars.registerHelper("joinArray", (arr: string[] | undefined) => {
  if (!arr || arr.length === 0) return "";
  return arr.join(", ");
});

Handlebars.registerHelper("ifNotEmpty", function (
  this: unknown,
  arr: unknown[] | undefined,
  options: Handlebars.HelperOptions
) {
  if (arr && arr.length > 0) return options.fn(this);
  return options.inverse(this);
});

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{contact.name}} - Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10pt;
    line-height: 1.45;
    color: #141413;
    background: #FFFFFF;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in 0.6in;
  }

  /* ─── Header ───────────────────────────────── */
  .header {
    text-align: center;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 2px solid #D97757;
  }

  .header h1 {
    font-size: 22pt;
    font-weight: 700;
    color: #141413;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .header .contact-info {
    font-size: 9pt;
    color: #5A5A58;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 16px;
  }

  .header .contact-info a {
    color: #5A5A58;
    text-decoration: none;
  }

  .header .contact-info .sep {
    color: #E8E6DC;
  }

  /* ─── Summary ──────────────────────────────── */
  .summary {
    margin-bottom: 14px;
    font-size: 9.5pt;
    color: #3a3a38;
    line-height: 1.5;
  }

  /* ─── Section ──────────────────────────────── */
  .section {
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: #D97757;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid #E8E6DC;
    padding-bottom: 3px;
    margin-bottom: 8px;
  }

  /* ─── Experience / Education ───────────────── */
  .entry {
    margin-bottom: 10px;
  }

  .entry:last-child {
    margin-bottom: 0;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
  }

  .entry-title {
    font-size: 10.5pt;
    font-weight: 600;
    color: #141413;
  }

  .entry-date {
    font-size: 9pt;
    color: #5A5A58;
    white-space: nowrap;
    font-weight: 500;
  }

  .entry-subtitle {
    font-size: 9.5pt;
    color: #5A5A58;
    margin-bottom: 3px;
  }

  .entry ul {
    margin-left: 16px;
    margin-top: 3px;
  }

  .entry li {
    font-size: 9.5pt;
    margin-bottom: 2px;
    line-height: 1.4;
  }

  /* ─── Skills ───────────────────────────────── */
  .skills-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    font-size: 9.5pt;
  }

  .skill-category {
    font-weight: 600;
    color: #141413;
    white-space: nowrap;
  }

  .skill-items {
    color: #3a3a38;
  }

  /* ─── Projects ─────────────────────────────── */
  .project-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 2px;
  }

  .project-name {
    font-weight: 600;
    font-size: 10.5pt;
    color: #141413;
  }

  .project-tech {
    font-size: 8.5pt;
    color: #5A5A58;
  }

  .project-link {
    font-size: 8.5pt;
    color: #D97757;
    text-decoration: none;
  }

  .project-desc {
    font-size: 9.5pt;
    color: #3a3a38;
    margin-bottom: 2px;
  }

  /* ─── Certifications ───────────────────────── */
  .cert-item {
    font-size: 9.5pt;
    margin-bottom: 2px;
  }

  .cert-name {
    font-weight: 600;
  }

  .cert-issuer {
    color: #5A5A58;
  }

  @media print {
    body {
      padding: 0;
    }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h1>{{contact.name}}</h1>
    <div class="contact-info">
      {{#if contact.email}}<span>{{contact.email}}</span>{{/if}}
      {{#if contact.phone}}<span>{{contact.phone}}</span>{{/if}}
      {{#if contact.location}}<span>{{contact.location}}</span>{{/if}}
      {{#if contact.website}}<span><a href="{{contact.website}}">{{contact.website}}</a></span>{{/if}}
      {{#if contact.github}}<span><a href="https://github.com/{{contact.github}}">github.com/{{contact.github}}</a></span>{{/if}}
      {{#if contact.linkedin}}<span><a href="{{contact.linkedin}}">LinkedIn</a></span>{{/if}}
    </div>
  </div>

  <!-- Summary -->
  {{#if summary}}
  <div class="summary">{{summary}}</div>
  {{/if}}

  <!-- Experience -->
  {{#ifNotEmpty experience}}
  <div class="section">
    <div class="section-title">Experience</div>
    {{#each experience}}
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">{{this.title}}</span>
        <span class="entry-date">{{this.startDate}} – {{#if this.endDate}}{{this.endDate}}{{else}}Present{{/if}}</span>
      </div>
      <div class="entry-subtitle">{{this.company}}{{#if this.location}} · {{this.location}}{{/if}}</div>
      {{#ifNotEmpty this.bullets}}
      <ul>
        {{#each this.bullets}}<li>{{this}}</li>{{/each}}
      </ul>
      {{/ifNotEmpty}}
    </div>
    {{/each}}
  </div>
  {{/ifNotEmpty}}

  <!-- Projects -->
  {{#ifNotEmpty projects}}
  <div class="section">
    <div class="section-title">Projects</div>
    {{#each projects}}
    <div class="entry">
      <div class="project-header">
        <span class="project-name">{{this.name}}</span>
        <span class="project-tech">{{joinArray this.technologies}}</span>
        {{#if this.url}}<a class="project-link" href="{{this.url}}">↗</a>{{/if}}
      </div>
      <div class="project-desc">{{this.description}}</div>
      {{#ifNotEmpty this.bullets}}
      <ul>
        {{#each this.bullets}}<li>{{this}}</li>{{/each}}
      </ul>
      {{/ifNotEmpty}}
    </div>
    {{/each}}
  </div>
  {{/ifNotEmpty}}

  <!-- Skills -->
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      {{#ifNotEmpty skills.languages}}
      <span class="skill-category">Languages:</span>
      <span class="skill-items">{{joinArray skills.languages}}</span>
      {{/ifNotEmpty}}
      {{#ifNotEmpty skills.frameworks}}
      <span class="skill-category">Frameworks:</span>
      <span class="skill-items">{{joinArray skills.frameworks}}</span>
      {{/ifNotEmpty}}
      {{#ifNotEmpty skills.tools}}
      <span class="skill-category">Tools:</span>
      <span class="skill-items">{{joinArray skills.tools}}</span>
      {{/ifNotEmpty}}
      {{#ifNotEmpty skills.other}}
      <span class="skill-category">Other:</span>
      <span class="skill-items">{{joinArray skills.other}}</span>
      {{/ifNotEmpty}}
    </div>
  </div>

  <!-- Education -->
  {{#ifNotEmpty education}}
  <div class="section">
    <div class="section-title">Education</div>
    {{#each education}}
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">{{this.degree}}{{#if this.field}} in {{this.field}}{{/if}}</span>
        {{#if this.endDate}}<span class="entry-date">{{#if this.startDate}}{{this.startDate}} – {{/if}}{{this.endDate}}</span>{{/if}}
      </div>
      <div class="entry-subtitle">{{this.school}}{{#if this.gpa}} · GPA: {{this.gpa}}{{/if}}</div>
      {{#ifNotEmpty this.highlights}}
      <ul>
        {{#each this.highlights}}<li>{{this}}</li>{{/each}}
      </ul>
      {{/ifNotEmpty}}
    </div>
    {{/each}}
  </div>
  {{/ifNotEmpty}}

  <!-- Certifications -->
  {{#ifNotEmpty certifications}}
  <div class="section">
    <div class="section-title">Certifications</div>
    {{#each certifications}}
    <div class="cert-item">
      <span class="cert-name">{{this.name}}</span> – <span class="cert-issuer">{{this.issuer}}{{#if this.date}}, {{this.date}}{{/if}}</span>
    </div>
    {{/each}}
  </div>
  {{/ifNotEmpty}}

</body>
</html>`;

export function renderHtml(data: ResumeData): string {
  const template = Handlebars.compile(HTML_TEMPLATE);
  return template(data);
}
