import { dateFormat } from "@/lib/utils";
import { MitigationTable, VoluntaryReport } from "@/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  FifthPage,
  FirstPage,
  FourthPage,
  SecondPage,
  SixthPage,
  ThirdPage,
} from "./SafetyRiskManagement";

const BLUE = "#d6eaf8";
const WHITE = "#fff";

const styles = StyleSheet.create({
  logo: {
    width: 102,
    height: 43,
    position: "relative",
  },
  page: {
    padding: 30,
    backgroundColor: "#FFF",
  },
  tableRow: {
    flexDirection: "row",
    textAlign: "center",
    borderTop: 1,
    borderLeft: 1,
    alignContent: "stretch",
    alignItems: "stretch",
  },
  tableCell: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    borderRight: 1,
    borderColor: "#000", // Establecemos el color del borde
  },
  cellText: {
    fontSize: 8,
  },
  cellText2: {
    fontSize: 9,
  },
  cellText3: {
    fontSize: 10,
  },
  areaContainer: {
    flexDirection: "row",
    height: "8%",
    borderTop: 1,
  },
  areaLeftColumn: {
    width: "15%",
  },
  areaRightColumns: {
    width: "85%",
    flexDirection: "column",
  },
  areaRow: {
    flexDirection: "row",
    flex: 1,
  },
  areaSubCell: {
    flex: 1,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRight: 1,
    borderBottom: 1,
    borderColor: "#000",
    backgroundColor: BLUE,
  },
  // Nuevo estilo para celdas con X
  xCell: {
    width: "5%", // Ancho fijo pequeño para celdas con X
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRight: 1,
    borderBottom: 1,
    borderColor: "#000",
    backgroundColor: WHITE,
  },
  // Estilo para celdas de texto (más anchas)
  textCell: {
    width: "45%", // Ajusta este valor según necesites
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRight: 1,
    borderBottom: 1,
    borderColor: "#000",
    backgroundColor: BLUE,
  },

  observationContainer: {
    borderRight: 1,
    borderLeft: 1,
    padding: 5,
    minHeight: 50,
    borderBottom: 1,
    //FALTA POSIBLE LINEA INFERIOR
  },

  observationText: {
    fontSize: 8,
    margin: 5,
  },

  firstLine: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginLeft: 5, // Espacio entre el texto y la primera línea
  },
  linesContainer: {
    marginTop: 5,
  },

  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    width: "100%",
    marginBottom: 18,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Asegura que el texto y la línea estén en la misma línea
    marginBottom: 10,
  },
  title: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  footerContainer: {
    position: "absolute",
    bottom: 35,
    left: 30,
    right: 30,
    borderBottom: 1,
    borderColor: "#000",
  },

  blackText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textAlign: "center",
  },

  // ESTILOS PARA EL HEADER DE LA PAGINA
  tableRowHeader: {
    flexDirection: "row",
    marginTop: 40,
    marginBottom: 20,
  },
  tableCellHeader: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
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

  // ESTILOS PARA EL INSTRUTIVO DE COMO LLENAR EL REPORTE PAGINA 2 / 2

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
    fontFamily: "Helvetica",
    fontWeight: "bold",
    lineHeight: 1.15,
  },
  underlinedTTitle: {
    fontFamily: "Helvetica",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    textDecoration: "underline",
    marginVertical: 20,
  },
  boldTitle: {
    fontFamily: "Helvetica-Bold",
  },
});

const Footer = (currentPage: number, pageNumber: number) => (
  <View style={styles.footerContainer}>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, width: "67%" }}>
        <Text style={styles.cellText2}>
          DEPENDENCIA: DIRECCION DE GESTION DE LA SEGURIDAD OPERACIONAL
          {"\n"}(SMS)
        </Text>
      </View>
      <View style={{ ...styles.tableCell, width: "20%" }}>
        <Text style={styles.cellText2}>REVISION N:00</Text>
      </View>
      <View style={{ ...styles.tableCell, width: "13%" }}>
        <Text style={styles.cellText2}>SMS</Text>
      </View>
    </View>

    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText2}>
          ELABORADO POR:{"\n"}ASISTENTE DE SMS
        </Text>
      </View>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText2}>REVISADO POR:{"\n"}DIRECTOR DE SMS</Text>
      </View>
      <View style={{ ...styles.tableCell, width: "29%" }}>
        <Text style={styles.cellText2}>
          APROBADO POR:{"\n"}DIRECTOR DE OPERACIONES
        </Text>
      </View>

      <View style={{ ...styles.tableCell, width: "13%" }}>
        <Text style={styles.cellText2}>
          NRO. PAGINA{"\n"}
          {currentPage} DE {pageNumber}
        </Text>
      </View>
    </View>
  </View>
);

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
        <Text style={styles.cellTextHeader}>
          REPORTE VOLUNTARIO DE PELIGROS
        </Text>
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

