import { dateFormat, getResult, timeFormat } from "@/lib/utils";
import {
  DangerIdentificationWithAll,
  MitigationTable,
  VoluntaryReport,
} from "@/types";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

const BLUE = "#daeef3";
const BLUE_HEADER = "#b6dde8";
const RED = "#ff0000";
const GREEN = "#00b050";
const YELLOW = "#f9c000";
const WHITE = "#fff";
const GRAY = "#d9d9d9";

// ... (your formatDate function and styles remain the same)

interface MyDocumentProps {
  report: VoluntaryReport;
  identification: MitigationTable;
}

const styles = StyleSheet.create({
  logo: {
    width: 102,
    height: 43,
    position: "relative",
  },
  pyramid_image: {
    width: 121,
    height: 118,
    position: "absolute",
  },
  page: {
    padding: 30,
    backgroundColor: "#FFF",
  },

  footerContainer: {
    position: "absolute",
    bottom: 35,
    left: 30,
    right: 30,
    borderBottom: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    textAlign: "center",
    borderTop: 1,
    borderLeft: 1,
  },
  tableCell: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    borderRight: 1,
    borderColor: "#000", // Establecemos el color del borde
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Asegura que el texto y la línea estén en la misma línea
    marginBottom: 10,
  },
  titleText: {
    fontSize: 12,
    fontWeight: 900,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  cell: {
    display: "flex",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    padding: 4,
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  innerCell: {
    display: "flex",
    justifyContent: "center",
    padding: 4,
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  cellHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    padding: 4,
    textAlign: "center",
    fontFamily: "Helvetica",
    fontWeight: "black",
    fontSize: 8,
  },
  tableHeader: {
    backgroundColor: "#e3f4ff",
    fontWeight: "extrabold",
  },
  tableContent: {
    backgroundColor: "#fff",
    fontWeight: "bold",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
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
    fontSize: 8,
    marginLeft: 40,
    marginTop: 1,
  },
  observationContainer: {
    borderBottom: 1,
    borderRight: 1,
    borderLeft: 1,
    borderTop: 0,
    padding: 4,
    minHeight: 50,
  },
  observationText: {
    fontSize: 8,
    margin: 5,
  },
  check: {
    borderRightWidth: 1,
    backgroundColor: "#fff",
    borderRightColor: "#000",
    borderRightStyle: "solid",
    padding: "5",
    textAlign: "center",
    fontSize: 8,
  },
  cell2: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    textAlign: "center",
    fontSize: 8,
  },

  container: {
    borderStyle: "solid",
    borderLeft: "1",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch", // Asegurar que los hijos ocupen toda la altura
  },

  containerArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
    backgroundColor: "#e3f4ff",
  },

  Container2: {
    display: "flex",
    flexDirection: "row",
  },

  Container3: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3f4ff",
  },

  ContainerAreaType: { width: "100%" },

  lineContainer: {
    borderTop: "1px",
    width: "100%",
  },
  secondColumnTop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    width: "100%",
    paddingHorizontal: 5,
  },
  secondColumnBottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  thirdColumnRow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    width: "100%",
  },
  thirdColumnLastRow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginBottom: 10,
  },
  column: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
  },
  firstColumn: {
    width: "30%",
  },
  secondColumn: {
    width: "40%",
    height: 60,
    alignSelf: "stretch",
  },
  thirdColumn: {
    width: "30%",
    borderRightWidth: 0,
  },
  text: {
    fontFamily: "Helvetica",
    fontSize: 10,
    textAlign: "center",
    whiteSpace: "normal", // Permitir que el texto se divida en varias líneas
  },
  blackText: {
    fontFamily: "Helvetica",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "black",
  },
  title: {
    fontSize: 8,
    marginBottom: 5,
  },

  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    width: "100%",
    marginBottom: 13,
  },
  firstLine: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginLeft: 5, // Espacio entre el texto y la primera línea
  },
  linesContainer: {
    marginTop: 10,
  },

  boldTitle: {
    fontFamily: "Helvetica-Bold",
  },
  rowFooter: {
    alignItems: "stretch",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  cellLarge: {
    alignSelf: "stretch",
    flex: 2,
    borderRightWidth: 1,
    borderLeft: 1,
    borderRightColor: "#000",
    padding: 4,
    fontSize: 8,
    textAlign: "center",
  },
  cellSmall: {
    alignSelf: "stretch",
    flex: 0.5,
    borderRight: 1,
    padding: 4,
    fontSize: 8,
    textAlign: "center",
  },
  lastCellSmall: {
    flex: 0.314,
    justifyContent: "center",
    padding: 4,
    fontSize: 8,
    alignSelf: "stretch",
    textAlign: "center",
  },
  doubleRowCell: {
    flex: 0.7,
    padding: 2,
    fontSize: 8,
    textAlign: "center",
    borderLeftWidth: 1,
  },
  lastDoubleRowCell: {
    flex: 0.28,
    padding: 2,
    margin: 0,
    fontSize: 8,
    textAlign: "center",
    borderLeftWidth: 1,
  },
  gridContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  gridRow: {
    flexDirection: "row",
  },
  gridCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    paddingHorizontal: 10,
  },
  incidentText: {
    fontSize: 9,
    flex: 1,
    textAlign: "left",
  },
  checkCell: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginLeft: 10,
  },
  signatureContainer: {
    alignItems: "center", // Centra la línea y el texto horizontalmente
    marginTop: 140, // Espacio entre la tabla y la firma
  },
  signatureLine: {
    width: 160, // Ajusta el ancho para que sea aproximadamente 5.5 cm (dependiendo de la densidad de píxeles)
    height: 0.5, // Grosor de la línea
    backgroundColor: "black", // Color de la línea
  },
  signatureText: {
    fontSize: 10,
    fontFamily: "Helvetica",
    marginTop: 20, // Espacio entre la línea y el texto
  },
  instructiveContainer: {
    display: "flex",
    flexDirection: "row",
    fontWeight: "bold",
  },
  instructiveText: {
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  instructiveTitle: {
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
  },
  instructiveSubTitle: {
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
  },
  underlinedTTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textAlign: "center",
    textDecoration: "underline",
    marginVertical: 20,
  },

  cellText: {
    fontSize: 9,
  },
  cellText2: {
    fontSize: 10,
  },
  cellText3: {
    fontSize: 8,
  },
  cellText4: {
    fontSize: 7,
  },
  cellTextHeader: {
    fontSize: 10,
    textAlign: "center",
  },
  column2Header: {
    width: "55%",
    flexDirection: "column",
    borderTop: 1,
    borderRight: 1,
  },
  column3Header: {
    width: "25%",
    flexDirection: "column",
    borderTop: 1,
    borderRight: 1,
  },
  rowColumnHeader: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableRowHeader: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 9,
  },
  tableCellHeader: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  lastRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  mainRow: {
    flexDirection: "row",
    width: "100%",
    borderLeft: 1, // Borde más delgado
    minHeight: "120px", // Altura reducida
  },
  pyramidColumn: {
    width: "50%",
    padding: 5, // Padding reducido
    borderRight: "1px solid #000",
    justifyContent: "center",
    alignItems: "center",
  },
  segmentedColumn: {
    width: "25%",
    borderRight: 1,
  },
  segment: {
    flex: 1,
    //borderBottom: "1px solid #eee", // Borde más sutil
    padding: 3, // Padding mínimo
    justifyContent: "center",
    alignItems: "center",
    minHeight: 30, // Altura fija pequeña para cada segmento
  },
  lastSegment: {
    //borderBottom: 1,
  },
  pyramidTitle: {
    textAlign: "center",
    fontSize: 9, // Texto más pequeño
    fontWeight: "bold",
  },
  segmentText: {
    fontSize: 10, // Texto más pequeño
    color: "#333",
    margin: 1, // Margen mínimo
  },
});

