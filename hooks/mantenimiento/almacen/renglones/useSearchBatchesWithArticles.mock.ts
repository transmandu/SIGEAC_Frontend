import { useQuery } from "@tanstack/react-query";
import { BatchWithArticles } from "./useSearchBatchesWithArticles";

// Datos mock para la vista organizada de batches con artículos
const mockBatchesWithArticles: BatchWithArticles[] = [
  {
    batch: {
      id: 1,
      name: "TORNILLOS Y PERNOS",
      slug: "tornillos-y-pernos",
      description: "Batch de tornillos varios para mantenimiento",
      category: "FASTENERS",
      ata_code: "25-21-00",
      brand: "Generic",
      warehouse_name: "Hangar 74",
      warehouse_id: 1,
      min_quantity: 10,
      medition_unit: "UNIDADES"
    },
    articles: [
      {
        id: 1,
        part_number: "65-50587-4",
        alternative_part_number: ["ALT-65587", "BOEING-65587"],
        description: "TORNILLO SIN FIN FLAP #8 YV658T",
        serial: "SN123456789",
        quantity: 5,
        zone: "Almacén General",
        condition: "NUEVO",
        manufacturer: "Boeing",
        unit_secondary: "UNIDADES",
        status: "DISPONIBLE",
        cost: 25.50,
        image: "/images/tornillo-sin-fin.jpg",
        certificates: ["CERT-001.pdf", "CERT-002.pdf"],
        article_type: "CONSUMABLE",
        consumable: {
          article_id: 1,
          is_managed: true,
          convertions: [
            {
              id: 1,
              secondary_unit: "CAJAS",
              convertion_rate: 100,
              quantity_unit: 100,
              unit: {
                label: "Cajas",
                value: "CAJAS"
              }
            }
          ],
          shell_time: {
            caducate_date: new Date("2025-12-31"),
            fabrication_date: new Date("2024-01-15"),
            consumable_id: "CONS-001"
          }
        }
      },
      {
        id: 4,
        part_number: "BOLT-M8-25",
        alternative_part_number: ["M8-25", "METRIC-BOLT"],
        description: "PERNO MÉTRICO M8x25mm",
        serial: "BOLT789123",
        quantity: 25,
        zone: "Estantería B-2",
        condition: "NUEVO",
        manufacturer: "Standard Parts",
        unit_secondary: "UNIDADES",
        status: "DISPONIBLE",
        cost: 1.25,
        article_type: "CONSUMABLE",
        consumable: {
          article_id: 4,
          is_managed: false,
          convertions: [],
          shell_time: {
            caducate_date: new Date("2026-08-15"),
            fabrication_date: new Date("2024-02-20"),
            consumable_id: "CONS-004"
          }
        }
      }
    ]
  },
  {
    batch: {
      id: 2,
      name: "REMACHES ESTÁNDAR",
      slug: "remaches-estandar",
      description: "Colección de remaches para estructuras",
      category: "FASTENERS",
      ata_code: "25-22-00",
      brand: "Aerospace Standard",
      warehouse_name: "Almacén Central",
      warehouse_id: 2,
      min_quantity: 50,
      medition_unit: "UNIDADES"
    },
    articles: [
      {
        id: 2,
        part_number: "MS20470AD4-8",
        alternative_part_number: ["MS20470", "RIVETS-MS20470"],
        description: "REMACHE CABEZA AVELLANADA 4-8",
        serial: "SN987654321",
        quantity: 150,
        zone: "Estantería A-5",
        condition: "NUEVO",
        manufacturer: "Standard Parts",
        unit_secondary: "UNIDADES",
        status: "DISPONIBLE",
        cost: 0.85,
        article_type: "CONSUMABLE",
        consumable: {
          article_id: 2,
          is_managed: true,
          convertions: [
            {
              id: 2,
              secondary_unit: "BOLSAS",
              convertion_rate: 50,
              quantity_unit: 50,
              unit: {
                label: "Bolsas",
                value: "BOLSAS"
              }
            }
          ],
          shell_time: {
            caducate_date: new Date("2026-06-30"),
            fabrication_date: new Date("2024-03-10"),
            consumable_id: "CONS-002"
          }
        }
      }
    ]
  },
  {
    batch: {
      id: 3,
      name: "HERRAMIENTAS DE PRECISIÓN",
      slug: "herramientas-precision",
      description: "Herramientas especializadas para mantenimiento",
      category: "TOOLS",
      ata_code: "32-41-00",
      brand: "Professional Tools",
      warehouse_name: "Taller Mecánico",
      warehouse_id: 3,
      min_quantity: 1,
      medition_unit: "UNIDADES"
    },
    articles: [
      {
        id: 3,
        part_number: "TOOL-456",
        alternative_part_number: ["WRENCH-456", "BOEING-WRENCH"],
        description: "LLAVE DINAMOMÉTRICA 1/4\" DRIVE",
        serial: "TOOL456789",
        quantity: 1,
        zone: "Caja de Herramientas #3",
        condition: "USADO",
        manufacturer: "Snap-On",
        unit_secondary: "UNIDADES",
        status: "EN_USO",
        cost: 245.00,
        article_type: "TOOL",
        tool: {
          id: 1,
          serial: "TOOL456789",
          isSpecial: true,
          article_id: 3
        }
      }
    ]
  },
  {
    batch: {
      id: 4,
      name: "COMPONENTES ELECTRÓNICOS",
      slug: "componentes-electronicos",
      description: "Componentes críticos para sistemas aviónicos",
      category: "ELECTRONICS",
      ata_code: "23-11-00",
      brand: "Avionics Corp",
      warehouse_name: "Almacén Seguro",
      warehouse_id: 4,
      min_quantity: 2,
      medition_unit: "UNIDADES"
    },
    articles: [
      {
        id: 5,
        part_number: "COMP-789",
        alternative_part_number: ["AVIONICS-789", "ELECT-COMP"],
        description: "MÓDULO DE CONTROL PRINCIPAL",
        serial: "COMP789456",
        quantity: 3,
        zone: "Área Controlada Z-1",
        condition: "NUEVO",
        manufacturer: "Honeywell",
        unit_secondary: "UNIDADES",
        status: "DISPONIBLE",
        cost: 1250.00,
        article_type: "COMPONENT",
        component: {
          serial: "COMP789456",
          hard_time: {
            hour_date: "2027-01-15",
            cycle_date: "2026-12-31",
            calendary_date: "2026-06-30"
          },
          shell_time: {
            caducate_date: "2025-12-31",
            fabrication_date: "2024-06-15"
          }
        }
      }
    ]
  }
];