interface MyDocumentProps {
report: VoluntaryReport;
identification?: MitigationTable;
}

const MyDocument = ({ report, identification }: MyDocumentProps) => (
  <Document>
    <Page style={styles.page} size={"LETTER"}>
      <Header />

      <Text style={[styles.blackText, { width: "100%" }]}>
        <Text style={[styles.blackText]}>
          <Text style={{ textDecoration: "underline" }}>IMPORTANTE </Text>
        </Text>
        : EL REPORTE VOLUNTARIO DE
      </Text>
      <Text style={[styles.blackText]}>
        PELIGRO PUEDE SER ANONIMO, ES CONFIDENCIAL Y NO PUNITIVO.
      </Text>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>FECHA DEL{"\n"}REPORTE</Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "20%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>
            FECHA EN QUE SE{"\n"}IDENTIFICO EL PELIGRO{" "}
          </Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>
            LUGAR DONDE SE IDENTIFICO EL PELIGRO
          </Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>N DE REPORTE</Text>
        </View>
      </View>
      {/*FECHA DEL REPORTE*/}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, width: "15%" }}>
          <Text style={styles.cellText}>
            {dateFormat(report.report_date, "dd-MM-yyyy")}
          </Text>
        </View>

        {/*FECHA DE IDENTIFICACION DEL REPORTE*/}

        <View style={{ ...styles.tableCell, width: "20%" }}>
          <Text style={styles.cellText}>
            {dateFormat(report.identification_date, "dd-MM-yyyy")}
          </Text>
        </View>

        {/*LOCALIZACION DEL REPORTE*/}
        <View style={{ ...styles.tableCell, width: "50%" }}>
          <Text style={styles.cellText}>{report.airport_location}</Text>
        </View>

        {/*NUMERO DE REPORTE*/}
        <View style={{ ...styles.tableCell, width: "15%" }}>
          <Text style={styles.cellText}>{report.report_number}</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "100%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText2, styles.boldTitle]}>
            I. DATOS DE QUIEN REPORTA
          </Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>NOMBRES (OPCIONAL)</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>APELLIDOS (OPCIONAL)</Text>
        </View>
      </View>

      {/*NOMBRE DE QUIEN REPORTA*/}
      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: WHITE }}
        >
          <Text style={styles.cellText}>{report.reporter_name ?? "N/A"}</Text>
        </View>
        {/*APELLIDO DE QUIEN REPORTA*/}
        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: WHITE }}
        >
          <Text style={styles.cellText}>
            {report.reporter_last_name ?? "N/A"}
          </Text>
        </View>
      </View>
      {/*APELLIDO DE QUIEN REPORTA*/}
      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>TELEFONO (OPCIONAL)</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>CORREO ELECTRONICO (OPCIONAL)</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        {/*NUMERO DE TELEFONO DE QUIEN REPORTA*/}

        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: WHITE }}
        >
          <Text style={styles.cellText}>{report.reporter_phone ?? "N/A"}</Text>
        </View>
        {/*CORREO ELECTRONICO DE QUIEN REPORTA*/}

        <View
          style={{ ...styles.tableCell, width: "50%", backgroundColor: WHITE }}
        >
          <Text style={styles.cellText}>{report.reporter_email ?? "N/A"}</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "100%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText2, styles.boldTitle]}>
            II. PELIGRO IDENTIFICADO
          </Text>
        </View>
      </View>

      <View style={styles.areaContainer}>
        <View
          style={[
            styles.tableCell,
            styles.areaLeftColumn,
            {
              backgroundColor: BLUE,
              height: "100%",
              borderLeft: 1,
              borderBottom: 1,
            },
          ]}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>AREA AFECTADA</Text>
        </View>

        <View style={styles.areaRightColumns}>
          <View style={styles.areaRow}>
            <View style={styles.textCell}>
              <Text style={styles.cellText}>OPERACIONES</Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {" "}
                {report.danger_area === "OPERACIONES" ? "X" : ""}
              </Text>
            </View>
            <View style={styles.textCell}>
              <Text style={styles.cellText}>MANTENIMIENTO</Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {report.danger_area === "MANTENIMIENTO" ? "X" : ""}
              </Text>
            </View>
          </View>

          <View style={styles.areaRow}>
            <View style={styles.textCell}>
              <Text style={styles.cellText}>
                ADMINISTRACION Y RECURSOS HUMANOS
              </Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {report.danger_area === "ADMINISTRACION" ? "X" : ""}
              </Text>
            </View>

            <View style={styles.textCell}>
              <Text style={styles.cellText}>
                CONTROL Y ASEGURAMIENTO DE LA CALIDAD
              </Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {report.danger_area === "CONTROL_CALIDAD" ? "X" : ""}
              </Text>
            </View>
          </View>

          <View style={styles.areaRow}>
            <View style={styles.textCell}>
              <Text style={styles.cellText}>INFORMATICA Y TECNOLOGIA</Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {" "}
                {report.danger_area === "INFORMATICA_TECNOLOGIA" ? "X" : ""}
              </Text>
            </View>
            <View style={styles.textCell}>
              <Text style={styles.cellText}>AVSEC</Text>
            </View>
            <View style={styles.xCell}>
              <Text style={styles.cellText}>
                {report.danger_area === "AVSEC" ? "X" : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.observationContainer}>
        <View
          style={{
            position: "absolute",
            top: 25,
            left: 5,
            right: 5,
            lineHeight: 1,
          }}
        >
          <Text style={styles.cellText3}>{report.description}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            A continuación, describa claramente el peligro que esta reportando:
          </Text>
        </View>

        {/* Líneas adicionales con interlineado de 1.5 */}
        <View style={styles.linesContainer}>
          {[...Array(15)].map((_, index) => (
            <View key={index} style={styles.line} />
          ))}
        </View>
      </View>

      {Footer(1, 2)}
    </Page>

    <Page size={"LETTER"} style={styles.page}>
      <Header />

      <View style={styles.tableRow}>
        <View
          style={{
            ...styles.tableCell,
            width: "100%",
            backgroundColor: BLUE,
            borderBottom: 1,
          }}
        >
          <Text style={[styles.cellText2, styles.boldTitle]}>
            III. RIESGOS (CONSECUENCIAS)
          </Text>
        </View>
      </View>
      <View style={styles.observationContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            A continuación, describa las consecuencias de ese peligro:
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 25,
            left: 5,
            right: 5,
            lineHeight: 1.1,
          }}
        >
          <Text style={styles.cellText3}>{report.possible_consequences}</Text>
        </View>
        <View style={styles.linesContainer}>
          {[...Array(7)].map((_, index) => (
            <View key={index} style={styles.line} />
          ))}
        </View>
      </View>

      <View>
        <Text style={[styles.underlinedTTitle, styles.boldTitle]}>
          INSTRUCTIVO DE LLENADO
        </Text>
      </View>
      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Fecha del reporte (DD/MM/AAAA):
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar día, mes, año en que se realiza el reporte.
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Fecha en que se identificó el peligro (DD/MM/AAAA):
        </Text>
        <Text style={styles.instructiveText}>
          Colocar día, mes, año en que se
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveText, { paddingLeft: 8 }]}>
          identificó el peligro.
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Lugar donde se identificó el peligro:{" "}
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar el lugar donde se identificó el peligro que se{" "}
        </Text>
      </View>
      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveText, { paddingLeft: 8 }]}>
          esta reportando
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • N° de reporte:
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar el número correlativo asignado al reporte por la Gerencia del
          SMS
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text
          style={[
            styles.instructiveTitle,
            styles.boldTitle,
            { marginBottom: 5 },
          ]}
        >
          I. DATOS DE QUIEN REPORTA{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Nombres (opcional):{" "}
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar nombres de la persona que realiza el reporte, si así lo desea.
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Apellido (opcional):{" "}
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar apellidos de la persona que realiza el reporte, si así lo
          desea.{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Teléfono (opcional):{" "}
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar el número telefónico de la persona que realiza el reporte, si{" "}
        </Text>
      </View>
      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveText, { paddingLeft: 8 }]}>
          asi lo desea
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Correo electrónico (opcional)
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar el correo electrónico de la persona que realiza el{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          II. PELIGRO IDENTIFICADO:
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar la descripción detallada y clara del peligro observado.{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          • Área afectada:
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Seleccionar con una (X) las áreas afectadas por el peligro que se
          identificó.{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveTitle, styles.boldTitle]}>
          III. RIESGOS (CONSECUENCIA):
        </Text>
        <Text style={styles.instructiveText}>
          {" "}
          Colocar la descripción detallada y clara de las{" "}
        </Text>
      </View>

      <View style={styles.instructiveContainer}>
        <Text style={[styles.instructiveText, { paddingLeft: 14 }]}>
          consecuencias de este peligro
        </Text>
      </View>

      {Footer(2, 2)}
    </Page>
    {report && identification && (
      <>
        <FirstPage
          reportDate={report.report_date}
          identificationDate={report.identification_date}
          reportNumber={report.report_number}
          reportType="RVP"
          identification={identification}
        />
        <SecondPage identification={identification} />
        <ThirdPage identification={identification} />
        <FourthPage />
        <FifthPage />
        <SixthPage />
      </>
    )}
  </Document>
);

export default MyDocument;
