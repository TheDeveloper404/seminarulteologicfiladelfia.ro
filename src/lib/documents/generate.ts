import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { students } from "@/db/schema";

type Student = typeof students.$inferSelect;
export type GraduationDocumentType = "diploma" | "certificat";

const ASSETS_DIR = path.join(process.cwd(), "src", "lib", "documents", "assets");

// Dimensiuni A4 landscape (puncte PDF), aliniat cu proporția imaginilor de fundal extrase din
// șabloanele .doc originale (1683x1193px ≈ 1.411, foarte aproape de raportul A4 landscape).
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;

const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function formatDateRo(date: Date): string {
  return `${date.getDate()} ${MONTHS_RO[date.getMonth()]} ${date.getFullYear()}`;
}

function drawCenteredLine(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y,
    size,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
}

// UnifrakturMaguntia (fontul blackletter ales pentru titlu) nu are glifele ă/ș/ț — vezi comentariul
// de mai jos din generateGraduationPdf. Pentru "Diplomă" desenăm litera ca "a" (glifă existentă) și
// adăugăm manual accentul breve deasupra ei, ca vector, ca să păstrăm fontul cerut fără să pierdem
// diacriticul din text.
function drawBreve(page: PDFPage, centerX: number, baseY: number, glyphWidth: number) {
  const halfWidth = glyphWidth * 0.32;
  const depth = glyphWidth * 0.22;
  // drawSvgPath translate(x,y) apoi scale(1,-1) — un punct local (px,py) ajunge la
  // (x+px, y-py) pe pagină. Ca mijlocul curbei să fie SUB capete (formă de cupă ⌣, corectă
  // pentru breve), punctul de control trebuie să aibă y local POZITIV (verificat direct în
  // node_modules/pdf-lib/cjs/api/operations.js — comentariul de-acolo: "SVG path Y axis is
  // opposite pdf-lib's").
  page.drawSvgPath(`M ${-halfWidth} 0 Q 0 ${depth} ${halfWidth} 0`, {
    x: centerX,
    y: baseY,
    borderColor: rgb(0.1, 0.1, 0.1),
    borderWidth: Math.max(1, glyphWidth * 0.09),
  });
}

function drawTitleWithBreveFallback(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number
) {
  // Substituie DOAR "ă" (singurul diacritic din titlurile curente: "Diplomă"/"Certificat" nu au
  // ș/ț) cu litera de bază, doar pentru randare — restul logicii (poziționare, breve) lucrează pe
  // textul original ca să știe unde era diacriticul. Dacă un titlu viitor ar avea ș/ț, tratarea
  // NU poate fi identică — acelea iau virgulă dedesubt, nu breve deasupra — ar trebui o funcție
  // separată, nu doar extinderea regexului de-aici.
  const renderText = text.replace(/ă/g, "a");
  const width = font.widthOfTextAtSize(renderText, size);
  const startX = (PAGE_WIDTH - width) / 2;

  page.drawText(renderText, {
    x: startX,
    y,
    size,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "ă") continue;
    const prefixWidth = font.widthOfTextAtSize(renderText.slice(0, i), size);
    const glyphWidth = font.widthOfTextAtSize("a", size);
    const ascent = font.heightAtSize(size, { descender: false });
    drawBreve(page, startX + prefixWidth + glyphWidth / 2, y + ascent * 1.08, glyphWidth);
  }
}