const searchBatchesWithArticlesMock = async (
  company: string,
  location_id: string,
  part_number: string
): Promise<BatchWithArticles[]> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Filtrar batches que contengan artículos que coincidan con la búsqueda
  return mockBatchesWithArticles.filter(batchData => {
    const hasMatchingArticles = batchData.articles.some(article =>
      article.part_number.toLowerCase().includes(part_number.toLowerCase()) ||
      article.alternative_part_number.some(alt => 
        alt.toLowerCase().includes(part_number.toLowerCase())
      ) ||
      article.description.toLowerCase().includes(part_number.toLowerCase())
    );
    
    if (hasMatchingArticles) {
      // Filtrar solo los artículos que coinciden dentro del batch
      batchData.articles = batchData.articles.filter(article =>
        article.part_number.toLowerCase().includes(part_number.toLowerCase()) ||
        article.alternative_part_number.some(alt => 
          alt.toLowerCase().includes(part_number.toLowerCase())
        ) ||
        article.description.toLowerCase().includes(part_number.toLowerCase())
      );
    }
    
    return hasMatchingArticles;
  });
};

export const useSearchBatchesWithArticlesMock = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<BatchWithArticles[], Error>({
    queryKey: ["search-batches-with-articles-mock", company, location_id, part_number],
    queryFn: () => searchBatchesWithArticlesMock(company!, location_id!, part_number!),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