export const InstructiveFirstPart = () => (
  <View>
    <View>
      <Text style={styles.underlinedTTitle}>INSTRUCTIVO DE LLENADO</Text>
    </View>

    <View style={[styles.instructiveContainer, { marginBottom: 10 }]}>
      <Text style={styles.instructiveSubTitle}>
        1. NOTIFICACION DE PELIGROS
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveSubTitle}>
        • Fecha de la identificación del peligro (DD/MM/AAAA):
      </Text>
      <Text style={styles.instructiveText}> Colocar el día, mes y año que</Text>
    </View>
    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveText}>se identifica el peligro.</Text>
    </View>
  </View>
);

interface FirstPageProps {
  identificationDate: Date;
  reportDate: Date;
  reportType: string;
  reportNumber?: string;
  identification: MitigationTable;
}

export const FirstPage = ({
  reportType,
  reportDate,
  identificationDate,
  reportNumber,
  identification,
}: FirstPageProps) => (
  <Page size="LETTER" style={styles.page}>
    {/*Encabezado de la pagina */}
    <Header />

    <View style={[styles.tableRow, { marginTop: 8 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          1. NOTIFICACION DE PELIGROS{"\n"}
        </Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View
        style={{
          ...styles.tableCell,
          width: "37%",
          backgroundColor: BLUE,
          alignItems: "flex-start",
          paddingLeft: 6,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          FECHA DE LA IDENTIFICACION DEL
        </Text>
        <Text style={[styles.cellText, styles.boldTitle]}>PELIGRO:</Text>
      </View>
      <View
        style={{ ...styles.tableCell, width: "63%", backgroundColor: BLUE }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>
          TIPO DE PELIGRO
        </Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, width: "37%" }}>
        <Text style={styles.cellText}>
          {dateFormat(identificationDate, "dd-MM-yyyy")}
        </Text>
      </View>

      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "18.75%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>NATURAL</Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12.75%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>TECNICO</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "18.75%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>ORGNIZACIONAL</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12.75%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>HUMANO</Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View
        style={{
          ...styles.tableCell,
          width: "27%",
          backgroundColor: BLUE,
          paddingLeft: 6,
          alignItems: "flex-start",
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          FECHA DE LA RECEPCION DEL
        </Text>
        <Text style={[styles.cellText, styles.boldTitle]}>PELIGRO</Text>
      </View>
      <View
        style={{ ...styles.tableCell, width: "10%", backgroundColor: BLUE }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>N° CASO</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "18.75%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {identification.danger_type === "NATURAL" ? "X" : ""}
        </Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12.75%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {identification.danger_type === "TECNICO" ? "X" : ""}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "18.75%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {identification.danger_type === "ORGANIZACIONAL" ? "X" : ""}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12.75%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {identification.danger_type === "HUMANO" ? "X" : ""}
        </Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "27%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {dateFormat(reportDate, "dd-MM-yyy")}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "10%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {reportType}-{reportNumber ?? `N/A`}
        </Text>
      </View>

      <View
        style={{ ...styles.tableCell, width: "63%", backgroundColor: BLUE }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          METODO Y FUENTE DE LA IDENTIFICACION DE PELIGROS
        </Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "37%",
          backgroundColor: BLUE,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          AREA DONDE FUE IDENTIFICADO EL{"\n"}EL PELIGRO:
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "31.5%",
          backgroundColor: GREEN,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>PROACTIVO</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "31.5%",
          backgroundColor: RED,
          color: WHITE,
          fontWeight: "extrabold",
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>REACTIVO</Text>
      </View>
    </View>

    {/* ESTA ES LA FILA EXTR*A QUE UAN NO SE SI FUNCIONARA*/}
    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "32%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>OPERACIONES</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {identification.danger_area === "OPERACIONES" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
        }}
      >
        <Text style={[styles.cellText, { paddingLeft: 2 }]}>REPORTE</Text>
        <Text style={[styles.cellText, { paddingLeft: 2 }]}>VOLUNTARIO</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {identification.information_source.name === "Reporte Voluntario"
            ? "X"
            : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>
    </View>

    {/* ESTA ES LA FILA EXTR*A QUE UAN NO SE SI FUNCIONARA*/}
    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "32%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>MANTENIMIENTO</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {" "}
          {identification.danger_area === "MANTENIMIENTO" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>AUDITORIA</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {" "}
          {identification.information_source.name === "Auditoria" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          borderTop: 0,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>REPORTE OBLIGATORIO</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {" "}
          {identification.information_source.name === "Reporte Obligatorio"
            ? "X"
            : ""}
        </Text>
      </View>
    </View>

    {/* ESTA ES LA FILA EXTR*A QUE UAN NO SE SI FUNCIONARA*/}
    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "32%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>ADMINISTRACION Y RRHH</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {" "}
          {identification.danger_area === "ADMINISTRACION" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>ENCUESTAS</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {identification.information_source.name === "Encuesta" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          borderTop: 0,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>
    </View>

    {/* ESTA ES LA FILA EXTR*A QUE UAN NO SE SI FUNCIONARA*/}
    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "32%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>GERENCIA DE CONTROL Y</Text>
        <Text style={[styles.cellText]}>CALIDAD</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {" "}
          {identification.danger_area === "CONTROL_CALIDAD" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>INSPECCION</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {" "}
          {identification.information_source.name === "Inspeccion" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>INVESTIGACION INTERNA</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {identification.information_source.name === "Investigacion Interna"
            ? "X"
            : ""}
        </Text>
      </View>
    </View>

    {/* ESTA ES LA FILA EXTR*A QUE UAN NO SE SI FUNCIONARA*/}
    <View style={styles.tableRow}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "32%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>OTROS</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText2}>
          {" "}
          {identification.danger_area === "OTROS" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText]}>ENTREVISTA</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}>
          {" "}
          {identification.information_source.name === "Entrevista" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "26.5%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText]}></Text>
      </View>
    </View>

    <View style={[styles.tableRow, { borderBottom: 1 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          BREVE DESCRIPCION DEL PELIGRO
        </Text>
      </View>
    </View>

    <View style={styles.observationContainer}>
      <View
        style={{
          position: "absolute",
          top: 4,
          left: 5,
          right: 5,
          lineHeight: 0.8,
        }}
      >
        <Text style={styles.cellText}>{identification.description}</Text>
      </View>

      {/* Líneas adicionales con interlineado de 1.5 */}
      <View style={styles.linesContainer}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.line} />
        ))}
      </View>
    </View>

    <View style={[styles.tableRow, { marginTop: 15, borderBottom: 1 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          ANALISIS CAUSA RAIZ
        </Text>
      </View>
    </View>

    <View style={styles.observationContainer}>
      <View
        style={{
          position: "absolute",
          top: 3,
          left: 5,
          right: 5,
          lineHeight: 0.8,
        }}
      >
        {/* Dividimos el string por comas y mapeamos cada elemento */}
        {identification.root_cause_analysis
          .split(",")
          .concat(Array(5).fill("")) // Asegura que haya al menos 5 elementos
          .slice(0, 5) // Toma solo los primeros 5 elementos
          .map((cause, index) => (
            <Text key={index} style={styles.cellText}>
              <Text style={[styles.cellText2, styles.boldTitle]}>Porque? </Text>
              {cause.trim()}
            </Text>
          ))}
      </View>

      {/* Líneas adicionales con interlineado de 1.5 */}
      <View style={styles.linesContainer}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={styles.line}>
            <Text style={[styles.cellText3]}></Text>
          </View>
        ))}
      </View>
    </View>

    <View style={[styles.tableRow, { borderTop: 0 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: WHITE,
          alignItems: "flex-start",
          paddingLeft: 4,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>
          Si el porque final no tiene una solucion controlable, vuelva al
          `porque` anterior
        </Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          2. GESTION DE RIESGOS
        </Text>
      </View>
    </View>
    <View style={styles.tableRow}>
      <View
        style={{ ...styles.tableCell, width: "100%", backgroundColor: BLUE }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          AREA RESPONSABLE DE LA MITIGACION
        </Text>
      </View>
    </View>

    {/* FILA PARA LOS DATOS DEL AREA RESPONSABLE DE LA MITIGACION*/}

    <View style={[styles.tableRow]}>
      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          DIRECCION{"\n"}SMS
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "SMS" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "15%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>OPERACIONES</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "OPERACIONES"
            ? "X"
            : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          MANTENIMIENTO{"\n"}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible ===
          "MATENIMIENTO_PLANIFICACION"
            ? "X"
            : ""}
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "28%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          GERENCIA DE ADMINISTRACION Y{"\n"}RRHH
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "ADMINISTRACION_RRHH"
            ? "X"
            : ""}
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow, { borderBottom: 1 }]}>
      {/*NUMERO DE REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "35%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          GERENCIA DE CONTROL{"\n"}DE CALIDAD
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "IT" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "21%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>AVSEC</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "AVSEC" ? "X" : ""}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "29%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          INFORMATICA Y TECNOLOGIA
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "5%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.responsible === "IT" ? "X" : ""}
        </Text>
      </View>
    </View>
    {Footer(1, 6)}
  </Page>
);

export const SecondPage = ({
  identification,
}: {
  identification: MitigationTable;
}) => (
  <Page size={"LETTER"} style={styles.page}>
    <Header />

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
          borderBottom: 1,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          POSIBLES CONSECUENCIAS:
        </Text>
      </View>
    </View>

    <View style={[styles.observationContainer, { borderBottom: 0 }]}>
      <View
        style={{
          position: "absolute",
          top: 3,
          left: 5,
          right: 5,
          lineHeight: 0.8,
        }}
      >
        {/* Tomamos solo los primeros 5 elementos del array dividido */}
        {identification.possible_consequences
          .split(",")
          .slice(0, 5)
          .map((cause, index) => (
            <Text key={index} style={styles.cellText}>
              <Text style={[styles.cellText, styles.boldTitle]}>
                {index + 1}.{" "}
              </Text>
              {cause.trim()}
            </Text>
          ))}

        {/* Rellenamos con líneas vacías si hay menos de 5 elementos */}
        {[
          ...Array(
            Math.max(
              0,
              5 - identification.possible_consequences.split(",").length
            )
          ),
        ].map((_, index) => (
          <Text key={`empty-${index}`} style={styles.cellText}>
            <Text style={[styles.cellText, styles.boldTitle]}>
              {identification.possible_consequences.split(",").length +
                index +
                1}
              .{" "}
            </Text>
          </Text>
        ))}
      </View>

      {/* Líneas adicionales con interlineado de 1.5 */}
      <View style={styles.linesContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.line}>
            <Text style={[styles.cellText3]}></Text>
          </View>
        ))}
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
          borderBottom: 1,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          DEFENSAS ACTUALES
        </Text>
      </View>
    </View>

    <View style={[styles.observationContainer, { borderBottom: 0 }]}>
      <View
        style={{
          position: "absolute",
          top: 3,
          left: 5,
          right: 5,
          lineHeight: 0.8,
        }}
      >
        {/* Tomamos solo los primeros 5 elementos del array dividido */}
        {identification.current_defenses
          .split(",")
          .slice(0, 5)
          .map((cause, index) => (
            <Text key={index} style={styles.cellText}>
              <Text style={[styles.cellText, styles.boldTitle]}>
                {index + 1}.{" "}
              </Text>
              {cause.trim()}
            </Text>
          ))}

        {/* Rellenamos con líneas vacías si hay menos de 5 elementos */}
        {[
          ...Array(
            Math.max(0, 5 - identification.current_defenses.split(",").length)
          ),
        ].map((_, index) => (
          <Text key={`empty-${index}`} style={styles.cellText}>
            <Text style={[styles.cellText, styles.boldTitle]}>
              {identification.current_defenses.split(",").length + index + 1}.{" "}
            </Text>
          </Text>
        ))}
      </View>

      {/* Líneas adicionales con interlineado de 1.5 (se mantienen igual) */}
      <View style={styles.linesContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.line}>
            <Text style={[styles.cellText3]}></Text>
          </View>
        ))}
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          MATRIZ DE EVALUACION DE RIESGO DE SEGURIDAD OPERACIONAL
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Probabilidad de Riesgo
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Catastrófico{"\n"}(A)
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Peligroso{"\n"}(B)
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Importante{"\n"}(C)
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Leve{"\n"} (D)
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Insignificante{"\n"}(E)
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Frecuente (5)
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          5A
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          5B
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          5C
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          {" "}
          5D
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          5E
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Ocasional (4)
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          4A
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          4B
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          4C
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          {" "}
          4D
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          4E
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Remoto (3)
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle, { color: RED }]}>
          3A
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          3B
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          3C
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          {" "}
          3D
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          3E
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Improbable (2)
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          2A
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          2B
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: YELLOW }]}
        >
          2C
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          {" "}
          2D
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          2E
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "30%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Sumamente Improbable (1)
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          1A
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          1B
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          1C
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          {" "}
          1D
        </Text>
      </View>
      <View
        style={{
          ...styles.tableCell,
          width: "14%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[styles.cellTextHeader, styles.boldTitle, { color: GREEN }]}
        >
          1E
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          MATRIZ DE TOLERABILIDAD DEL RIESGO DE SEGURIDAD OPERACIONAL
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "50%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Descripción de tolerabilidad{" "}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Índice de riesgo{" "}
        </Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          Criterios sugeridos{" "}
        </Text>
      </View>
    </View>

    <View style={[styles.mainRow, { borderTop: 1 }]}>
      {/* Columna de la pirámide (continua) */}
      <View style={styles.pyramidColumn}>
        <Image src="/risk_matrix_pyramid.png" style={styles.pyramid_image} />
      </View>

      {/* Primera columna segmentada */}
      <View style={styles.segmentedColumn}>
        <View style={[styles.segment, { backgroundColor: RED }]}>
          <Text style={styles.segmentText}></Text>
        </View>
        <View
          style={[styles.segment, { backgroundColor: YELLOW, borderTop: 1 }]}
        >
          <Text style={styles.segmentText}></Text>
        </View>
        <View
          style={[
            styles.segment,
            styles.lastSegment,
            { backgroundColor: GREEN, borderTop: 1 },
          ]}
        >
          <Text style={styles.segmentText}></Text>
        </View>
      </View>

      {/* Segunda columna segmentada */}
      <View style={[styles.segmentedColumn]}>
        <View style={styles.segment}>
          <Text style={styles.segmentText}>
            Inaceptable según las circunstancias existentes
          </Text>
        </View>
        <View style={[styles.segment, { borderTop: 1 }]}>
          <Text style={styles.segmentText}>
            Tolerable según la mitigación de riesgos. Puede necesitar una
            decisión de gestión
          </Text>
        </View>
        <View style={[styles.segment, styles.lastSegment, { borderTop: 1 }]}>
          <Text style={styles.segmentText}>Aceptable</Text>
        </View>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          CONSECUENCIA A EVALUAR PARA ESTABLECER LAS MEDIDAS DE MITIGACION:
        </Text>
      </View>
    </View>

    {identification.possible_consequences.split(",").map((cause, index) => {
      const trimmedCause = cause.trim();
      const isMatch =
        trimmedCause === identification.consequence_to_evaluate?.trim();

      return isMatch ? (
        <>
          <View style={styles.tableRow}>
            {/*FECHA DE IDENTIFICACION DEL REPORTE*/}
            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: GRAY,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>1</Text>
            </View>

            {/*LOCALIZACION DEL REPORTE*/}
            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>
                {index + 1 == 1 ? "X" : ""}
              </Text>
            </View>

            {/*NUMERO DE REPORTE*/}
            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: GRAY,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>2</Text>
            </View>

            {/*NUMERO DE REPORTE*/}
            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>
                {" "}
                {index + 1 == 2 ? "X" : ""}
              </Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: GRAY,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>3</Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>
                {" "}
                {index + 1 == 3 ? "X" : ""}
              </Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: GRAY,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>4</Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>
                {" "}
                {index + 1 == 4 ? "X" : ""}
              </Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: GRAY,
              }}
            >
              <Text style={[styles.cellText2, styles.boldTitle]}>5</Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "10%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={styles.cellText2}> {index + 1 == 5 ? "X" : ""}</Text>
            </View>
          </View>
        </>
      ) : null;
    })}

    <View style={[styles.tableRow]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>Probabilidad</Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>Severidad</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>
          Indice de riesgo inicial
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText2, styles.boldTitle]}>
          Tolerabilidad del riesgo
        </Text>
      </View>
    </View>
    <View style={[styles.tableRow, { borderBottom: 1 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.analysis.probability}
        </Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.analysis.severity}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.analysis.result}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {getResult(identification.analysis.result)}
        </Text>
      </View>
    </View>

    {Footer(2, 6)}
  </Page>
);