export async function generateGraduationPdf(params: {
  student: Student;
  type: GraduationDocumentType;
  issueNumber: string;
  issueDate: Date;
}): Promise<Uint8Array> {
  const { student, type, issueNumber, issueDate } = params;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [regularFontBytes, boldFontBytes, titleFontBytes, backgroundBytes] = await Promise.all([
    readFile(path.join(ASSETS_DIR, "Lora-Regular.ttf")),
    readFile(path.join(ASSETS_DIR, "Lora-Bold.ttf")),
    readFile(path.join(ASSETS_DIR, "UnifrakturMaguntia-Regular.ttf")),
    readFile(path.join(ASSETS_DIR, type === "diploma" ? "diploma_bg.jpg" : "certificat_bg.jpg")),
  ]);

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);
  const titleFont = await pdfDoc.embedFont(titleFontBytes);
  const backgroundImage = await pdfDoc.embedJpg(backgroundBytes);

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawImage(backgroundImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  // Ambele fundaluri au titlul șters din imagine (era copt cu font diferit per document, din
  // .doc-urile originale ale clientului, stil "Old English"). Titlul se desenează aici ca text, cu
  // UnifrakturMaguntia (blackletter open-source, licență OFL — "Old English Text MT" e un font
  // proprietar Monotype care nu poate fi îmbarcat în repo). Fontul nu are glifa "ă" — vezi
  // drawTitleWithBreveFallback mai sus. Identic ca font și poziție pentru Diplomă și Certificat.
  const title = type === "diploma" ? "Diplomă de absolvire" : "Certificat de absolvire";
  drawTitleWithBreveFallback(page, title, 375, titleFont, 44);

  const birthDate = student.birthDate ? new Date(student.birthDate) : null;
  const birthYear = birthDate ? String(birthDate.getFullYear()) : "____";
  const birthMonth = birthDate ? MONTHS_RO[birthDate.getMonth()] : "________";
  const birthDay = birthDate ? String(birthDate.getDate()) : "__";
  const birthLocality = student.birthLocality || "____________";
  const birthCounty = student.birthCounty || "________________";

  const verb = type === "diploma" ? "a absolvit cursurile" : "a urmat cursurile";
  const purposeLines =
    type === "diploma"
      ? [
          "i se eliberează prezenta diplomă care certifică echiparea spirituală",
          "în vederea implicării în lucrarea lui Dumnezeu, conform chemării personale.",
        ]
      : [
          "i se eliberează prezentul Certificat care atestă participarea sa la cursuri",
          "și dobândirea cunoștințelor teologice fundamentale.",
        ];

  const bodyLines = [
    `${student.fullName}, născut în anul ${birthYear}, luna ${birthMonth}, ziua ${birthDay},`,
    `în localitatea ${birthLocality}, județul ${birthCounty}, ${verb}`,
    "Seminarului Teologic Penticostal FILADELFIA, cu durata de 2 ani, în",
    "localitatea Petroșani, județul Hunedoara.",
    "",
    "Având îndeplinite condițiile prevăzute de conducerea Seminarului Teologic",
    "și a Comunității Regionale Arad,",
    ...purposeLines,
  ];

  let y = 330;
  const bodySize = 14;
  const lineHeight = 22;
  for (const line of bodyLines) {
    if (line) drawCenteredLine(page, line, y, regularFont, bodySize);
    y -= lineHeight;
  }

  // Bloc instituție + semnături
  drawCenteredLine(page, "COMUNITATEA REGIONALĂ ARAD", 128, boldFont, 13);
  drawCenteredLine(page, "SEMINARUL TEOLOGIC PENTICOSTAL FILADELFIA", 112, boldFont, 13);

  const leftX = 180;
  const rightX = PAGE_WIDTH - 180;
  page.drawText("DIRECTOR", { x: leftX - 35, y: 80, size: 12, font: boldFont });
  page.drawText("pastor NEMEȘ DANIEL", { x: leftX - 65, y: 62, size: 12, font: regularFont });
  page.drawText("PREȘEDINTE", { x: rightX - 45, y: 80, size: 12, font: boldFont });
  page.drawText("pastor TOMUȚA SIMION", { x: rightX - 75, y: 62, size: 12, font: regularFont });

  drawCenteredLine(
    page,
    `Nr. ${issueNumber} / ${formatDateRo(issueDate)}`,
    48,
    regularFont,
    12
  );

  return pdfDoc.save();
}
