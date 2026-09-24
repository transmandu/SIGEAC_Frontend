import { GeneralStats } from "@/types";
import { format, parseISO } from "date-fns";
import {
  Document,
  Image as PDFImage,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export interface PieLegendRow {
  name: string;
  value: number;
  color: string;
}

export interface StatsRow {
  label: string;
  value: number;
}

export interface PdfStatisticsChart {
  id: string;
  label: string;
  image: string;
  imageSize: { width: number; height: number };
  stats?: GeneralStats;
  statsRows?: StatsRow[];
  legend?: PieLegendRow[];
}

interface StatisticsReportPdfProps {
  company: string;
  from: string;
  to: string;
  charts: PdfStatisticsChart[];
}

const LETTER_WIDTH = 612; // pt (tamaño LETTER)
const PAGE_PADDING = 30;
const CONTENT_WIDTH = LETTER_WIDTH - PAGE_PADDING * 2;
const MAX_IMAGE_HEIGHT = 460;

const styles = StyleSheet.create({
  page: {
    padding: PAGE_PADDING,
    backgroundColor: "#ffffff",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 12,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 58,
    marginRight: 14,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 9,
    color: "#475569",
    textAlign: "center",
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#1e293b",
    marginBottom: 8,
  },
  chartImage: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    overflow: "hidden",
  },
  tr: {
    flexDirection: "row",
  },
  th: {
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#eef2f7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 9,
  },
  td: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 9,
  },
  num: {
    textAlign: "right",
  },
  colConcept: {
    width: "52%",
  },
  colNum: {
    width: "24%",
  },
  colPct: {
    width: "24%",
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 2,
    marginRight: 6,
  },
  legendName: {
    flexDirection: "row",
    alignItems: "center",
    width: "52%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    paddingTop: 6,
  },
});

const percent = (value: number, total: number) =>
  total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";

const StatsTable = ({
  stats,
  rows,
}: {
  stats: GeneralStats;
  rows?: StatsRow[];
}) => {
  const data =
    rows && rows.length > 0
      ? rows
      : [
          { label: "Identificados", value: stats.open },
          { label: "Gestionados", value: stats.closed },
          { label: "Total", value: stats.total },
        ];
  return (
    <View style={styles.table}>
      <View
        style={[
          styles.tr,
          { borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
        ]}
      >
        <Text style={[styles.colConcept, styles.th]}>Concepto</Text>
        <Text style={[styles.colNum, styles.th, styles.num]}>Total</Text>
        <Text style={[styles.colPct, styles.th, styles.num]}>%</Text>
      </View>
      {data.map((row) => (
        <View key={row.label} style={styles.tr}>
          <Text style={[styles.colConcept, styles.td]}>{row.label}</Text>
          <Text style={[styles.colNum, styles.td, styles.num]}>
            {row.value.toLocaleString("es-ES")}
          </Text>
          <Text style={[styles.colPct, styles.td, styles.num]}>
            {percent(row.value, stats.total)}%
          </Text>
        </View>
      ))}
    </View>
  );
};

const LegendTable = ({ rows }: { rows: PieLegendRow[] }) => {
  const total = rows.reduce((acc, row) => acc + (Number(row.value) || 0), 0);
  return (
    <View style={styles.table}>
      <View
        style={[
          styles.tr,
          { borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
        ]}
      >
        <Text style={[styles.colConcept, styles.th]}>Porción</Text>
        <Text style={[styles.colNum, styles.th, styles.num]}>Cantidad</Text>
        <Text style={[styles.colPct, styles.th, styles.num]}>%</Text>
      </View>
      {rows.map((row) => (
        <View key={row.name} style={styles.tr}>
          <View style={[styles.td, styles.legendName]}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: row.color || "#94a3b8" },
              ]}
            />
            <Text>{row.name}</Text>
          </View>
          <Text style={[styles.colNum, styles.td, styles.num]}>
            {row.value.toLocaleString("es-ES")}
          </Text>
          <Text style={[styles.colPct, styles.td, styles.num]}>
            {percent(Number(row.value) || 0, total)}%
          </Text>
        </View>
      ))}
    </View>
  );
};

const Header = ({
  company,
  from,
  to,
}: {
  company: string;
  from: string;
  to: string;
}) => {
  const period = `${format(parseISO(from), "dd/MM/yyyy")} - ${format(
    parseISO(to),
    "dd/MM/yyyy",
  )}`;
  return (
    <View style={styles.header}>
      <PDFImage src="/logo.png" style={styles.logo} />
      <View style={styles.headerTexts}>
        <Text style={styles.title}>REPORTE ESTADÍSTICO SMS</Text>
        <Text style={styles.subtitle}>Empresa: {company}</Text>
        <Text style={styles.subtitle}>Periodo consultado: {period}</Text>
      </View>
    </View>
  );
};

const StatisticsReportPdf = ({
  company,
  from,
  to,
  charts,
}: StatisticsReportPdfProps) => {
  return (
    <Document>
      {charts.map((chart, index) => {
        const imageHeight = Math.min(
          MAX_IMAGE_HEIGHT,
          CONTENT_WIDTH * (chart.imageSize.height / chart.imageSize.width),
        );
        return (
          <Page key={`${chart.id}-${index}`} size="LETTER" style={styles.page}>
            <Header company={company} from={from} to={to} />

            <Text style={styles.sectionTitle}>{chart.label}</Text>
            <PDFImage
              src={chart.image}
              style={[styles.chartImage, { height: imageHeight }]}
            />
            {chart.stats && (
              <StatsTable stats={chart.stats} rows={chart.statsRows} />
            )}
            {chart.legend && <LegendTable rows={chart.legend} />}

            <View style={styles.footer} fixed>
              <Text style={styles.subtitle}>
                Generado el {format(new Date(), "dd/MM/yyyy HH:mm")}
              </Text>
              <Text style={styles.subtitle}>
                Página {index + 1} de {charts.length}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default StatisticsReportPdf;