export const ThirdPage = ({
  identification,
}: {
  identification: MitigationTable;
}) => (
  <Page size={"LETTER"} style={styles.page}>
    <Header />
    <View style={[styles.tableRow, { marginTop: 15 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
          borderBottom: 1,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          MEDIDAS DE MITIGACION A IMPLEMENTAR
        </Text>
      </View>
    </View>

    <View style={[styles.observationContainer, { borderBottom: 0 }]}>
      <View
        style={{
          position: "absolute",
          top: 3,
          left: 5,
          right: 5,
          lineHeight: 0.8,
        }}
      >
        {/* 1. Mostrar medidas existentes (hasta 5) */}
        {(identification.mitigation_plan?.measures || [])
          .slice(0, 5)
          .map((measure, index) => (
            <Text key={measure.id || index} style={styles.cellText}>
              <Text style={[styles.cellText, styles.boldTitle]}>
                {index + 1}.{" "}
              </Text>
              {measure.description}
            </Text>
          ))}

        {/* 2. Completar con líneas numeradas si hay menos de 5 medidas */}
        {Array.from({
          length: Math.max(
            0,
            5 - (identification.mitigation_plan?.measures?.length || 0)
          ),
        }).map((_, index) => {
          const currentIndex =
            (identification.mitigation_plan?.measures?.length || 0) + index + 1;
          return (
            <Text key={`empty-${index}`} style={styles.cellText}>
              <Text style={[styles.cellText, styles.boldTitle]}>
                {currentIndex}.{" "}
              </Text>
            </Text>
          );
        })}
      </View>

      <View style={styles.linesContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={`line-${index}`} style={styles.line}>
            <Text style={styles.cellText3}></Text>
          </View>
        ))}
      </View>
    </View>

    <View style={[styles.tableRow]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          RESPONSABLE DE LA
        </Text>
        <Text style={[styles.cellText, styles.boldTitle]}>IMPLEMENTACION</Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>FIRMA</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "18%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>RESPONSABLE</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>DEL</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>SEGUIMIENTO</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>FIRMA</Text>
      </View>

      <View
        style={{
          ...styles.tableCell,
          width: "21%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>FECHA</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>ESTIMADA DE</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>EJECUCION</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "12%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>FECHA</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>REAL DE</Text>
        <Text style={[styles.cellText, styles.boldTitle]}>EJECUCION</Text>
      </View>
    </View>

    <>
      {/* Muestra las medidas existentes (hasta 5) */}
      {identification.mitigation_plan?.measures
        .slice(0, 5)
        .map((measure, index) => {
          const isLastRow = index === 4; // Verifica si es la quinta fila
          return (
            <View
              key={measure.id}
              style={[
                styles.tableRow,
                ...(isLastRow ? [styles.lastRowBorder] : []),
              ]}
            >
              <View
                style={{
                  ...styles.tableCell,
                  width: "25%",
                  backgroundColor: WHITE,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[styles.cellText2, { width: 25, textAlign: "left" }]}
                >
                  {index + 1}.
                </Text>
                <Text
                  style={[styles.cellText2, { flex: 1, textAlign: "center" }]}
                >
                  {measure.implementation_responsible}
                </Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "12%",
                  backgroundColor: WHITE,
                }}
              >
                <Text
                  style={[styles.cellText2, { textAlign: "center" }]}
                ></Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "18%",
                  backgroundColor: WHITE,
                }}
              >
                <Text style={[styles.cellText2, { textAlign: "center" }]}>
                  {measure.implementation_supervisor}
                </Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "12%",
                  backgroundColor: WHITE,
                }}
              >
                <Text
                  style={[styles.cellText2, { textAlign: "center" }]}
                ></Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "21%",
                  backgroundColor: WHITE,
                }}
              >
                <Text style={[styles.cellText2, { textAlign: "center" }]}>
                  {dateFormat(measure.estimated_date, "dd-MM-yyyy")}
                </Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "12%",
                  backgroundColor: WHITE,
                }}
              >
                <Text style={[styles.cellText2, { textAlign: "center" }]}>
                  {dateFormat(measure.execution_date, "dd-MM-yyyy")}
                </Text>
              </View>
            </View>
          );
        })}

      {/* Rellena con líneas vacías si hay menos de 5 */}
      {Array.from({
        length: Math.max(
          0,
          5 - (identification.mitigation_plan?.measures?.length || 0)
        ),
      }).map((_, i) => {
        const emptyIndex =
          (identification.mitigation_plan?.measures?.length || 0) + i;
        const isLastRow = emptyIndex === 4; // Última línea (índice 4)

        return (
          <View
            key={`empty-${emptyIndex}`}
            style={[
              styles.tableRow,
              ...(isLastRow ? [styles.lastRowBorder] : []),
            ]}
          >
            <View
              style={{
                ...styles.tableCell,
                width: "25%",
                backgroundColor: WHITE,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={[styles.cellText2, { width: 25, textAlign: "left" }]}
              >
                {emptyIndex + 1}.
              </Text>
              <Text
                style={[styles.cellText2, { flex: 1, textAlign: "center" }]}
              ></Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "12%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, { textAlign: "center" }]}></Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "18%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, { textAlign: "center" }]}></Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "12%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, { textAlign: "center" }]}></Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "21%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, { textAlign: "center" }]}></Text>
            </View>

            <View
              style={{
                ...styles.tableCell,
                width: "12%",
                backgroundColor: WHITE,
              }}
            >
              <Text style={[styles.cellText2, { textAlign: "center" }]}></Text>
            </View>
          </View>
        );
      })}
    </>

    <View style={[styles.tableRow, { borderTop: 0 }]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>PROBABILIDAD</Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>SEVERIDAD</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          INDICE DE RIESGO RESIDUAL
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          TOLERABILIDAD DEL{"\n"}RIESGO RESIDUAL
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.analysis.probability}
        </Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.analysis.severity}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan?.analysis.result}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "25%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={[styles.cellText3, styles.boldTitle]}>
          {identification.mitigation_plan &&
            getResult(identification.mitigation_plan?.analysis.result)}
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          3. CONTROL DE SEGUIMIENTO
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText4, styles.boldTitle]}>
          FECHA DE{"\n"}SEGUIMIENTO DE{"\n"}LAS MEDIDAS DE{"\n"}MITIGACION
        </Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText4, styles.boldTitle]}>OBSERVACIONES</Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText4, styles.boldTitle]}>FIRMA</Text>
      </View>
    </View>

    {(() => {
      // 1. Obtener todos los controles (máximo 5)
      const allControls =
        identification.mitigation_plan?.measures
          .flatMap((measure) => measure.follow_up_control || [])
          .slice(0, 5) || [];

      // 2. Calcular controles vacíos necesarios
      const emptyControlsCount = Math.max(0, 5 - allControls.length);

      return (
        <>
          {/* Controles existentes */}
          {allControls.map((control, index) => (
            <View
              key={`control-${control.id || index}`}
              style={styles.tableRow} // Eliminado el borderBottom
            >
              <View
                style={{
                  ...styles.tableCell,
                  width: "33.33%",
                  backgroundColor: WHITE,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 4,
                }}
              >
                <Text
                  style={[styles.cellText2, { width: 20, textAlign: "left" }]}
                >
                  {index + 1}.
                </Text>
                <Text
                  style={[styles.cellText2, { flex: 1, textAlign: "center" }]}
                >
                  {control.date ? dateFormat(control.date, "dd-MM-yyyy") : ""}
                </Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "33.33%",
                  backgroundColor: WHITE,
                  justifyContent: "center",
                }}
              >
                <Text style={[styles.cellText2, { textAlign: "left" }]}>
                  {control.description || ""}
                </Text>
              </View>

              <View
                style={{
                  ...styles.tableCell,
                  width: "33.33%",
                  backgroundColor: WHITE,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={[styles.cellText2, { textAlign: "center" }]}
                ></Text>
              </View>
            </View>
          ))}

          {/* Controles vacíos */}
          {Array.from({ length: emptyControlsCount }).map((_, i) => {
            const emptyIndex = allControls.length + i;
            return (
              <View
                key={`empty-${emptyIndex}`}
                style={styles.tableRow} // Sin borde
              >
                <View
                  style={{
                    ...styles.tableCell,
                    width: "33.33%",
                    backgroundColor: WHITE,
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 4,
                  }}
                >
                  <Text
                    style={[styles.cellText2, { width: 20, textAlign: "left" }]}
                  >
                    {emptyIndex + 1}.
                  </Text>
                  <Text
                    style={[styles.cellText2, { flex: 1, textAlign: "center" }]}
                  ></Text>
                </View>

                <View
                  style={{
                    ...styles.tableCell,
                    width: "33.33%",
                    backgroundColor: WHITE,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[styles.cellText2, { textAlign: "center" }]}
                  ></Text>
                </View>

                <View
                  style={{
                    ...styles.tableCell,
                    width: "33.33%",
                    backgroundColor: WHITE,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[styles.cellText2, { textAlign: "center" }]}
                  ></Text>
                </View>
              </View>
            );
          })}
        </>
      );
    })()}

    <View style={[styles.tableRow]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: BLUE_HEADER,
        }}
      >
        <Text style={[styles.cellTextHeader, styles.boldTitle]}>
          4. CIERRE DEL CASO
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>FECHA DE CIERRE</Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          FIRMA DEL REPRESENTANTE DE{"\n"}SMS
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: GRAY,
        }}
      >
        <Text style={[styles.cellText, styles.boldTitle]}>
          FIRMA DEL JEFE DEL AREA{"\n"}RESPONSABLE DE LA{"\n"}MITIGACION
        </Text>
      </View>
    </View>

    <View style={[styles.tableRow, { borderBottom: 1 }]}>
      {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText3}>
          {"\n"}
          {"\n"}
        </Text>
      </View>

      {/*LOCALIZACION DEL REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText3}>
          {"\n"}
          {"\n"}
        </Text>
      </View>

      {/*NUMERO DE REPORTE*/}
      <View
        style={{
          ...styles.tableCell,
          width: "33.33%",
          backgroundColor: WHITE,
        }}
      >
        <Text style={styles.cellText3}>
          {"\n"}
          {"\n"}
        </Text>
      </View>
    </View>

    {Footer(3, 6)}
  </Page>
);

