# Manual de Usuario - Biblioteca Digital

Fecha de elaboracion: 23/05/2026

## 1. Objetivo del modulo

La Biblioteca Digital permite consultar, organizar, visualizar, versionar y compartir documentos tecnicos, certificados y archivos controlados por departamento dentro de SIGEAC.

El modulo esta disenado para mantener trazabilidad sobre los documentos compartidos, controlar accesos mediante enlaces o codigos QR, registrar vigencias y conservar el historial de versiones.

## 2. Acceso al modulo

1. Inicie sesion en SIGEAC.
2. Seleccione la empresa correspondiente.
3. En el menu lateral, ingrese a:

   `General > Biblioteca Digital`

La ruta interna del modulo es:

`/{empresa}/general/biblioteca`

## 3. Roles y permisos

Las opciones visibles dependen del perfil del usuario.

### Usuario con acceso de consulta

Puede:

- Ver los documentos disponibles para su departamento.
- Buscar documentos por nombre.
- Abrir documentos en el visualizador seguro.
- Consultar el historial de versiones desde el menu de acciones.

### Director de departamento

Puede:

- Gestionar documentos del departamento asignado.
- Subir documentos.
- Crear, renombrar y eliminar carpetas.
- Mover documentos entre carpetas.
- Subir nuevas versiones.
- Solicitar o generar comparticiones, segun permisos.
- Consultar historial y dashboard del modulo.

### Director DIP o Administrador

Puede:

- Visualizar multiples departamentos.
- Gestionar solicitudes de comparticion.
- Aprobar o rechazar solicitudes.
- Generar enlaces y codigos QR de acceso externo.
- Consultar estadisticas generales de la Biblioteca Digital.

### Superusuario / Administrador

Puede:

- Gestionar documentos de todos los departamentos.
- Acceder a dashboard general.
- Ver y administrar solicitudes.
- Generar accesos externos directamente.

## 4. Pantalla principal

La pantalla de Biblioteca Digital se divide en tres zonas principales:

### Encabezado

Muestra el titulo "Biblioteca Digital" y la empresa activa.

### Barra de acciones

Segun permisos, puede mostrar:

- `Subir Documento`: abre el formulario para registrar un documento.
- `Historial`: abre la trazabilidad global de documentos compartidos.
- `Solicitudes`: abre el panel de solicitudes de comparticion.
- `Dashboard`: abre las estadisticas del modulo.
- Buscador: permite filtrar documentos por nombre.

### Area de trabajo

Incluye:

- Panel izquierdo de carpetas y departamentos.
- Panel derecho con la lista de documentos de la carpeta seleccionada.

## 5. Navegacion por departamentos y carpetas

El panel izquierdo organiza la informacion por departamentos.

1. Seleccione un departamento.
2. Abra la carpeta `Raiz` o una subcarpeta.
3. Los documentos de la seleccion se muestran en el panel derecho.

Si el usuario pertenece a un solo departamento, el sistema puede mostrar solo ese departamento. Si tiene permisos superiores, puede ver varios departamentos.

### Carpetas

Las carpetas pueden tener subcarpetas. El arbol permite expandir o contraer niveles.

La carpeta `Raiz` representa documentos sin carpeta especifica.

## 6. Buscar documentos

Use el campo `BUSCAR DOCUMENTO...` para filtrar la lista actual.

El buscador:

- Filtra por titulo del documento.
- Aplica sobre el departamento y carpeta seleccionados.
- No cambia la carpeta activa.

## 7. Ver documentos

Para abrir un documento:

1. Seleccione una carpeta.
2. Ubique el documento en la lista.
3. Presione el boton con icono de ojo.

El sistema abre el `Visualizador Seguro`.

### Visualizador Seguro

El visor permite:

- Ver el PDF dentro del sistema.
- Cambiar zoom.
- Navegar por paginas.
- Usar pantalla completa.

Como medida de proteccion, el visor bloquea acciones como guardar, imprimir, copiar contenido o abrir el menu contextual del navegador.

Si el archivo no puede cargarse, el visor muestra una opcion para reintentar.

## 8. Estados de vigencia

Cada documento muestra su estado segun la fecha de expiracion:

- `PERMANENTE`: no tiene fecha de vencimiento.
- `VIGENTE`: tiene vencimiento futuro.
- `VENCE EN X DIAS`: esta cercano a vencer.
- `VENCIDO`: la fecha de expiracion ya paso.

Tambien se muestra la fecha de expiracion cuando aplica.

## 9. Subir un documento

Disponible para usuarios con permiso de gestion.

1. Presione `Subir Documento`.
2. Complete el formulario:
   - Nombre del documento.
   - Etiqueta de version, por ejemplo `Rev A`, `Borrador` o `Final`.
   - Area o departamento.
   - Categoria.
   - Carpeta destino, si existen carpetas en el departamento.
   - Tipo de vigencia: `Permanente` o `Con vencimiento`.
   - Fecha de expiracion, si selecciono `Con vencimiento`.
   - Archivo PDF.
