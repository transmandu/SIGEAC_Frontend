import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { MitigationTable, ObligatoryReport } from "@/types";
import { dateFormat, timeFormat } from "@/lib/utils";
import {
  FifthPage,
  FirstPage,
  FourthPage,
  SecondPage,
  ThirdPage,
} from "./SafetyRiskManagement";

const BLUE = "#d6eaf8";
const RED = "#fc0a0a";
const GREEN = "#0ebe36";
const WHITE = "#fff";

const LIST = [
  "La aereonave aterriza quedándose solo con el combustible de reserva o menos",
  "Incursion en pista o calle de rodaje (RUNAWAY INCURSION-RI)",
  "Aproximacion no estabilizada por debajo de los 500 pies VRF o 1000 PIES IRF",
  "Despresurizacion",
  "Salida de pista - RUNAWAY INCURSION",
  "Derrame de combustible",
  "Error  de navegacion con desviacion significativa de la ruta",
  "Casi colision (RESOLUCION ACVSORY-RA)",
  "Despegue abortado(REJETED TAKE OFF-RTO)",
  "Falla de motor",
  "Tail Strike",
  "Impacto con aves",
  "Aterrizaje fuerte (HARD LANDING)",
  "Alerta de fuego o humo",
  "Wind Shear",
  "El avion es evacuado",
  "Fallo en los controles de vuelo",
  "Parametros de vuelo anormales",
];

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
  cellTextIncident: {
    marginLeft: 5,
    fontSize: 8,
    textAlign: "left",
  },
  cellText2: {
    fontSize: 9,
  },

  tableIncidentCell: {
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1,
    borderRight: 1,
    borderColor: "#000",
    flexDirection: "row", // Añadimos flexDirection: 'row' para alinear el texto y el cuadro
  },

  checkbox: {
    width: 15,
    height: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginLeft: 5,
    justifyContent: "center", // Centrar la X verticalmente
    alignItems: "center", // Centrar la X horizontalmente
  },
  xMark: {
    fontSize: 8, // Ajusta el tamaño de la X
    color: "#000", // Color de la X (blanco si el fondo es negro)
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
    borderTop: 1,
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
    marginTop: 0,
  },

  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    width: "100%",
    marginBottom: 10,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Asegura que el texto y la línea estén en la misma línea
    marginBottom: 10,
  },
  title: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "black",
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

  // ESTILOS PARA LA FIRMA PAGINA 2 / 3
  signatureContainer: {
    width: "5.6cm", // Ancho de la línea
    alignSelf: "center", // Centrar horizontalmente
  },
  signatureLine: {
    marginTop: 254,
    borderBottom: 1, // Borde inferior para la línea
    marginBottom: 2, // Espacio entre la línea y "firma"
  },
  signatureText: {
    fontSize: 10, // Tamaño de letra 1
    textAlign: "center", // Centrar el texto
  },
  boldTitle: {
    fontFamily: "Helvetica-Bold",
  },
});

const Instructive = () => (
  <View>
    <View>
      <Text style={styles.underlinedTTitle}>INSTRUCTIVO DE LLENADO</Text>
    </View>
    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveTitle]}>
        • Fecha del reporte (DD/MM/AAAA):
      </Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar día, mes, año en que se realiza el reporte.
      </Text>
    </View>
    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>
        • Fecha del suceso (DD/MM/AAAA):
      </Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar día, mes, año en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>• Hora del suceso (HLV):</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar la hora en la que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>
        • Lugar donde ocurrió el suceso:{" "}
      </Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar el lugar donde ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>• N° de reporte:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar el número correlativo asignado al reporte por la Gerencia del
        SMS.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveText, styles.boldTitle]}>
        {" "}
        I. DATOS DE QUIEN REPORTA{" "}
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>• Nombres y Apellidos:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar nombres y apellidos de la persona que realiza el reporte.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>• N° de Licencia: </Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar número de licencia de la persona que realiza el reporte.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>
        • Vía de contacto (Teléfono/ Correo electrónico):
      </Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar el número telefónico y/o el correo
      </Text>
    </View>
    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveText, { paddingLeft: 8 }]}>
        electrónico de la persona que realiza el reporte.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>II. DATOS DE VUELO</Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Hora (HLV):</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar la hora real de despegue.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Matrícula: (HLV):</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar la matrícula de la aeronave en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • N° de vuelo:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar el número de vuelo en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Aeronave:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar modelo de la aeronave en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Origen:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar estación de origen del vuelo en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Destino:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar estación de destino del vuelo en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Alterno:</Text>
      <Text style={styles.instructiveText}>
        {" "}
        Colocar estación alterna del vuelo en que ocurrió el suceso.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>
        III. Sucesos de obligatorio reporte:{" "}
      </Text>
      <Text style={styles.instructiveText}>
        Marcar con una (X) el suceso obligatorio que se está
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveText, { paddingLeft: 12 }]}>
        reportando, en caso de no encontrarse dentro de las opciones, se deberá
        seleccionar el
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveText, { paddingLeft: 12 }]}>
        ítem “otro” y seguidamente especificar a qué suceso se refiere.
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}>IV. Descripción del suceso:</Text>
      <Text style={styles.instructiveText}>
        {""}
        Colocar una descripción de los hechos ocurridos del suceso que
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={[styles.instructiveText, { paddingLeft: 12 }]}>
        se está reportando.{" "}
      </Text>
    </View>

    <View style={styles.instructiveContainer}>
      <Text style={styles.instructiveTitle}> • Firma: </Text>
      <Text style={styles.instructiveText}>
        {""}
        Colocar firma de la persona que realiza el reporte.{" "}
      </Text>
    </View>
  </View>
);

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
          REPORTE OBLIGATORIO DE SUCESOS
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
        <Text style={styles.cellTextHeader}>CODIGO:{"\n"}TMD-FOR-SMS-003</Text>
      </View>
    </View>
  </View>
);