export const FourthPage = () => (
  <Page size={"LETTER"} style={styles.page}>
    <Header />

    <View style={[styles.tableRow, { borderBottom: 1 }]}>
      <View
        style={{
          ...styles.tableCell,
          width: "100%",
          backgroundColor: WHITE,
        }}
      >
        <Text
          style={[
            styles.cellTextHeader,
            styles.boldTitle,
            { textAlign: "center", textDecoration: "underline" },
          ]}
        >
          OBSERVACION
        </Text>
      </View>
    </View>

    <View style={[styles.observationContainer,{paddingBottom:220,paddingTop:220}]}>

    </View>

    <InstructiveFirstPart />

    {Footer(4, 6)}
  </Page>
);

export const FifthPage = () => (
  <Page size={"LETTER"} style={styles.page}>
    <Header />

    <View style={[{ paddingLeft: 20 }]}>
      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveSubTitle}>
          • Fecha de la recepción del peligro (DD/MM/AAAA):
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar día, mes y año que se
        </Text>
      </View>
      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveText}>
          realizó la apertura del caso en el departamento de SMS.
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveSubTitle}>• N° Caso: </Text>
        <Text style={styles.instructiveText}>
          Colocar el número correlativo a los casos
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveSubTitle}>• Tipo de peligro: </Text>
        <Text style={styles.instructiveText}>
          Marcar con una (X) el tipo de peligro que se identificó.
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveSubTitle}>
          • Área donde fue identificado el peligro:{" "}
        </Text>
        <Text style={styles.instructiveText}>
          Marcar con una (X) el área donde fue identificado
        </Text>
      </View>
      <Text style={styles.instructiveText}>el peligro.</Text>

      <View style={styles.instructiveContainer}>
        <Text style={styles.instructiveSubTitle}>
          • Método y fuente de la identificación de peligros:
        </Text>
        <Text style={styles.instructiveText}>
          Marcar con una (X) la(s) fuente(s) con
        </Text>
      </View>
      <Text style={[styles.instructiveText, { paddingLeft: 8 }]}>
        que se identificó el peligro.
      </Text>
    </View>
    <View
      style={[styles.instructiveContainer, { marginTop: 15, paddingLeft: 20 }]}
    >
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        2. ANALISIS CAUSA RAIZ Utilizar método de causa raíz de los cinco porque
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        Este método emplea un solo paso, que se repite una y otra vez. El
        procedimiento es
        {"\n"}
        empezar con un planteamiento del problema y luego preguntar “¿Por qué?”
        5 veces,
        {"\n"}y cada “¿Por qué?” llevará más cerca de
        {"\n"}
        la causa raíz
      </Text>
    </View>

    <View
      style={[styles.instructiveContainer, { marginTop: 0, paddingLeft: 20 }]}
    >
      <Text
        style={[
          styles.instructiveTitle,
          styles.boldTitle,
          { marginTop: 10, marginBottom: 10 },
        ]}
      >
        3. GESTION DE RIESGOS
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Área responsable de la mitigación:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Marcar con una (X) el área que fue designada para
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Fecha de inicio de la gestión (DD/MM/AAAA):{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar día, mes y año del inicio de la
      </Text>
      <Text style={[styles.instructiveText]}>gestión.</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Posibles consecuencias:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar las posibles consecuencias del peligro identificado.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Consecuencia a evaluar para establecer las medidas de mitigación:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>Marcar con una</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        (X) la consecuencia de mayor gravedad.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Probabilidad:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar la probabilidad obtenida de la matriz de riesgo
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Severidad:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar la severidad obtenida de la matriz de riesgo.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Índice de riesgo inicial:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar el indie de riesgo inicial obtenida.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Tolerabilidad del riesgo:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar la tolerabilidad de riesgo obtenida.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Medidas de mitigación a implementar:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar las medidas de mitigación a
      </Text>

      <Text style={[styles.instructiveText]}>implementar.</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Responsable de la implementación:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar nombre y apellido de la persona
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        responsable de implementar las medidas de mitigación.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>• Firma: </Text>
      <Text style={[styles.instructiveText]}>
        Colocar firma de la persona responsable de la implementación.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Responsable del seguimiento:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar nombre y apellido de la persona responsable del
      </Text>
    </View>
    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        seguimiento de las medidas de mitigación.
      </Text>
    </View>

    {Footer(5, 6)}
  </Page>
);

