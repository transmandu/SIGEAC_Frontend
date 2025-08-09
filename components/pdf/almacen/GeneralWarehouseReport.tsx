import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface WarehouseReport {
  name: string;
  ata_code: string;
  articles_quantity: number;
  location: string;
  warehouse: string;
  description: string;
  articles: {
    part_number: string;
    part_number_quantity: number;
    aircraft: number;
    stored: number;
    dispatch: {
      quantity: number;
      location: string;
    }[];
  }[];
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
  tableRowDispatch: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#f9f9f9",
  },
  column: {
    width: "25%",
    textAlign: "center",
    padding: 5,
  },
  dispatchColumn: {
    width: "50%",
    textAlign: "center",
    padding: 5,
    fontSize: 10,
    fontStyle: "italic",
    color: "#3D0000",
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
  dispatch_text: {
    fontStyle: "italic",
    fontSize: 12,
    color: "#3D0000",
  }
});

const WarehouseReportPdf = ({ reports }: { reports: WarehouseReport[] }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Inventario</Text>
          <Text style={styles.subtitle}>{format(new Date(), "PPP", { locale: es })}</Text>
        </View>

        {/* Report Content */}
        {reports.length > 0 ? (
          reports.map((batch, index) => (
            <View key={index}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{batch.name}</Text>
                <Text style={styles.sectionInfo}>ATA Code: {batch.ata_code}</Text>
                <Text style={styles.sectionInfo}>Almacén: {batch.warehouse}</Text>
                <Text style={styles.sectionInfo}>Ubicación: {batch.location}</Text>
                <Text style={styles.sectionInfo}>
                  Cantidad de Artículos: {batch.articles_quantity}
                </Text>
                <Text style={styles.sectionInfo}>{batch.description}</Text>
              </View>

              {/* Articles Table */}
              {batch.articles.length > 0 ? (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.column}>Nro. Parte</Text>
                    <Text style={styles.column}>Cantidad</Text>
                    <Text style={styles.column}>Avión</Text>
                    <Text style={styles.column}>Almacenados</Text>
                  </View>
                  {batch.articles.map((article, articleIndex) => (
                    <View key={articleIndex}>
                      {/* Article Row */}
                      <View style={styles.tableRow}>
                        <Text style={styles.column}>{article.part_number}</Text>
                        <Text style={styles.column}>{article.part_number_quantity}</Text>
                        <Text style={styles.column}>{article.aircraft}</Text>
                        <Text style={styles.column}>{article.stored}</Text>
                      </View>
                      {/* Dispatch Rows */}
                      {article.dispatch.length > 0 && (
                        article.dispatch.map((dispatch, dispatchIndex) => (
                          <View
                            key={dispatchIndex}
                            style={styles.tableRowDispatch}
                          >
                            <Text style={styles.dispatchColumn}>
                              {dispatch.quantity} enviado(s) a {dispatch.location}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles.noRecords}>
                  No hay artículos actualmente en este renglón.
                </Text>
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

export default WarehouseReportPdf;