3. Presione `Guardar Archivo`.

### Nueva categoria

Si la categoria no existe:

1. En el selector de categoria, elija `+ AGREGAR NUEVA...`.
2. Escriba el nombre de la nueva categoria.
3. Complete el resto del formulario.

## 10. Crear carpetas

Disponible para usuarios con permiso de gestion.

1. Seleccione el departamento o carpeta donde desea trabajar.
2. Presione `Nueva Carpeta`.
3. Escriba el nombre de la carpeta.
4. Seleccione el departamento, si el sistema lo solicita.
5. Seleccione la carpeta padre:
   - `Raiz`: crea la carpeta en el primer nivel.
   - Otra carpeta: crea una subcarpeta.
6. Presione `Crear Carpeta`.

## 11. Renombrar carpetas

1. Ubique la carpeta en el arbol.
2. Abra el menu de acciones de la carpeta.
3. Seleccione `Renombrar`.
4. Escriba el nuevo nombre.
5. Presione `Guardar`.

No se puede guardar si el nombre queda vacio o no cambia.

## 12. Eliminar carpetas

1. Ubique la carpeta en el arbol.
2. Abra el menu de acciones de la carpeta.
3. Seleccione `Eliminar`.
4. Confirme la accion.

Importante: solo se puede eliminar una carpeta si no contiene documentos. La accion no se puede deshacer.

## 13. Mover documentos entre carpetas

Disponible para usuarios con permiso de gestion.

1. Mantenga presionado el documento desde la lista.
2. Arrastrelo hacia la carpeta destino en el arbol.
3. Sueltelo sobre la carpeta.

El sistema actualiza la ubicacion del documento y muestra la carpeta destino.

## 14. Menu de acciones del documento

Cada documento tiene un menu de acciones con opciones segun permisos:

- `Compartir`
- `Subir nueva version`
- `Descargar PDF`
- `Historial de versiones`
- `Eliminar`

## 15. Historial de versiones

1. Abra el menu de acciones del documento.
2. Seleccione `Historial de versiones`.

El panel muestra:

- Version o etiqueta.
- Estado de vigencia.
- Fecha de creacion.
- Justificacion o descripcion del cambio.
- Usuario que cargo la version.
- Boton `Ver` para abrir una version anterior.

## 16. Subir nueva version

Disponible para usuarios con permiso de gestion.

1. Abra el menu de acciones del documento.
2. Seleccione `Subir nueva version`.
3. Seleccione el archivo PDF.
4. Complete la justificacion o log de cambios.
5. Agregue una etiqueta de version, si aplica.
6. Si el documento requiere vencimiento, indique la nueva fecha de expiracion.
7. Presione `Subir Version`.

Notas:

- La justificacion es obligatoria.
- Si el documento base requiere vencimiento, la nueva version tambien debe incluir fecha de expiracion.
- Si el documento base es permanente, se mantiene como permanente.

## 17. Eliminar documentos o versiones

Disponible para usuarios con permiso de gestion.

1. Abra el menu de acciones del documento.
2. Seleccione `Eliminar`.
3. Elija una opcion:
   - `Eliminar version especifica`: elimina una version adicional y conserva el documento principal.
   - `Eliminar documento completo`: elimina el documento, su historial y sus archivos.
4. Confirme la accion.

Importante:

- La version inicial no aparece como version eliminable.
- Eliminar el documento completo es una accion permanente.

## 18. Descargar documentos

La opcion `Descargar PDF` aparece solo cuando el usuario tiene permiso para descargar el documento.

1. Abra el menu de acciones del documento.
2. Seleccione `Descargar PDF`.
3. Elija:
   - `Documento vigente`: descarga la version mas reciente.
   - `Version del historial`: descarga una version especifica.
4. Presione `Iniciar Descarga`.

## 19. Compartir documentos

La opcion `Compartir` permite generar o solicitar acceso externo mediante enlace y codigo QR.

1. Abra el menu de acciones del documento.
2. Seleccione `Compartir`.
3. Indique:
   - Version a compartir.
   - Duracion del acceso: 24, 48, 72 horas, 1 semana o personalizado entre 24 y 168 horas.
   - Destinatario, opcional.
   - Motivo de la comparticion.
   - Si el acceso sera de solo lectura.
4. Presione el boton correspondiente:
   - `Generar Acceso`, si tiene autorizacion directa.
   - `Solicitar Comparticion`, si requiere aprobacion.

El motivo debe tener al menos 10 caracteres.

### Solo lectura

Cuando `Compartir en Solo Lectura` esta activo, el visor publico no muestra boton de descarga.

Si se desmarca, el visor publico permite descargar el PDF.

## 20. Accesos activos