export const SixthPage = () => (
  <Page size={"LETTER"} style={styles.page}>
    <Header />

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Firmar:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar firma de la persona responsable del seguimiento de las medidas
        de
      </Text>
    </View>
    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>mitigación.</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Fecha estimada de ejecución (DD/MM/AAAA):{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar día, mes y año estimada para la
      </Text>
    </View>
    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        ejecución de las medidas de mitigación.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Fecha real de la ejecución (DD/MM/AAAA):{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar día, mes y año de la ejecución de
      </Text>
    </View>
    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>las medidas de mitigación.</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Probabilidad:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>Colocar la probabilidad</Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Severidad:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar la severidad obtenida de la matriz de riesgo.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Índice de riesgo residual:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar el indie de riesgo residual obtenida.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Tolerabilidad del riesgo residual:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar la tolerabilidad de riesgo residual obtenida.
      </Text>
    </View>

    <View
      style={[styles.instructiveContainer, { marginTop: 0, paddingLeft: 20 }]}
    >
      <Text
        style={[
          styles.instructiveTitle,
          styles.boldTitle,
          { marginTop: 10, marginBottom: 10 },
        ]}
      >
        4. CONTROL DE SEGUIMIENTO.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Fecha de seguimiento de las medidas de mitigación (DD/MM/AAAA):{" "}
      </Text>
      <Text style={[styles.instructiveText]}>Colocar día, mes</Text>
    </View>
    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        y año del seguimiento de las medidas de mitigación.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Observaciones:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar observaciones de haberse encontrado.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>• Firma: </Text>
      <Text style={[styles.instructiveText]}>
        Colocar firma de la persona responsable de la implementación.
      </Text>
    </View>

    <View
      style={[styles.instructiveContainer, { marginTop: 0, paddingLeft: 20 }]}
    >
      <Text
        style={[
          styles.instructiveTitle,
          styles.boldTitle,
          { marginTop: 10, marginBottom: 10 },
        ]}
      >
        5. CIERRE DEL CASO
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Fecha de cierre (DD/MM/AAAA):{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar día, mes y año del cierre del caso.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Firma del Director de SMS:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar firma del Director de SMS.
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 34 }]}>
      <Text style={[styles.instructiveTitle, styles.boldTitle]}>
        • Firma del jefe del área responsable de la mitigación:{" "}
      </Text>
      <Text style={[styles.instructiveText]}>
        Colocar firma del jefe del área
      </Text>
    </View>

    <View style={[styles.instructiveContainer, { paddingLeft: 40 }]}>
      <Text style={[styles.instructiveText]}>
        responsable de la mitigación.
      </Text>
    </View>

    {Footer(6, 6)}
  </Page>
);

