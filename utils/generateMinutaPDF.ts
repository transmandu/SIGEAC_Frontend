import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateMinutaPDF = async (activity: any, attendeesCount: number) => {
  try {
    const existingPdfBytes = await fetch("/minuta_template.pdf").then(res =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const write = (
      text: string,
      x: number,
      y: number,
      size = 9,
      maxWidth = 350,
      lineHeight = 12
    ) => {
      if (!text) return;

      const words = text.split(" ");
      let line = "";
      let offsetY = 0;

      words.forEach(word => {
        const testLine = line + word + " ";
        const width = font.widthOfTextAtSize(testLine, size);

        if (width > maxWidth) {
          page.drawText(line, { x, y: y - offsetY, size, font, color: rgb(0, 0, 0) });
          line = word + " ";
          offsetY += lineHeight;
        } else {
          line = testLine;
        }
      });

      page.drawText(line, { x, y: y - offsetY, size, font, color: rgb(0, 0, 0) });
    };

    // ================== CABECERA ==================
    write(activity.activity_name || "", 127, 650,11); // ACTIVIDAD
    write(activity.activity_number || "", 476, 650, 11, 120); // NUMERO ACTIVIDAD

    write(activity.title || "", 127, 629,11, 425); // TITULO
    write(
      activity.start_date
        ? new Date(activity.start_date).toLocaleDateString()
        : "",
      127,
      607,
      11
    ); // FECHA

    write(`${activity.start_time || ""} - ${activity.end_time || ""}`, 275, 607,11); // HORA
    write(activity.place || "", 127, 586,11); // LUGAR
    write(String(attendeesCount || 0), 485, 586, 11, 120); // NUMERO ASISTENTES

    // ================== OBJETIVO ==================
    write(activity.objetive || "", 127, 566, 10, 430); // OBJETIVO

    // ================== TEMAS ==================
   const topics = activity.topics?.split(",") || [];

    // 📍 Coordenadas individuales para cada línea de temas
    const topicPositions = [
      { x: 80, y: 518, size: 11 },  // Tema 1
      { x: 80, y: 499, size: 11 },  // Tema 2
      { x: 80, y: 481, size: 11 },  // Tema 3
      { x: 80, y: 463, size: 11 },  // Tema 4
      { x: 80, y: 444, size: 11 },  // Tema 5
      { x: 80, y: 425, size: 11 },  // Tema 6
    ]; 

    topics.forEach((t: string, i: number) => {
      const pos = topicPositions[i];
      if (!pos) return; // Evita escribir fuera del área

      write(`${i + 1}. ${t.trim()}`, pos.x, pos.y, 9, 420); // TEMA INDIVIDUAL
    });

    // ================== OBSERVACIONES ==================
    write(activity.description || "", 60, 388, 11, 490, 19); // OBSERVACIONES

    // ================== RESPONSABLES ==================
    write(
      `${activity.authorized_by?.first_name || ""} ${activity.authorized_by?.last_name || ""}`,
      182,
      257,
      10,
      200
    ); // AUTORIZADO POR

    // CARGO
    write(
      activity.authorized_by?.job_title?.name || "",
      305,
      262,
      8,
      200
    );

    // DEPARTAMENTO
    write(
      activity.authorized_by?.department?.name || "",
      322,
      262,
      8,
      100,
      8
    );

    write(
      `${activity.planned_by?.first_name || ""} ${activity.planned_by?.last_name || ""}`,
      182,
      238,
      10,
      200,
    ); // ELABORADO POR

    // CARGO
    write(
      activity.planned_by?.job_title?.name || "",
      305,
      243,
      8,
      200
    );

    // DEPARTAMENTO
    write(
      activity.planned_by?.department?.name || "",
      337,
      243,
      8,
      100,
      8
    );

    write(activity.executed_by || "", 182, 220, 10, 200); // REALIZADO POR 
    // 💾 Guardar PDF
    const pdfBytes = await pdfDoc.save();

    const uint8Array = new Uint8Array(pdfBytes);
    const blob = new Blob([uint8Array], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);


    // PREVIEW (para ajustar posiciones)
    //window.open(url, "_blank");

    // DESCARGA
    const link = document.createElement("a");
    link.href = url;
    link.download = `Minuta-${activity.activity_number || "actividad"}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("Hubo un problema generando el PDF.");
  }
};