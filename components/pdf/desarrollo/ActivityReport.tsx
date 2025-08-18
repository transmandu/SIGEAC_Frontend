/* eslint-disable jsx-a11y/alt-text */
import { ActivityReport } from "@/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#FFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logo: {
    paddingTop: 2,
    width: 165,
    height: 30,
    position: "absolute",
    left: 0,
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  titleText: {
    fontSize: 14,
    fontWeight: 900,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    padding: 5,
    textAlign: "center",
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: "#ADD8E6",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
    fontSize: 9,
  },
  inputLine: {
    borderBottomWidth: 1,
    width: "20%",
    marginLeft: 5,
  },
  label: {
    fontSize: 9,
  },
  name: {
    fontSize: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 90,
  },
  dateLabel: {
    fontSize: 10,
  },
  dateText: {
    fontSize: 10,
    marginLeft: 40,
    marginTop: 1,
  },
  observationContainer: {
    borderWidth: 1,
    padding: 5,
    marginTop: 10,
    minHeight: 50,
  },
  observationText: {
    fontSize: 10,
    margin: 5,
  },
});

const ActivitiesReportPdf = ({
  report,
}: {
  report: ActivityReport;
}) => (
  <Document>
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      {/* HEADER CON LOGO Y TÍTULO */}
      <View style={styles.headerContainer}>
        <Image src="/tmd_nombre.png" style={styles.logo} />
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>REGISTRO DE</Text>
          <Text style={styles.titleText}>ACTIVIDADES DIARIAS</Text>
        </View>
      </View>

      {/* INFORMACIÓN DEL ANALISTA, FIRMA Y FECHA */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <Text style={styles.label}>ANALISTA:</Text>
        <View style={{ width: "15%" }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#000",
              marginHorizontal: 0,
            }}
          >
            <Text style={[styles.name, { paddingHorizontal: 10 }]}>
              {report.user?.first_name} {report.user?.last_name}
            </Text>
          </View>
        </View>
        <Text style={[styles.label, { marginLeft: 20 }]}>FIRMA: </Text>
        <View style={styles.inputLine}></View>

        {/* FECHA con formato date-fns */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>FECHA:</Text>
          <Text style={styles.dateText}>{format(report.date, "dd/MM/yyyy", { locale: es })}</Text>
          {/* <Text style={styles.dateText}>
            {report.date
              ? format(new Date(report.date), "dd/MM/yyyy", { locale: es })
              : ""}
          </Text> */}
        </View>
      </View>

      {/* TABLA DE ACTIVIDADES */}
      <View style={[styles.row, styles.table, styles.tableHeader]}>
        <Text style={[styles.cell, { width: "5%" }]}>N°</Text>
        <Text style={[styles.cell, { width: "40%" }]}>ACTIVIDAD</Text>
        <Text style={[styles.cell, { width: "10%" }]}>HORA</Text>
        <Text style={[styles.cell, { width: "45%" }]}>RESULTADO</Text>
      </View>

      {/* Iterar sobre cada ActivityReport y sus actividades */}
      <View>
        {report.activities.map((activity, activityIndex) => (
          <View style={[styles.row, styles.table]} key={activity.id}>
            <Text style={[styles.cell, { width: "5%" }]}>
              {activityIndex + 1}
            </Text>
            <Text style={[styles.cell, { width: "40%" }]}>
              {activity.description}
            </Text>
            <Text style={[styles.cell, { width: "10%" }]}>
              {activity.start_hour} - {activity.final_hour}
            </Text>
            <Text style={[styles.cell, { width: "45%" }]}>
              {activity.result || "N/A"}
            </Text>
          </View>
        ))}
      </View>

      {/* SECCIÓN DE OBSERVACIONES */}
      <Text style={[styles.footer, { marginBottom: 5 }]}>OBSERVACIONES:</Text>
      <View style={styles.observationContainer}>
        <Text style={styles.observationText}>{report.observation}</Text>
      </View>
    </Page>
  </Document>
);

export default ActivitiesReportPdf;