const SafetyRiskManagementPdf = (
  { report }: { report: VoluntaryReport },
  { identification }: { identification?: MitigationTable }
) => <Document></Document>;

const Header = () => (
  <View style={styles.tableRowHeader}>
    <View style={{ ...styles.tableCellHeader, width: "20%" }}>
      <Image src="/tmd_sms_header.jpg" style={styles.logo} />
    </View>
    <View style={styles.column2Header}>
      <View style={styles.rowColumnHeader}>
        <Text style={styles.cellTextHeader}>
          SISTEMA DE GESTION DE SEGURIDAD OPERACIONAL{"\n"}SMS
        </Text>
      </View>
      <View style={styles.rowColumnHeader}>
        <Text style={styles.cellTextHeader}>GESTION DE RIESGO</Text>
      </View>
    </View>
    <View style={styles.column3Header}>
      <View style={styles.rowColumnHeader}>
        <Text style={styles.cellTextHeader}>EDICION N: 01</Text>
      </View>
      <View style={styles.rowColumnHeader}>
        <Text style={styles.cellTextHeader}>FECHA EDICION{"\n"}12/10/2023</Text>
      </View>
      <View style={styles.rowColumnHeader}>
        <Text style={[styles.cellTextHeader, { paddingTop: 1 }]}>
          CODIGO:{"\n"}TMD-FOR-SMS-002
        </Text>
      </View>
    </View>
  </View>
);

