import { GeneralSalesReport } from "@/types";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Estilos (reutilizados o ajustados)
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sectionHeader: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionInfo: {
    fontSize: 12,
    color: "#555",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  column: {
    width: "20%",
    textAlign: "center",
    padding: 5,
  },
  noRecords: {
    textAlign: "center",
    fontSize: 12,
    marginVertical: 10,
    color: "#f44336",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#777",
  },
});

const GeneralSalesReportPdf = ({ reports }: { reports: GeneralSalesReport }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Ventas</Text>
          <Text style={styles.subtitle}>{format(new Date(), "PPP", { locale: es })}</Text>
        </View>

        {/* Report Content */}
        {reports.length > 0 ? (
          reports.map((report, index) => (
            <View key={index}>
              {/* Requisition Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Requisición: {report.requisition_order.order_number}
                </Text>
                <Text style={styles.sectionInfo}>
                  Creada por: {report.requisition_order.created_by.first_name}
                </Text>
                <Text style={styles.sectionInfo}>
                  Solicitado por: {report.requisition_order.requested_by}
                </Text>
                <Text style={styles.sectionInfo}>
                  Fecha de envío:{" "}
                  {format(new Date(report.requisition_order.submission_date), "PPP", { locale: es })}
                </Text>
                <Text style={styles.sectionInfo}>
                  Justificación: {report.requisition_order.justification}
                </Text>
              </View>

              {/* Purchase Order Section */}
              {report.purchase_order && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Orden de Compra: {report.purchase_order.order_number}
                  </Text>
                  <Text style={styles.sectionInfo}>
                    Proveedor: {report.purchase_order.vendor.name}
                  </Text>
                  <Text style={styles.sectionInfo}>
                    Total: ${report.purchase_order.total}
                  </Text>
                </View>
              )}

              {/* Quotes Section */}
              {report.quote_order && report.quote_order.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cotizaciones</Text>
                  <View style={styles.tableHeader}>
                    <Text style={styles.column}>Nro. Cotización</Text>
                    <Text style={styles.column}>Total</Text>
                    <Text style={styles.column}>Fecha</Text>
                  </View>
                  {report.quote_order?.map((quote, quoteIndex) => (
                    <View key={quoteIndex} style={styles.tableRow}>
                      <Text style={styles.column}>{quote.quote_number}</Text>
                      <Text style={styles.column}>${quote.total}</Text>
                      <Text style={styles.column}>
                        {format(new Date(quote.quote_date), "PPP", { locale: es })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Batches and Articles Table */}
              {report.requisition_order.batch.length > 0 ? (
                report.requisition_order.batch.map((batch, batchIndex) => (
                  <View key={batchIndex} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lote: {batch.name}</Text>
                    <View style={styles.tableHeader}>
                      <Text style={styles.column}>Nro. Parte</Text>
                      <Text style={styles.column}>Cantidad</Text>
                      <Text style={styles.column}>Unidad</Text>
                    </View>
                    {batch.batch_articles.map((article, articleIndex) => (
                      <View key={articleIndex} style={styles.tableRow}>
                        <Text style={styles.column}>{article.article_part_number}</Text>
                        <Text style={styles.column}>{article.quantity}</Text>
                        <Text style={styles.column}>
                          {article.unit ? article.unit.secondary_unit : "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noRecords}>No hay lotes disponibles para esta requisición.</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noRecords}>No hay datos disponibles para este reporte.</Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Este es un documento generado automáticamente. Por favor, consérvelo para sus registros.
        </Text>
      </Page>
    </Document>
  );
};

export default GeneralSalesReportPdf;