interface MyDocumentProps {
  report: ObligatoryReport;
  identification?: MitigationTable;
}

const ObligatoryReportPdf = ({ report, identification }: MyDocumentProps) => (
  <Document>
    <Page style={styles.page} size={"LETTER"}>
      <Header />

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>
            FECHA DEL{"\n"}REPORTE
          </Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>
            FECHA DEL{"\n"}SUCESO{" "}
          </Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>
            HORA DEL{"\n"}SUCESO
          </Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "40%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>
            LUGAR DONDE OCURRIO EL SUCESO
          </Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "15%", backgroundColor: BLUE }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>N DE REPORTE</Text>
        </View>
      </View>

      {/*FECHA DE REPORTE DEL SUCESO*/}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, width: "15%" }}>
          <Text style={styles.cellText}>
            {dateFormat(report.report_date, "dd-MM-yyyy")}
          </Text>
        </View>

        {/*FECHA DE IDENTIFICACION DEL SUCESO*/}

        <View style={{ ...styles.tableCell, width: "15%" }}>
          <Text style={styles.cellText}>
            {dateFormat(report.incident_date, "dd-MM-yyyy")}
          </Text>
        </View>

        {/*HORA DEL INCIDENTE*/}
        <View style={{ ...styles.tableCell, width: "15%" }}>
          <Text style={styles.cellText}>
            {timeFormat(report.incident_time)}
          </Text>
        </View>
        {/*LUGAR DEL SUCESO DEL REPORTE*/}
        <View style={{ ...styles.tableCell, width: "40%" }}>
          <Text style={styles.cellText}>{report.incident_location}</Text>
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
          <Text style={[styles.cellText, styles.boldTitle]}>
            I. DATOS DE QUIEN REPORTA
          </Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "35%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>NOMBRES Y APELLIDOS</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "20%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}> N DE LICENCIA</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "45%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>VIA DE CONTACTO</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "10%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>PILOTO</Text>
        </View>

        <View style={{ ...styles.tableCell, width: "25%" }}>
          <Text style={styles.cellText}>
            {report.pilot.first_name} {report.pilot.last_name}
          </Text>
        </View>

        <View style={{ ...styles.tableCell, width: "20%" }}>
          <Text style={styles.cellText}>{report.pilot.license_number}</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "22.5%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>TELEFONO</Text>
        </View>

        <View
          style={{ ...styles.tableCell, width: "22.5%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>CORREO ELECTRONICO</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "10%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>COPILOTO</Text>
        </View>

        <View style={{ ...styles.tableCell, width: "25%" }}>
          <Text style={styles.cellText}>
            {report.copilot.first_name} {report.copilot.last_name}
          </Text>
        </View>

        <View style={{ ...styles.tableCell, width: "20%" }}>
          <Text style={styles.cellText}>{report.copilot.license_number}</Text>
        </View>

        <View style={{ ...styles.tableCell, width: "22.5%" }}>
          <Text style={styles.cellText}>{report.pilot.phone}</Text>
        </View>

        <View style={{ ...styles.tableCell, width: "22.5%" }}>
          <Text style={styles.cellText}>{report.pilot.email}</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View
          style={{
            ...styles.tableCell,
            width: "100%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={[styles.cellText, styles.boldTitle]}>
            II. DATOS DEL VUELO
          </Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{ ...styles.tableCell, width: "10%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>HORA</Text>
        </View>
        <View
          style={{
            ...styles.tableCell,
            width: "23.33%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={styles.cellText}>MATRICULA</Text>
        </View>
        <View
          style={{
            ...styles.tableCell,
            width: "24.67%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={styles.cellText}>N DE VUELO</Text>
        </View>
        <View
          style={{ ...styles.tableCell, width: "42%", backgroundColor: BLUE }}
        >
          <Text style={styles.cellText}>AERONAVE</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, width: "10%" }}>
          <Text style={styles.cellText}>{timeFormat(report.flight_time)}</Text>
        </View>
        <View style={{ ...styles.tableCell, width: "23.33%" }}>
          <Text style={styles.cellText}>{report.aircraft.acronym}</Text>
        </View>
        <View style={{ ...styles.tableCell, width: "24.67%" }}>
          <Text style={styles.cellText}>{report.flight_number}</Text>
        </View>
        <View style={{ ...styles.tableCell, width: "42%" }}>
          <Text style={styles.cellText}>{report.aircraft.model}</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{
            ...styles.tableCell,
            width: "33.33%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={styles.cellText}>ORIGEN</Text>
        </View>
        <View
          style={{
            ...styles.tableCell,
            width: "33.33%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={styles.cellText}>DESTINO</Text>
        </View>
        <View
          style={{
            ...styles.tableCell,
            width: "33.33%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={styles.cellText}>ALTERNO</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, width: "33.33%" }}>
          <Text style={styles.cellText}>{report.flight_origin}</Text>
        </View>
        <View style={{ ...styles.tableCell, width: "33.33%" }}>
          <Text style={styles.cellText}>{report.flight_destiny}</Text>
        </View>
        <View style={{ ...styles.tableCell, width: "33.33%" }}>
          <Text style={styles.cellText}>{report.flight_alt_destiny}</Text>
        </View>
      </View>

      <View style={styles.tableRow}>
        <View
          style={{
            ...styles.tableCell,
            width: "100%",
            backgroundColor: BLUE,
          }}
        >
          <Text style={[styles.cellText2, styles.boldTitle]}>
            III. SUCESOS DE OBLIGATORIO REPORTE
          </Text>
        </View>
      </View>

      {/* PRIMERA FILA DE INCIDENTES */}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableIncidentCell, width: "26%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            LA AERONAVE ATERRIZA{"\n"}QUEDÁNDOSE SOLO{"\n"}CON EL{"\n"}
            COMBUSTIBLE DE{"\n"}RESERVA O MENOS{"\n"}{" "}
          </Text>

          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes(
                "La aereonave aterriza quedándose solo con el combustible de reserva o menos"
              )
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "20%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}SALIDA DE{"\n"}PISTA{"\n"}(RUNAWAY{"\n"}INCURSION){"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Salida de pista - RUNAWAY INCURSION")
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}DESPEGUE{"\n"}ABORTADO{"\n"}(REJETED{"\n"}TAKE OFF-{"\n"}RTO)
            {"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {" "}
              <Text style={styles.xMark}>
                {report.incidents.includes(
                  "Despegue abortado(REJETED TAKE OFF-RTO)"
                )
                  ? "X"
                  : ""}
              </Text>
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            ATERRIZAJE{"\n"}FUERTE(HARD{"\n"}LANDING){"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Aterrizaje fuerte (HARD LANDING)")
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}EL AVION ES{"\n"}EVACUADO{"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("El avion es evacuado") ? "X" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* SEGUNDA FILA DE INCIDENTES


        "INCURSION EN PISTA O CALLE DE RODAJE ( RUNAWAY INCURSION-RI)",
        "DERRAME DE COMBUSTIBLE",
        "FALLA DE MOTOR",
        "ALERTA DE FUEGO O HUMO",
        "FALLO EN LOS CONTROLES DE VUELO",
      */}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableIncidentCell, width: "26%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            INCURSION EN PISTA{"\n"}O CALLE DE RODAJE{"\n"}( RUNAWAY INCURSION-
            {"\n"}RI){"\n"}{" "}
          </Text>

          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes(
                "Incursion en pista o calle de rodaje (RUNAWAY INCURSION-RI)"
              )
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "20%" }}>
          <Text style={styles.cellTextIncident}>
            {" "}
            DERRAME DE{"\n"}COMBUSTIBLE
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Derrame de combustible") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}> FALLA DE{"\n"}UN MOTOR</Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Falla de motor") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            ALERTA DE{"\n"}FUEGO O(HARD{"\n"}HUMO{"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Alerta de fuego o humo") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            FALLO DE{"\n"}CONTROLES{"\n"}DE VUELO{"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Fallo en los controles de vuelo")
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* TERCERA FILA DE INCIDENTES



         "APROXIMACION NO ESTABILIZADA POR DEBAJO DE LOS 500 PIES VRF O 1000 PIES IRF",
  "ERROR  DE NAVEGACION CON DESVIACION SIGNIFICATIVA DE LA RUTA",
  "TAIL STRIKE",
  "WIND SHEAR",
  "PARAMETROS DE VUELO ANORMALES",

  */}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableIncidentCell, width: "26%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            APROXIMACION NO{"\n"}ESTABILIZADA POR{"\n"}DEBAJO DE LOS 500{"\n"}
            PIES VRF O 1000 PIES{"\n"}IRF{"\n"}{" "}
          </Text>

          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes(
                "Aproximacion no estabilizada por debajo de los 500 pies VRF o 1000 PIES IRF"
              )
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "20%" }}>
          <Text style={styles.cellTextIncident}>
            {"\n"}
            ERROR DE{"\n"}NAVEGACION{"\n"}CON{"\n"}DESVIACION{"\n"}SIGNIFICATIVA
            {"\n"}DE LA RUTA.{"\n"}{" "}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes(
                "Error  de navegacion con desviacion significativa de la ruta"
              )
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>TAIL STRIKE</Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Tail Strike") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>WIND SHEAR</Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Wind Shear") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>
            PARAMETROS{"\n"}DE VUELO{"\n"}ANORMALES
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Parametros de vuelo anormales")
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* CUARTA FILA DE INCIDENTES*/}

      <View style={styles.tableRow}>
        <View style={{ ...styles.tableIncidentCell, width: "26%" }}>
          <Text style={styles.cellTextIncident}>DESPRESURIZACION</Text>

          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Despresurizacion") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "20%" }}>
          <Text style={styles.cellTextIncident}>
            {"CASI COLISION\n(RESOLUCION\nACVESORY -\nA) DE LA RUTA."}
          </Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes(
                "Casi colision (RESOLUCION ACVSORY-RA)"
              )
                ? "X"
                : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "18%" }}>
          <Text style={styles.cellTextIncident}>IMPACTO{"\n"}CON AVES</Text>
          <View style={styles.checkbox}>
            <Text style={styles.xMark}>
              {report.incidents.includes("Impacto con aves") ? "X" : ""}
            </Text>
          </View>
        </View>
        <View style={{ ...styles.tableIncidentCell, width: "36%" }}>
          <Text style={[styles.cellTextIncident, { marginLeft: 60 }]}>
            OTRO
          </Text>
          <View style={[styles.checkbox, { marginRight: 60 }]}>
            <Text style={styles.xMark}>
              {report.other_incidents ? "X" : ""}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.observationContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, styles.boldTitle, { marginTop: 5 }]}>
            EN CASO DE HABER SELECCIONADO EL ITEM `OTRO`, POR FAVOR, ESPECIFIQUE
            A CONTINUACION, A QUE TIPO DE{"\n"}SUCESO SE REFIERE:
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            top: 30,
            left: 5,
            right: 5,
            lineHeight: 1,
          }}
        >
          <Text style={styles.cellText}>{report.other_incidents}</Text>
        </View>

        {/* Líneas adicionales con interlineado de 1.5 */}
        <View style={styles.linesContainer}>
          {[...Array(3)].map((_, index) => (
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
          }}
        >
          <Text style={[styles.cellText2, styles.boldTitle]}>
            IV. DESCRIPCION DEL SUCESO
          </Text>
        </View>
      </View>

      <View style={styles.observationContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { marginTop: 10 }]}>
            A continuación, describa claramente el suceso que esta reportando:
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            top: 25,
            left: 5,
            right: 5,
            lineHeight: 0.6,
          }}
        >
          <Text style={styles.cellText2}>{report.description}</Text>
        </View>
        {/* Líneas adicionales con interlineado de 1.5 */}
        <View style={styles.linesContainer}>
          {[...Array(15)].map((_, index) => (
            <View key={index} style={styles.line} />
          ))}
        </View>
      </View>

      <View style={styles.signatureContainer}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>FIRMA</Text>
      </View>
      {Footer(2, 3)}
    </Page>

    <Page size={"LETTER"} style={styles.page}>
      <Header />
      <Instructive />
      {Footer(3, 3)}
    </Page>

    {report && identification && (
      <>
        <FirstPage
          reportDate={report.report_date}
          identificationDate={report.incident_date}
          reportNumber={report.report_number}
          reportType="ROS"
          identification={identification}
        />
        <SecondPage identification={identification} />
        <ThirdPage identification={identification} />
        <FourthPage />
        <FifthPage />
      </>
    )}
  </Document>
);

export default ObligatoryReportPdf;