const Footer = (currentPage: number, pageNumber: number) => (
  <View style={styles.footerContainer}>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, width: "67%" }}>
        <Text style={styles.cellText}>
          DEPENDENCIA: DIRECCION DE GESTION DE LA SEGURIDAD OPERACIONAL
          {"\n"}(SMS)
        </Text>
      </View>

      <View style={{ ...styles.tableCell, width: "20%" }}>
        <Text style={styles.cellText}>REVISION N: 0</Text>
      </View>
      <View style={{ ...styles.tableCell, width: "13%" }}>
        <Text style={styles.cellText}>SMS</Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText}>
          ELABORADO POR:{"\n"}
          ASISTENTE DE SMS{"\n"}
        </Text>
      </View>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText}>
          REVISADO POR:{"\n"}
          DIRECTOR DE SMS{"\n"}
        </Text>
      </View>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText}>
          APROBADO POR:{"\n"}
          DIRECTOR DE OPERACIONES{"\n"}
        </Text>
      </View>

      <View style={{ ...styles.tableCell, width: "13%" }}>
        <Text style={styles.cellText}>
          NRO. PAGINA{"\n"}
          {currentPage} DE {pageNumber}
        </Text>
      </View>
    </View>
  </View>
);

export default SafetyRiskManagementPdf;