Si un documento ya tiene accesos vigentes, el dialogo de compartir muestra la pestana `Accesos Activos`.

Desde alli puede:

- Ver el QR activo.
- Copiar el enlace.
- Descargar el codigo QR.
- Revisar destinatario, version y fecha de expiracion.

## 21. Solicitudes de comparticion

Disponible principalmente para Director DIP o administradores.

1. Presione `Solicitudes` en la barra de acciones.
2. Use las pestanas:
   - `Pendientes`
   - `Aprobadas`
   - `Rechazadas`
   - `Todas`

Cada solicitud muestra:

- Estado.
- Fecha de solicitud.
- Documento.
- Version.
- Solicitante.
- Destinatario.
- Motivo.

### Aprobar solicitud

1. Abra la solicitud pendiente.
2. Presione `Aprobar`.

El sistema genera el acceso externo y muestra opciones para copiar el enlace o descargar el QR.

### Rechazar solicitud

1. Abra la solicitud pendiente.
2. Presione `Rechazar`.
3. Escriba el motivo del rechazo.
4. Confirme el rechazo.

El motivo queda registrado en el detalle de la solicitud.

## 22. Historial o trazabilidad global

Disponible para usuarios con permiso de gestion.

1. Presione `Historial`.

El panel muestra registros de documentos compartidos:

- Documento.
- Version.
- Estado del enlace: activo o expirado.
- Fecha de creacion.
- Usuario que genero el acceso.
- Destinatario.
- Motivo.

Al seleccionar un registro con enlace disponible, se abre el QR correspondiente, con opcion para copiar el enlace.

## 23. Dashboard de Biblioteca

Disponible para directores y administradores.

1. Presione `Dashboard`.

El dashboard muestra metricas como:

- Total de documentos.
- Documentos compartidos.
- Accesos por QR.
- Solicitudes de comparticion.
- Documentos por departamento.
- Estado de documentos: vigentes, vencidos y permanentes.
- Documentos mas accedidos o accesos externos.
- Estado de solicitudes: aprobadas, pendientes y rechazadas.

La vista puede variar segun el rol:

- Usuarios con vista global ven estadisticas por departamento.
- Directores con vista limitada ven analisis de su departamento.

## 24. Acceso publico por QR o enlace

Cuando una comparticion es aprobada o generada, el destinatario puede abrir el enlace publico.

El visor publico:

- Valida el token del enlace.
- Carga el documento en modo seguro.
- Bloquea copiar, cortar, guardar, imprimir y menu contextual.
- Muestra boton de descarga solo si el acceso no fue definido como solo lectura.

Si el enlace expiro o no es valido, se muestra un mensaje de error.

## 25. Buenas practicas

- Use nombres de documentos claros y descriptivos.
- Registre etiquetas de version consistentes, por ejemplo `Rev A`, `Rev B`, `Final`.
- Use la vigencia cuando el documento tenga fecha de expiracion real.
- Indique justificaciones concretas al subir nuevas versiones.
- Cree carpetas por tipo documental, proceso, periodo o auditoria.
- Evite compartir documentos sin motivo claro.
- Revise periodicamente los documentos vencidos desde la lista o dashboard.
- Antes de eliminar un documento completo, confirme que no se requiere conservar su historial.

## 26. Mensajes frecuentes

### No hay documentos en esta carpeta

La carpeta seleccionada no tiene documentos o el filtro de busqueda no encontro coincidencias.

### Selecciona una carpeta del arbol para ver sus documentos

Debe elegir un departamento o carpeta antes de consultar documentos.

### Error al sincronizar documentos

Puede existir un problema de conexion con el servidor. Intente recargar la pagina o contacte al administrador.

### No se pudo cargar el documento

El archivo no esta disponible, el enlace expiro o hubo un problema de conexion. Use `Reintentar` si aparece la opcion.

### No tienes permisos o el archivo no existe

La descarga no esta permitida para su usuario o el archivo solicitado no esta disponible.

## 27. Resumen de flujos principales

### Consultar un documento

1. Entrar a Biblioteca Digital.
2. Seleccionar departamento y carpeta.
3. Buscar el documento, si es necesario.
4. Presionar el icono de ojo.

### Registrar un documento

1. Presionar `Subir Documento`.
2. Completar datos, categoria, departamento, vigencia y archivo.
3. Guardar.

### Actualizar un documento

1. Abrir menu del documento.
2. Seleccionar `Subir nueva version`.
3. Cargar PDF, justificar cambios y guardar.

### Compartir un documento

1. Abrir menu del documento.
2. Seleccionar `Compartir`.
3. Completar version, duracion, destinatario y motivo.
4. Generar acceso o enviar solicitud.

### Aprobar una comparticion

1. Abrir `Solicitudes`.
2. Seleccionar solicitudes pendientes.
3. Aprobar.
4. Copiar enlace o descargar QR.

