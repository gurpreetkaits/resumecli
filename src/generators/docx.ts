import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
  ExternalHyperlink,
  TabStopType,
  TabStopPosition,
} from "docx";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ResumeData } from "../types/resume.js";

// Colors
const CORAL = "D97757";
const TEXT = "141413";
const SECONDARY = "5A5A58";
const BORDER = "E8E6DC";

function contactLine(data: ResumeData): Paragraph {
  const parts: TextRun[] = [];
  const items: string[] = [];
  if (data.contact.email) items.push(data.contact.email);
  if (data.contact.phone) items.push(data.contact.phone);
  if (data.contact.location) items.push(data.contact.location);
  if (data.contact.website) items.push(data.contact.website);
  if (data.contact.github) items.push(`github.com/${data.contact.github}`);

  parts.push(
    new TextRun({
      text: items.join("  |  "),
      size: 18,
      color: SECONDARY,
      font: "Inter",
    })
  );

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 3, color: CORAL },
    },
    children: parts,
  });
}

function sectionTitle(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: CORAL,
        font: "Inter",
        characterSpacing: 60,
      }),
    ],
  });
}

function entryHeader(title: string, date: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 80, after: 20 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 21,
        color: TEXT,
        font: "Inter",
      }),
      new TextRun({
        text: "\t",
      }),
      new TextRun({
        text: date,
        size: 18,
        color: SECONDARY,
        font: "Inter",
      }),
    ],
  });
}

function entrySubtitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text,
        size: 19,
        color: SECONDARY,
        font: "Inter",
      }),
    ],
  });
}

function bulletPoint(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 30 },
    children: [
      new TextRun({
        text,
        size: 19,
        color: TEXT,
        font: "Inter",
      }),
    ],
  });
}

export async function generateDocx(
  data: ResumeData,
  outputDir: string,
  fileName: string
): Promise<string> {
  const outputPath = resolve(outputDir, `${fileName}.docx`);

  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: data.contact.name,
          bold: true,
          size: 40,
          color: TEXT,
          font: "Inter",
        }),
      ],
    })
  );

  // Contact
  children.push(contactLine(data));

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [
          new TextRun({
            text: data.summary,
            size: 19,
            color: "3a3a38",
            font: "Inter",
          }),
        ],
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(sectionTitle("Experience"));
    for (const exp of data.experience) {
      const dateStr = `${exp.startDate} – ${exp.endDate || "Present"}`;
      children.push(entryHeader(exp.title, dateStr));
      const subtitle = exp.location
        ? `${exp.company} · ${exp.location}`
        : exp.company;
      children.push(entrySubtitle(subtitle));
      for (const bullet of exp.bullets) {
        children.push(bulletPoint(bullet));
      }
    }
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    children.push(sectionTitle("Projects"));
    for (const proj of data.projects) {
      const techStr = proj.technologies.join(", ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 21,
              color: TEXT,
              font: "Inter",
            }),
            new TextRun({
              text: `  ${techStr}`,
              size: 17,
              color: SECONDARY,
              font: "Inter",
            }),
            ...(proj.url
              ? [
                  new TextRun({ text: "  " }),
                  new ExternalHyperlink({
                    link: proj.url,
                    children: [
                      new TextRun({
                        text: "↗",
                        size: 17,
                        color: CORAL,
                        font: "Inter",
                        style: "Hyperlink",
                      }),
                    ],
                  }),
                ]
              : []),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: proj.description,
              size: 19,
              color: "3a3a38",
              font: "Inter",
            }),
          ],
        })
      );
      if (proj.bullets) {
        for (const b of proj.bullets) {
          children.push(bulletPoint(b));
        }
      }
    }
  }

  // Skills
  const skillCategories = [
    { label: "Languages", items: data.skills.languages },
    { label: "Frameworks", items: data.skills.frameworks },
    { label: "Tools", items: data.skills.tools },
    { label: "Other", items: data.skills.other },
  ].filter((c) => c.items && c.items.length > 0);

  if (skillCategories.length > 0) {
    children.push(sectionTitle("Skills"));
    for (const cat of skillCategories) {
      children.push(
        new Paragraph({
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: `${cat.label}: `,
              bold: true,
              size: 19,
              color: TEXT,
              font: "Inter",
            }),
            new TextRun({
              text: cat.items!.join(", "),
              size: 19,
              color: "3a3a38",
              font: "Inter",
            }),
          ],
        })
      );
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(sectionTitle("Education"));
    for (const edu of data.education) {
      const degreeStr = edu.field
        ? `${edu.degree} in ${edu.field}`
        : edu.degree;
      const dateStr = edu.endDate
        ? `${edu.startDate ? `${edu.startDate} – ` : ""}${edu.endDate}`
        : "";
      children.push(entryHeader(degreeStr, dateStr));
      const sub = edu.gpa
        ? `${edu.school} · GPA: ${edu.gpa}`
        : edu.school;
      children.push(entrySubtitle(sub));
      if (edu.highlights) {
        for (const h of edu.highlights) {
          children.push(bulletPoint(h));
        }
      }
    }
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    children.push(sectionTitle("Certifications"));
    for (const cert of data.certifications) {
      children.push(
        new Paragraph({
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 19,
              color: TEXT,
              font: "Inter",
            }),
            new TextRun({
              text: ` – ${cert.issuer}${cert.date ? `, ${cert.date}` : ""}`,
              size: 19,
              color: SECONDARY,
              font: "Inter",
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Inter",
            size: 19,
            color: TEXT,
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-bullet",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 360, hanging: 180 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 864,
              right: 864,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
  return outputPath;
}
