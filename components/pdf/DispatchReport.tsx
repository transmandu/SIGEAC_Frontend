import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface DispatchReport {
  id: number;
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

    const matchesAircraft = aircraftFilter ? r.aircraft === aircraftFilter : true;
    const matchesStart = startDate ? (isAfter(submission, startDate) || isEqual(submission, startDate)) : true;
    const matchesEnd = endDate ? (isBefore(submission, endDate) || isEqual(submission, endDate)) : true;

    return matchesAircraft && matchesStart && matchesEnd;
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Salidas de Almacén</Text>
          <Text style={styles.subtitle}>
            Fecha de generación: {format(new Date(), "PPP", { locale: es })}
          </Text>
          {aircraftFilter && (
            <Text style={styles.subtitle}>Filtrado por Aeronave: {aircraftFilter}</Text>
          )}
          {startDate && (
            <Text style={styles.subtitle}>Desde: {format(startDate, "PPP", { locale: es })}</Text>
          )}
          {endDate && (
            <Text style={styles.subtitle}>Hasta: {format(endDate, "PPP", { locale: es })}</Text>
          )}
        </View>

        {filtered.length > 0 ? (
          filtered.map((dispatch) => (
            <View key={dispatch.id} style={styles.section} wrap={false}>
              <Text style={styles.subTitle}>Salida ID: {dispatch.id}</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldText}>Status: {dispatch.status}</Text>
                <Text style={styles.fieldText}>
                  Fecha: {format(parseISO(dispatch.submission_date), "PPP", { locale: es })}
                </Text>
                <Text style={styles.fieldText}>Justificación: {dispatch.justification}</Text>
                <Text style={styles.fieldText}>Destino: {dispatch.destination_place}</Text>
                <Text style={styles.fieldText}>Orden de Trabajo: {dispatch.work_order ?? "N/A"}</Text>
                <Text style={styles.fieldText}>Aeronave: {dispatch.aircraft ?? "N/A"}</Text>
                <Text style={styles.fieldText}>Solicitado por: {dispatch.requested_by}</Text>
                <Text style={styles.fieldText}>Aprobado por: {dispatch.approved_by}</Text>
                <Text style={styles.fieldText}>Entregado por: {dispatch.delivered_by}</Text>
              </View>

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
                        {a.alternative_part_number?.join(", ") ?? "N/A"}
                      </Text>
                    </View>
                  ))}
                </>
              )}
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
