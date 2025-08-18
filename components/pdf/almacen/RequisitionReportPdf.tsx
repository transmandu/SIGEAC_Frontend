import React from "react";
import { Document, Page, Text, StyleSheet, View, Image as PDFImage } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Requisition as RequisitionType } from "@/types";
import { registerPdfFonts, pdfFontStyles } from "@/lib/fontmanager"

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: "#ffffffff",
    fontFamily: "Calibri",
    fontWeight: "normal",
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
    fontSize: 21,
    fontWeight: "bold",
  },
  rightCell: {
    width: "33%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 4,
  },
  rightText: {
    fontSize: 11,
    textAlign: "right",
    marginBottom: 2,
  },

  /** BODY **/
  section: {
    marginBottom: 13,
    padding: 10,
    backgroundColor: "#dfdadaff",
    borderRadius: 6,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  fieldText: {
    fontSize: 13,
    marginBottom: 2,
  },
  noRecords: {
    fontSize: 13,
    color: "#f44336",
    textAlign: "center",
    marginVertical: 20,
  },
});

/** estilos de la tabla **/
const tableStyles = StyleSheet.create({

  tableWrapper: {
    width: "100%",
    marginBottom: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  rowFirst: {
    flexDirection: "row",
    height: 15,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  titleRowText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  rowWithBorders: {
    flexDirection: "row",
    height: 15,
    borderTopWidth: 1,
    borderColor: "#000",
    alignItems: "center",
  },
  cellBase: {
    height: "100%",
    paddingHorizontal: 6,
    fontSize: 11,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  cellNoRight: {
    height: "100%",
    paddingHorizontal: 6,
    fontSize: 11,
    justifyContent: "center",
  },
  headerCell: {
    backgroundColor: "#d9d9d9",
    fontWeight: "bold",
  },
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

        <View style={tableStyles.rowFirst}>
          <Text style={tableStyles.titleRowText}>DEPARTAMENTO EMISOR</Text>
        </View>

        <View style={tableStyles.tableWrapper}>
          {/* Fila 1: título sin bordes internos ni superior */}

          {/* Fila 2: Departamento (label / dato) */}
          <View style={tableStyles.rowWithBorders}>
            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "20%" }]}>
              <Text>DEPARTAMENTO:</Text>
            </View>
            <View style={[tableStyles.cellNoRight, tableStyles.dataCell, { width: "80%" }]}>
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
            <View style={[tableStyles.cellBase, tableStyles.headerCell, { width: "20%" }]}>
              <Text>CARGO:</Text>
            </View>
            <View style={[tableStyles.cellNoRight, tableStyles.dataCell, { width: "80%" }]}>
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
