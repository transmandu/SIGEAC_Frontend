import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateConsolidatedReport = async (activities: any[]) => {
  try {
    // 1. Cargar el template una sola vez para eficiencia
    const existingPdfBytes = await fetch("/minuta_template.pdf").then(res =>
      res.arrayBuffer()
    );

    // =========================================================
    // 🚀 ORDENAR POR FECHA (De más vieja a más nueva)
    // =========================================================
    const sortedActivities = [...activities].sort((a, b) => {
      // Manejo de nulos: si no hay fecha, los mandamos al final
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return dateA - dateB; 
    });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Función auxiliar para escribir texto con control de posición
    const writeInPage = (
      page: any,
      text: string,
      x: number,
      y: number,
      size = 9,
      isBold = false
    ) => {
      if (!text) return;
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
    };

    let currentPage = pdfDoc.addPage([612, 792]); // Tamaño Carta (Letter)
    let currentY = 740; // Empezamos cerca del tope

    // 2. Dibujar Encabezado del Reporte (Solo una vez al inicio)
    writeInPage(currentPage, "REPORTE CONSOLIDADO DE ACTIVIDADES SMS", 150, currentY, 14, true);
    currentY -= 40;

    // 3. Iterar sobre las actividades ORDENADAS
    for (const activity of sortedActivities) {
      // Validar si el siguiente bloque cabe en la página (necesitamos aprox 120 unidades)
      if (currentY < 150) {
        currentPage = pdfDoc.addPage([612, 792]);
        currentY = 740;
        writeInPage(currentPage, "CONTINUACIÓN - REPORTE DE ACTIVIDADES", 180, currentY, 10, true);
        currentY -= 30;
      }

      // Dibujar cuadro decorativo/separador
      currentPage.drawRectangle({
        x: 50,
        y: currentY - 100,
        width: 510,
        height: 110,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      // Escribir los datos de la actividad
      writeInPage(currentPage, `ACTIVIDAD N°: ${activity.activity_number || "N/A"}`, 60, currentY, 11, true);
      currentY -= 20;

      writeInPage(currentPage, `TIPO: ${activity.activity_name || ""}`, 60, currentY, 10);
      currentY -= 15;

      writeInPage(currentPage, `TÍTULO: ${activity.title || ""}`, 60, currentY, 10);
      currentY -= 15;

      const fecha = activity.start_date ? new Date(activity.start_date).toLocaleDateString() : "S/F";
      const hora = `${activity.start_time || ""} - ${activity.end_time || ""}`;
      writeInPage(currentPage, `FECHA: ${fecha}   |   HORA: ${hora}`, 60, currentY, 10);
      currentY -= 20;

      // Objetivo
      writeInPage(currentPage, "OBJETIVO:", 60, currentY, 9, true);
      currentY -= 12;
      
      const objetivo = activity.objetive || "Sin objetivo definido";
      // Texto truncado para evitar que se desborde del cuadro
      writeInPage(currentPage, objetivo.length > 150 ? objetivo.substring(0, 150) + "..." : objetivo, 60, currentY, 8);

      // Espacio entre bloques
      currentY -= 50;
    }

    // 4. Generar y descargar
    const pdfBytes = await pdfDoc.save();
    
    // Convertimos explícitamente a Uint8Array para evitar conflictos de tipo en TS
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Actividades_SMS_Consolidado.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al generar reporte:", error);
  }
};