import React from "react";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

interface Requisition {
  order_number: string;
  // otros campos si los tienes
}

interface RequisitionReportPdfProps {
  requisition: Requisition;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: "#f7f7f7",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3f51b5",
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4,
    color: "#666",
  },
  section: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  fieldGroup: {
    marginBottom: 6,
  },
  fieldText: {
    fontSize: 10,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    fontWeight: "bold",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 3,
  },
  col: {
    width: "25%",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  noRecords: {
    fontSize: 12,
    color: "#f44336",
    textAlign: "center",
    marginVertical: 20,
  },
});

const RequisitionReportPdf: React.FC<RequisitionReportPdfProps> = ({ requisition }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Salidas de Almacén</Text>
          <Text style={styles.subtitle}>
            Fecha de generación: 
          </Text>
          
            <Text style={styles.subtitle}>Filtrado por Aeronave: </Text>
            <Text style={styles.subtitle}>Desde: </Text>
            <Text style={styles.subtitle}>Hasta: </Text>
        </View>
        {/* Aquí podrías usar requisition para mostrar datos */}
      </Page>
    </Document>
  );
};

export default RequisitionReportPdf;
