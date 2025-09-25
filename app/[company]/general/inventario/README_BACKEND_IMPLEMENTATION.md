# Implementación Backend Requerida para Vista Organizada de Inventario

## Endpoint Requerido

### `GET /{company}/{location}/search-batches-with-articles`

**Parámetros:**
- `location_id`: ID de la estación/almacén  
- `part_number`: Número de parte a buscar (búsqueda parcial)

**Respuesta esperada:**
```json
[
  {
    "batch": {
      "id": 1,
      "name": "TORNILLOS Y PERNOS",
      "slug": "tornillos-y-pernos",
      "description": "Batch de tornillos varios para mantenimiento",
      "category": "FASTENERS",
      "ata_code": "25-21-00",
      "brand": "Generic",
      "warehouse_name": "Hangar 74",
      "warehouse_id": 1,
      "min_quantity": 10,
      "medition_unit": "UNIDADES"
    },
    "articles": [
      {
        "id": 1,
        "part_number": "65-50587-4",
        "alternative_part_number": ["ALT-123", "ALT-456"],
        "description": "TORNILLO SIN FIN FLAP #8 YV658T",
        "serial": "SN123456",
        "quantity": 1,
        "zone": "Almacén General",
        "condition": "NUEVO",
        "manufacturer": "Boeing",
        "unit_secondary": "UNIDADES",
        "status": "DISPONIBLE",
        "cost": 25.50,
        "image": "path/to/image.jpg",
        "certificates": ["cert1.pdf", "cert2.pdf"],
        "article_type": "CONSUMABLE",
        "tool": null,
        "component": null,
        "consumable": {
          "article_id": 1,
          "is_managed": true,
          "convertions": [...],
          "shell_time": {...}
        }
      }
    ]
  }
]
```

## Lógica de Búsqueda para Vista Organizada

El endpoint `search-batches-with-articles` debe:

1. **Encontrar batches** que contengan artículos con el `part_number` buscado
2. **Para cada batch encontrado**, incluir solo los artículos que coincidan con la búsqueda
3. **Agrupar por batch** para permitir la vista expandible
4. **Incluir información completa del batch** (para mostrar en el header)
5. **Incluir información completa de artículos** (para mostrar en el detalle expandible)

## Consulta SQL Sugerida para Vista Organizada

```sql
SELECT 
  b.id as batch_id,
  b.name as batch_name,
  b.slug as batch_slug,
  b.description as batch_description,
  b.category as batch_category,
  b.ata_code as batch_ata_code,
  b.brand as batch_brand,
  b.min_quantity as batch_min_quantity,
  b.medition_unit as batch_medition_unit,
  w.name as warehouse_name,
  w.id as warehouse_id,
  
  -- Artículos agrupados por batch
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', a.id,
      'part_number', a.part_number,
      'alternative_part_number', a.alternative_part_number,
      'description', a.description,
      'serial', a.serial,
      'quantity', a.quantity,
      'zone', a.zone,
      'condition', a.condition,
      'manufacturer', a.manufacturer,
      'unit_secondary', a.unit_secondary,
      'status', a.status,
      'cost', a.cost,
      'image', a.image,
      'certificates', a.certificates,
      'article_type', a.article_type,
      'consumable', c.*,
      'component', comp.*,
      'tool', t.*
    )
  ) as articles

FROM batches b
JOIN warehouses w ON b.warehouse_id = w.id
JOIN articles a ON a.batch_id = b.id
LEFT JOIN consumables c ON a.id = c.article_id
LEFT JOIN components comp ON a.id = comp.article_id  
LEFT JOIN tools t ON a.id = t.article_id

WHERE (
  a.part_number LIKE '%{part_number}%' 
  OR JSON_CONTAINS(a.alternative_part_number, '"{part_number}"')
  OR a.description LIKE '%{part_number}%'
)
AND w.location_id = {location_id}

GROUP BY b.id, b.name, b.slug, b.description, b.category, b.ata_code, b.brand, 
         b.min_quantity, b.medition_unit, w.name, w.id
ORDER BY b.name ASC;
```
