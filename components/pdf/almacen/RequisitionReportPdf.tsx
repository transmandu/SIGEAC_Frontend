import React from "react";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Requisition as RequisitionType } from "@/types";
import { registerPdfFonts } from "@/lib/fontmanager";

registerPdfFonts();

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Calibri", backgroundColor: "#ffffff" },

  /** HEADER **/
  headerWrapper: { marginBottom: 10 },
  headerTable: { flexDirection: "row", width: "100%", borderWidth: 1, borderColor: "#000" },
  headerCell: { padding: 4, borderRightWidth: 1, borderColor: "#000", justifyContent: "center" },
  headerCellNoRight: { padding: 4, justifyContent: "center" },
  titleText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  rightText: { fontSize: 11, textAlign: "right" },

  /** INFORMACIÓN GENERAL **/
  infoTable: { width: "100%", borderWidth: 1, borderColor: "#000", marginBottom: 10 },
  infoRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#000", minHeight: 20, alignItems: "center" },
  infoCell: { padding: 4, borderRightWidth: 1, borderColor: "#000", fontSize: 11 },
  infoCellNoRight: { padding: 4, fontSize: 11 },

  /** ARTÍCULOS **/
  section: { marginBottom: 13 },
  subTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 6 },
  tableWrapper: { width: "100%", borderWidth: 1, borderColor: "#000", marginBottom: 10 },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#000", alignItems: "center" },
  tableCell: { padding: 4, borderRightWidth: 1, borderColor: "#000", fontSize: 11, justifyContent: "center" },
  tableCellNoRight: { padding: 4, fontSize: 11, justifyContent: "center" },
  headerCellGray: { backgroundColor: "#d9d9d9", fontWeight: "bold" },
  dataCellGray: { backgroundColor: "#f2f2f2" },
  noRecords: { fontSize: 13, color: "#f44336", textAlign: "center", marginVertical: 20 },
});

const RequisitionReportPdf = ({ requisition }: { requisition: RequisitionType }) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* HEADER - se repite en cada página */}
        <View style={styles.headerWrapper} fixed>
          <View style={styles.headerTable}>
            <View style={[styles.headerCell, { width: "33%" }]}>
              <Text>TMD LOGO</Text>
            </View>
            <View style={[styles.headerCell, { width: "34%" }]}>
              <Text style={styles.titleText}>SOLICITUD</Text>
              <Text style={styles.titleText}>DE COMPRA</Text>
            </View>
            <View style={[styles.headerCellNoRight, { width: "33%" }]}>
              <Text style={styles.rightText}>{requisition.order_number}</Text>
              <Text style={styles.rightText}>
                FECHA: {requisition.submission_date ? format(new Date(requisition.submission_date), "PPP", { locale: es }) : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* INFORMACIÓN GENERAL - tipo tabla */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoCell, styles.headerCellGray, { width: "25%" }]}>Solicitado por</Text>
            <Text style={[styles.infoCellNoRight, { width: "25%" }]}>{requisition.requested_by ?? "N/A"}</Text>
            <Text style={[styles.infoCell, styles.headerCellGray, { width: "25%" }]}>Creado por</Text>
            <Text style={[styles.infoCellNoRight, { width: "25%" }]}>{requisition.created_by.first_name} {requisition.created_by.last_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoCell, styles.headerCellGray, { width: "25%" }]}>Estado</Text>
            <Text style={[styles.infoCellNoRight, { width: "25%" }]}>{requisition.status ?? "-"}</Text>
            <Text style={[styles.infoCell, styles.headerCellGray, { width: "25%" }]}>Aeronave</Text>
            <Text style={[styles.infoCellNoRight, { width: "25%" }]}>{requisition.aircraft?.acronym ?? "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoCell, styles.headerCellGray, { width: "25%" }]}>Justificación</Text>
            <Text style={[styles.infoCellNoRight, { width: "75%" }]}>{requisition.justification ?? "N/A"}</Text>
          </View>
        </View>

        {/* ARTÍCULOS POR BATCH */}
{requisition.batch && requisition.batch.length > 0 ? (
  requisition.batch.map((batch, batchIndex) => (
    <View key={batch.name + batchIndex} style={styles.section} wrap={false}>
      <Text style={styles.subTitle}>Batch: {batch.name || "-"}</Text>
      <View style={styles.tableWrapper}>
        {/* Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.headerCellGray, { width: "35%" }]}>Part Number</Text>
          <Text style={[styles.tableCellNoRight, styles.headerCellGray, { width: "20%" }]}>Cantidad</Text>
          <Text style={[styles.tableCell, styles.headerCellGray, { width: "20%" }]}>Unidad</Text>
          <Text style={[styles.tableCellNoRight, styles.headerCellGray, { width: "25%" }]}>Observaciones</Text>
        </View>

        {/* Datos de artículos */}
          {batch.batch_articles && batch.batch_articles.length > 0 ? (
            batch.batch_articles.map((article, index) => {
              const partNumber = article.article_part_number || "-";
              const quantity = !isNaN(Number(article.quantity)) ? String(article.quantity) : "-";

              // Helper seguro para unit.label
              const unitLabel = (article.unit as unknown as { label?: string })?.label ?? "-";

              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, styles.dataCellGray, { width: "35%" }]}>{partNumber}</Text>
                  <Text style={[styles.tableCellNoRight, styles.dataCellGray, { width: "20%" }]}>{quantity}</Text>
                  <Text style={[styles.tableCell, styles.dataCellGray, { width: "20%" }]}>{unitLabel}</Text>                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellNoRight, styles.dataCellGray, { width: "100%", textAlign: "center" }]}>
                No hay artículos en este batch
              </Text>
            </View>
          )}
        </View>
      </View>
    ))
  ) : (
    <Text style={styles.noRecords}>No hay artículos para esta requisición.</Text>
  )}
      </Page>
    </Document>
  );
};

export default RequisitionReportPdf;