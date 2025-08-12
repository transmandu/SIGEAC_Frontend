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
    backgroundColor: "#fff",
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

        {shouldDisplay ? (
          <View style={styles.section}>
            {/* Aquí puedes mapear requisition.batch y requisition.batch_articles */}
            <Text style={styles.subTitle}>Número de Orden: {requisition.order_number}</Text>
            <Text style={styles.fieldText}>Estado: {requisition.status}</Text>
            <Text style={styles.fieldText}>Solicitado por: {requisition.requested_by}</Text>
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
