import { useQuery } from "@tanstack/react-query";
import { ArticleSearchResult } from "./useSearchArticlesByPartNumber";

// Datos mock para la búsqueda de artículos
const mockArticles: ArticleSearchResult[] = [
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
    
    // Información del batch donde está el artículo
    batch_info: {
      id: 1,
      name: "TORNILLOS Y PERNOS",
      slug: "tornillos-y-pernos",
      category: "FASTENERS",
      warehouse_name: "Hangar 74"
    },
    
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
    
    batch_info: {
      id: 2,
      name: "REMACHES ESTÁNDAR",
      slug: "remaches-estandar",
      category: "FASTENERS",
      warehouse_name: "Almacén Central"
    },
    
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
  },
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
    
    batch_info: {
      id: 3,
      name: "HERRAMIENTAS DE PRECISIÓN",
      slug: "herramientas-precision",
      category: "TOOLS",
      warehouse_name: "Taller Mecánico"
    },
    
    tool: {
      id: 1,
      serial: "TOOL456789",
      isSpecial: true,
      article_id: 3
    }
  }
];

const searchArticlesByPartNumberMock = async (
  company: string,
  location_id: string,
  part_number: string
): Promise<ArticleSearchResult[]> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filtrar artículos que coincidan con la búsqueda
  return mockArticles.filter(article => 
    article.part_number.toLowerCase().includes(part_number.toLowerCase()) ||
    article.alternative_part_number.some(alt => 
      alt.toLowerCase().includes(part_number.toLowerCase())
    ) ||
    article.description.toLowerCase().includes(part_number.toLowerCase())
  );
};

export const useSearchArticlesByPartNumberMock = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<ArticleSearchResult[], Error>({
    queryKey: ["search-articles-mock", company, location_id, part_number],
    queryFn: () => searchArticlesByPartNumberMock(company!, location_id!, part_number!),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
