import React from "react";
import { Document, Page, Text, StyleSheet, View, Image as PDFImage } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Requisition as RequisitionType } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: "#ffffffff",
  },

  /** HEADER **/
  headerWrapper: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 20,
  },
  headerTable: {
    flexDirection: "row",
    width: "100%",
  },
  headerCell: {
    justifyContent: "center",
    padding: 4,
  },
  logoCell: {
    width: "33%",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 40,
    objectFit: "contain",
  },
  titleCell: {
    width: "34%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "extrabold",
  },
  rightCell: {
    width: "33%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 4,
  },
  rightText: {
    fontSize: 9,
    textAlign: "right",
    marginBottom: 2,
  },

  /** BODY **/
  section: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#dfdadaff",
    borderRadius: 6,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  fieldText: {
    fontSize: 10,
    marginBottom: 2,
  },
  noRecords: {
    fontSize: 12,
    color: "#f44336",
    textAlign: "center",
    marginVertical: 20,
  },
});

/** estilos de la tabla (reemplaza tableStyles actual) **/
const tableStyles = StyleSheet.create({
  // wrapper: bordes L/R/B (no top) — de este modo el "marco" comienza en la segunda fila
  tableWrapper: {
    width: "100%",
    marginBottom: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  // Primera fila (sin bordes)
  rowFirst: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  titleRowText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    // centra el título; si prefieres left, cambia textAlign
    textAlign: "center",
  },
  // Filas a partir de la segunda: cada fila tiene borderTop (línea horizontal de separación)
  rowWithBorders: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#000",
  },
  // celdas base (con borde derecho para separar verticalmente)
  cellBase: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  // celdas que no deberían mostrar la línea derecha (última celda de fila)
  cellNoRight: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 9,
    justifyContent: "center",
  },
  // estilos para las celdas 'titulo' (labels)
  headerCell: {
    backgroundColor: "#d9d9d9",
    fontWeight: "bold",
  },
  // estilos para las celdas 'datos'
  dataCell: {
    backgroundColor: "#f2f2f2",
  },
});

const RequisitionReportPdf = ({ 
  requisition,
  aircraftFilter = null,
  startDate,
  endDate,
}: {
  requisition: RequisitionType;
  aircraftFilter?: string | null;
  startDate?: Date;
  endDate?: Date;
}) => {
  // En caso de que quieras filtrar por aeronave o fechas en el futuro
  const matchesAircraft = aircraftFilter ? (requisition.aircraft?.acronym === aircraftFilter) : true;
  const matchesStart = startDate ? new Date(requisition.submission_date) >= startDate : true;
  const matchesEnd = endDate ? new Date(requisition.submission_date) <= endDate : true;

  const shouldDisplay = matchesAircraft && matchesStart && matchesEnd;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View fixed>
          <View style={styles.headerWrapper}>
            <View style={styles.headerTable}>
              {/* Columna Izquierda: Logo */}
              <View style={[styles.headerCell, styles.logoCell]}>
                <PDFImage src="/tmd_nombre.png" style={styles.logo} />
              </View>

              {/* Columna Centro: Título */}
              <View style={[styles.headerCell, styles.titleCell]}>
                <Text style={styles.titleText}>REQUISICIÓN</Text>
              </View>

              {/* Columna Derecha: Número y Fecha */}
              <View style={styles.rightCell}>
                <Text style={styles.rightText}>{requisition.order_number}</Text>
                <Text style={styles.rightText}>
                  FECHA: {requisition.submission_date
                    ? format(new Date(requisition.submission_date), "PPP", { locale: es })
                    : "Fecha no disponible"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={tableStyles.tableWrapper}>
          {/* Fila 1: título sin bordes internos ni superior */}
          <View style={tableStyles.rowFirst}>
            <Text style={tableStyles.titleRowText}>DEPARTAMENTO EMISOR</Text>
          </View>

          {/* Fila 2: Departamento (label / dato) */}
          <View style={tableStyles.rowWithBorders}>
            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "25%" }]}>
              <Text>DEPARTAMENTO:</Text>
            </View>

            <View style={[tableStyles.cellNoRight, tableStyles.dataCell, { width: "75%" }]}>
            </View>
          </View>

          {/* Fila 3: Responsable y N° ficha / C.I. (4 celdas) */}
          <View style={tableStyles.rowWithBorders}>
            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "20%" }]}>
              <Text>RESPONSABLE:</Text>
            </View>

            <View style={[tableStyles.cellBase, tableStyles.dataCell, { width: "40%" }]}>
            </View>

            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "20%" }]}>
              <Text>N° FICHA / C.I.:</Text>
            </View>

            <View style={[tableStyles.cellNoRight, tableStyles.dataCell, { width: "20%" }]}>
            </View>
          </View>

          {/* Fila 4: Cargo (label / dato) */}
          <View style={tableStyles.rowWithBorders}>
            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "25%" }]}>
              <Text>CARGO:</Text>
            </View>

            <View style={[tableStyles.cellNoRight, tableStyles.dataCell, { width: "75%" }]}>
            </View>
          </View>
        </View>

        {shouldDisplay ? (
          <View style={styles.section}>
            {/* Aquí puedes mapear requisition.batch y requisition.batch_articles */}
            <Text style={styles.subTitle}>Número de Orden: {requisition.order_number}</Text>
            <Text style={styles.fieldText}>Estado: {requisition.status}</Text>
            <Text style={styles.fieldText}>Aeronave: {requisition.aircraft?.acronym ?? "N/A"}</Text>
            <Text style={styles.fieldText}>Justificación: {requisition.justification}</Text>
          </View>
        ) : (
          <Text style={styles.noRecords}>No hay registros para los filtros aplicados.</Text>
        )}
      </Page>
    </Document>
  );
};

export default RequisitionReportPdf;
