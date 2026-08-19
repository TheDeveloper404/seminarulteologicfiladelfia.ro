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

export async function generateGraduationPdf(params: {
  student: Student;
  type: GraduationDocumentType;
  issueNumber: string;
  issueDate: Date;
}): Promise<Uint8Array> {
  const { student, type, issueNumber, issueDate } = params;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [regularFontBytes, boldFontBytes, backgroundBytes] = await Promise.all([
    readFile(path.join(ASSETS_DIR, "Lora-Regular.ttf")),
    readFile(path.join(ASSETS_DIR, "Lora-Bold.ttf")),
    readFile(path.join(ASSETS_DIR, type === "diploma" ? "diploma_bg.jpg" : "certificat_bg.jpg")),
  ]);

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);
  const backgroundImage = await pdfDoc.embedJpg(backgroundBytes);

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawImage(backgroundImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  // Fundalul Diplomei are titlul copt în imagine (din .doc-ul original al clientului). Fundalul
  // Certificatului a avut titlul greșit ("Diplomă de absolvire") șters din imagine — titlul lui
  // corect se desenează aici ca text, în același spațiu rămas liber.
  if (type === "certificat") {
    drawCenteredLine(page, "Certificat de absolvire", 390, boldFont, 30);
  }

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
