import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image as PDFImage,
} from "@react-pdf/renderer";
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface DispatchReport {
  id: number;
  request_number: string;
  status: string;
  requested_by: string;
  approved_by: string;
  delivered_by: string;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  work_order?: string;
  aircraft?: number;
  articles: {
    id: number;
    part_number: string;
    alternative_part_number?: string[];
    serial?: string;
    description: string;
    quantity: number;
  }[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: "#f7f7f7",
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
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
  headerTable: {
    flexDirection: "row",
    border: "1px solid #000",
    marginBottom: 6,
  },
  headerCell: {
    borderRight: "1px solid #000",
    padding: 4,
    justifyContent: "center",
  },
  headerCellLast: {
    padding: 4,
    justifyContent: "center",
  },
  logo: {
    height: 40,
    objectFit: "contain",
    margin: "auto",
  },
  infoText: {
    fontSize: 12,
    paddingBottom: 2,
    borderBottom: "1px solid #000",
  },

  rightCell: {
    width: "33%",
    display: "flex",
    flexDirection: "column",
  },

  rightCellHalf: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },

  rightCellHalfLast: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  rightText: {
    fontSize: 9,
    textAlign: "left",
  },
  narrowHeaderWrapper: {
    width: "80%", // puedes ajustar a 70% si lo quieres más angosto
    alignSelf: "center",
  },
  tableBlock: {
    marginTop: 16, // <-- Aumenta la separación desde el encabezado
    marginBottom: 4, // Separación hacia los artículos
    borderWidth: 1,
    borderColor: "#444",
  },

  tableRow: {
    flexDirection: "row",
  },

  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#444",
    padding: 4,
    justifyContent: "center",
  },
  tableCell2: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#444",
    padding: 4,
    justifyContent: "center",
  },
  tableCell3: {
    flex: 1,
    borderColor: "#444",
    padding: 4,
    justifyContent: "flex-start",
  },
  tableCellLabel: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  tableCellValue: {
    fontSize: 10,
  },
});

const DispatchReportPdf = ({
  reports,
  aircraftFilter = null,
  startDate,
  endDate,
}: {
  reports: DispatchReport[];
  aircraftFilter?: number | null;
  startDate?: Date;
  endDate?: Date;
}) => {
  const filtered = reports.filter((r) => {
    const submission = parseISO(r.submission_date);

    const matchesAircraft = aircraftFilter
      ? r.aircraft === aircraftFilter
      : true;
    const matchesStart = startDate
      ? isAfter(submission, startDate) || isEqual(submission, startDate)
      : true;
    const matchesEnd = endDate
      ? isBefore(submission, endDate) || isEqual(submission, endDate)
      : true;

    return matchesAircraft && matchesStart && matchesEnd;
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View fixed>
          <View style={styles.narrowHeaderWrapper}>
            <View style={styles.headerTable}>
              {/* Columna 1: Logo */}
              <View
                style={[
                  styles.headerCell,
                  { width: "33%", alignItems: "center" },
                ]}
              >
                <PDFImage src="/tmd_nombre.png" style={styles.logo} />
              </View>

              {/* Columna 2: Título */}
              <View
                style={[
                  styles.headerCell,
                  { width: "34%", alignItems: "center" },
                ]}
              >
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                  Salidas de Almacén
                </Text>
              </View>

              {/* Columna 3: Fecha y Página */}
              <View style={styles.rightCell}>
                <View style={styles.rightCellHalf}>
                  <Text style={styles.rightText}>
                    Fecha: {format(new Date(), "PPP", { locale: es })}
                  </Text>
                </View>
                <View style={styles.rightCellHalfLast}>
                  <Text
                    style={styles.rightText}
                    render={({ pageNumber, totalPages }) =>
                      `Página: ${pageNumber} de ${totalPages}`
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {filtered.length > 0 ? (
          filtered.map((dispatch) => (
            <View key={dispatch.id} wrap={false}>
              <View style={styles.tableBlock}>
                {/* Fila 1 */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 7 }]}>
                    <Text style={styles.tableCellValue}>
                      <Text style={styles.tableCellLabel}>
                        Orden de Salida:{" "}
                      </Text>
                      {dispatch.request_number ?? "N/A"}
                    </Text>
                  </View>
                  <View style={[styles.tableCell2, { flex: 3 }]}>
                    <Text style={styles.tableCellValue}>
                      <Text style={styles.tableCellLabel}>Fecha: </Text>
                      {format(parseISO(dispatch.submission_date), "PPP", {
                        locale: es,
                      })}
                    </Text>
                  </View>
                </View>

                {/* Fila 2 */}
                <View style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Status:</Text>
                    <Text style={styles.tableCellValue}>{dispatch.status}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Destino:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.destination_place}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Orden de Trabajo:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.work_order ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.tableCell2}>
                    <Text style={styles.tableCellLabel}>Aeronave:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.aircraft ?? "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Fila 3 */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <Text style={styles.tableCellLabel}>Solicitado por:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.requested_by}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <Text style={styles.tableCellLabel}>Aprobado por:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.approved_by}
                    </Text>
                  </View>
                  <View style={[styles.tableCell2, { flex: 1 }]}>
                    <Text style={styles.tableCellLabel}>Entregado por:</Text>
                    <Text style={styles.tableCellValue}>
                      {dispatch.delivered_by}
                    </Text>
                  </View>
                </View>
                {/* Fila 4 */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell3, { flex: 1 }]}>
                    <Text style={styles.tableCellValue}>
                      <Text style={styles.tableCellLabel}>Justificación: </Text>
                      {dispatch.justification ?? "N/A"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                {dispatch.articles.length > 0 && (
                  <>
                    <View style={styles.rowHeader}>
                      <Text style={styles.col}>N° Parte</Text>
                      <Text style={styles.col}>Cantidad</Text>
                      <Text style={styles.col}>Serial</Text>
                      <Text style={styles.col}>Alternativos</Text>
                    </View>
                    {dispatch.articles.map((a, idx) => (
                      <View key={idx} style={styles.row}>
                        <Text style={styles.col}>{a.part_number}</Text>
                        <Text style={styles.col}>{a.quantity}</Text>
                        <Text style={styles.col}>{a.serial ?? "N/A"}</Text>
                        <Text style={styles.col}>
                          {Array.isArray(a.alternative_part_number)
                            ? a.alternative_part_number.join(", ")
                            : a.alternative_part_number || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noRecords}>
            No hay salidas registradas para los filtros aplicados.
          </Text>
        )}
      </Page>
    </Document>
  );
};

export default DispatchReportPdf;
