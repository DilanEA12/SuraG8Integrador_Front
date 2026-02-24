# 📚 Proyecto Integrador Sura G8
### Sistema de Gestión Académica — Documentación General

---

## Tabla de contenido

1. [¿Qué es el proyecto?](#1--qué-es-el-proyecto)
2. [Tecnologías utilizadas](#2--tecnologías-utilizadas)
3. [Roles y permisos](#3--roles-y-permisos)
4. [Estructura general del sistema](#4--estructura-general-del-sistema)
5. [Módulos del sistema](#5--módulos-del-sistema)
   - [Usuarios](#51-usuarios)
   - [Notificaciones](#52-notificaciones)
   - [Profesores](#53-profesores)
   - [Cursos](#54-cursos)
   - [Asistencias](#55-asistencias)
   - [Notas](#56-notas)
   - [Reportes Estadísticos](#57-reportes-estadísticos)
   - [Matrícula](#58-matrícula)
6. [Funcionalidades transversales](#6--funcionalidades-transversales)
7. [Historias de usuario](#7--historias-de-usuario)
8. [Correcciones aplicadas durante el desarrollo](#8--correcciones-aplicadas-durante-el-desarrollo)
9. [Estado final del proyecto](#9--estado-final-del-proyecto)

---

## 1 · ¿Qué es el proyecto?

**Sura G8** es una plataforma web de gestión académica desarrollada como proyecto integrador por el grupo 8. Permite administrar los procesos centrales de una institución educativa: registro de usuarios, cursos, asistencias, notas, matrículas, notificaciones y reportes estadísticos.

El sistema distingue entre dos tipos de usuarios — **Profesores** y **Estudiantes** — y adapta todo lo que ven y pueden hacer según ese rol. Un estudiante no verá las mismas opciones que un profesor, y tampoco podrá acceder a secciones que no le correspondan, ni siquiera escribiendo la dirección directamente en el navegador.

---

## 2 · Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Interfaz (frontend) | React (Create React App), React Router, CSS propio |
| Servidor (backend) | Spring Boot (Java) |
| Base de datos | H2 (en memoria, para desarrollo) |
| Persistencia | JPA / Hibernate |
| Alertas visuales | SweetAlert2 |
| Comunicación | API REST (JSON sobre HTTP) |

> El proyecto fue construido en un único repositorio React con todos los módulos unificados, corriendo en `localhost:3000`. El servidor corre en `localhost:8080`.

---

## 3 · Roles y permisos

El sistema tiene dos roles. Cada uno tiene acceso a distintas partes de la plataforma:

| Sección | Estudiante | Profesor |
|---|:---:|:---:|
| Ver su propio perfil (login) | ✅ | ✅ |
| Registrarse | ✅ | ✅ |
| Ver lista de usuarios | ❌ | ✅ |
| Ver notificaciones | ✅ | ✅ |
| Crear / editar notificaciones | ❌ | ✅ |
| Ver profesores | ✅ | ✅ |
| Crear / editar profesores | ❌ | ✅ |
| Ver cursos | ✅ | ✅ |
| Crear / editar cursos | ❌ | ✅ |
| Ver asistencias (propias) | ✅ | ✅ (todas) |
| Registrar asistencia | ❌ | ✅ |
| Ver notas | ✅ | ✅ |
| Crear / editar notas | ❌ | ✅ |
| Ver matrícula (propia) | ✅ | ✅ (todas) |
| Crear / editar matrícula | ❌ | ✅ |
| Reportes estadísticos | ❌ | ✅ |

Si un estudiante intenta acceder por URL a una sección exclusiva para profesores, el sistema lo redirige automáticamente a su pantalla de inicio.

---

## 4 · Estructura general del sistema

### Pantalla de inicio (pública)

Página de bienvenida con acceso a **Iniciar sesión** y **Registrarse**. Cualquier persona puede verla sin estar autenticada.

### Login

Formulario de inicio de sesión con correo y contraseña. Al ingresar correctamente, el sistema guarda los datos del usuario en el navegador y redirige al **Dashboard (Home)**.

### Dashboard (Home)

Pantalla principal después de iniciar sesión. Muestra:

- Un saludo personalizado con el nombre del usuario.
- El rol asignado (Profesor o Estudiante).
- **Tarjetas de acceso rápido** a cada módulo disponible según el rol.
- Una nota informativa para estudiantes sobre las secciones a las que tienen acceso limitado.

Las tarjetas del dashboard solo muestran los módulos a los que el usuario tiene permiso. Un estudiante no verá la tarjeta de Usuarios ni la de Reportes, por ejemplo.

### Barra de navegación (Navbar)

Menú lateral o superior siempre visible cuando el usuario está autenticado. Organizado en secciones que se pueden expandir (acordeón). Cada sección lleva a la lista principal del módulo o a sus sub-opciones. Las secciones exclusivas para profesores solo aparecen si el usuario tiene ese rol. También incluye el botón para cerrar sesión y el interruptor de **modo oscuro**.

---

## 5 · Módulos del sistema

---

### 5.1 Usuarios

**¿Para qué sirve?**
Permite al administrador (Profesor) consultar todos los usuarios registrados en el sistema y ver el detalle de cada uno.

**¿Quién puede usarlo?**
Solo los Profesores. Los estudiantes no ven esta sección ni en el menú ni en el dashboard.

**¿Qué se puede hacer?**

- Ver la lista completa de usuarios en tarjetas visuales.
- Cada tarjeta muestra el ID, nombre, rol y correo del usuario.
- Hacer clic en "Ver detalle" para abrir la información completa (incluye teléfono si está registrado).
- **Buscar** usuarios en tiempo real por: ID, nombre, correo, rol o teléfono.
- Al buscar, aparece un contador de resultados y un botón para limpiar la búsqueda.

**Registro de usuarios**
El registro es una pantalla pública (accesible sin estar autenticado). Cualquier persona puede crear su cuenta con nombre, correo, contraseña, rol y teléfono opcional. El sistema valida que el correo tenga formato correcto y que la contraseña tenga al menos 6 caracteres.

---

### 5.2 Notificaciones

**¿Para qué sirve?**
Canal de comunicación dentro de la plataforma. Los profesores pueden enviar notificaciones a los usuarios del sistema.

**¿Quién puede usarlo?**
Todos pueden **ver** las notificaciones. Solo los Profesores pueden **crear** y **editar**.

**¿Qué se puede hacer?**

- Ver el listado de todas las notificaciones registradas.
- Ver el detalle de cada notificación.
- Crear una nueva notificación (solo Profesor).
- Editar una notificación existente (solo Profesor).

---

### 5.3 Profesores

**¿Para qué sirve?**
Gestión del cuerpo docente de la institución.

**¿Quién puede usarlo?**
Todos pueden **ver** la lista. Solo los Profesores pueden **crear** y **editar**.

**¿Qué se puede hacer?**

- Ver el listado de profesores registrados.
- Buscar por ID, nombre o especialidad.
- Crear un nuevo registro de profesor (solo Profesor).
- Editar la información de un profesor existente (solo Profesor).

---

### 5.4 Cursos

**¿Para qué sirve?**
Administrar la oferta de cursos disponibles en la institución.

**¿Quién puede usarlo?**
Todos pueden **ver** los cursos. Solo los Profesores pueden **crear** y **editar**.

**¿Qué se puede hacer?**

- Ver el listado de cursos activos.
- Buscar por ID, título, docente o descripción.
- Crear un nuevo curso (solo Profesor).
- Editar la información de un curso (solo Profesor).

---

### 5.5 Asistencias

**¿Para qué sirve?**
Registro y consulta de la asistencia de los estudiantes.

**¿Quién puede usarlo?**
Los Profesores ven **todos** los registros y pueden crear nuevos. Los Estudiantes solo ven los registros que corresponden a su nombre.

**¿Qué se puede hacer?**

- Ver el listado de asistencias con indicador visual de color (verde = presente, rojo = ausente).
- Tarjetas de resumen con: total de presentes, total de ausentes, porcentaje de asistencia y cantidad total de registros.
- Buscar por ID, nombre o fecha.
- Registrar una nueva asistencia con formulario desplegable (solo Profesor). Los campos son: nombre de la persona, fecha, hora de entrada y si asistió o no.
- **Exportar** el listado a archivo CSV (compatible con Excel) o PDF (abre el diálogo de impresión del navegador), incluyendo los KPIs en el encabezado del reporte.

---

### 5.6 Notas

**¿Para qué sirve?**
Consulta y gestión de las calificaciones de los estudiantes.

**¿Quién puede usarlo?**
Todos pueden **ver** las notas. Solo los Profesores pueden **crear** y **editar**.

**¿Qué se puede hacer?**

- Ver el listado de notas registradas.
- Buscar por ID u otros campos disponibles.
- Crear una nueva nota (solo Profesor).
- Editar una nota existente (solo Profesor).

---

### 5.7 Reportes Estadísticos

**¿Para qué sirve?**
Panel exclusivo para el Profesor con estadísticas consolidadas del sistema, divididas en dos categorías: **Académicos** y **Administrativos**.

**¿Quién puede usarlo?**
Exclusivamente los Profesores.

**¿Qué se puede hacer?**

**Pestaña Académica:**
- Ver indicadores de: Promedio General, Asistencia Total, Cursos Activos y Promedio de Notas.
- Listado de reportes académicos con: nota final, asistencia, cantidad de cursos, curso más popular, curso menos popular y desempeño general.

**Pestaña Administrativa:**
- Ver indicadores de: Total de Usuarios, Promedio de Matrícula, Calificación Docente y Porcentaje de Aprobados.
- Listado de reportes administrativos con datos financieros y de gestión.

**Funcionalidades comunes:**
- Buscar en tiempo real dentro de la pestaña activa por: ID, período, desempeño, nombre de curso, calificación docente, entre otros.
- Mientras hay una búsqueda activa, los indicadores KPI se ocultan para no generar confusión con datos parciales.
- Contador de resultados visible al filtrar.
- Botón para limpiar la búsqueda con un clic.
- Al cambiar de pestaña (Académico ↔ Administrativo), la búsqueda se reinicia automáticamente.
- Ver el detalle completo de cada reporte en una ventana emergente.
- Crear y editar reportes mediante un formulario con campos diferenciados según el tipo.

---

### 5.8 Matrícula

**¿Para qué sirve?**
Registro y consulta de matrículas de los estudiantes en la institución.

**¿Quién puede usarlo?**
Los Profesores ven **todos** los registros y pueden crear o editar. Los Estudiantes solo ven los registros asociados a su correo o nombre.

**¿Qué se puede hacer?**

- Ver el listado de matrículas con tarjetas de resumen: total de registros, valor total recaudado (solo Profesor) y fecha del último registro.
- Buscar por ID, nombre, correo o número de documento.
- Registrar una nueva matrícula con: nombre completo, documento de identidad, correo, fecha de matrícula y valor.
- Editar una matrícula existente (solo Profesor).
- Los valores monetarios se muestran en formato de peso colombiano (COP).
- Al guardar correctamente, se muestra un resumen de los datos enviados antes de redirigir al listado.

---

## 6 · Funcionalidades transversales

Estas características están presentes en toda la plataforma, no en un módulo específico.

### Modo oscuro

El sistema incluye un interruptor de modo oscuro en la barra de navegación. Al activarlo, toda la interfaz cambia a tonos oscuros. La preferencia se guarda, por lo que si el usuario recarga la página o vuelve más tarde, el modo oscuro permanece activo sin parpadeo.

### Protección de rutas

Existen tres niveles de acceso en el sistema:

- **Ruta pública:** accesible sin iniciar sesión (inicio, login, registro).
- **Ruta protegida:** requiere estar autenticado (cualquier rol).
- **Ruta solo Profesor:** requiere estar autenticado Y tener rol de Profesor. Si un estudiante intenta acceder, el sistema lo redirige a su home sin mostrar ningún error.

### Búsqueda en módulos

Todos los módulos con listados incluyen una barra de búsqueda que:

- Filtra resultados en tiempo real mientras se escribe.
- Busca en múltiples campos al mismo tiempo (ID, nombre, correo, etc.).
- Muestra un contador de resultados cuando hay una búsqueda activa.
- Incluye un botón para limpiar la búsqueda de un clic.

### Indicadores de estado

En todos los formularios y listas del sistema se gestionan tres estados visuales:

- **Cargando:** se muestra un spinner animado mientras se obtienen datos del servidor.
- **Error:** se muestra un mensaje descriptivo si algo falla (por ejemplo, si el servidor no está corriendo).
- **Vacío:** se muestra un mensaje y un acceso directo para crear el primer registro si no hay datos.

### Feedback en formularios

Todos los formularios del sistema muestran:

- Validaciones campo a campo con mensajes específicos (por ejemplo, "El correo no es válido").
- Mensaje de éxito o error después de enviar.
- Estado "Guardando..." en el botón mientras se procesa la petición.
- Redirección automática al listado tras guardar exitosamente.

---

## 7 · Historias de usuario

Las siguientes historias de usuario describen los requerimientos que guiaron el desarrollo de cada módulo. Se presentan en formato genérico aplicable a todas las entidades del sistema.

---

### HU-[ENT]-BE1 · Modelo de datos

> **Como** desarrollador, **quiero** definir la entidad con sus campos correspondientes **para** que el sistema pueda guardar y recuperar la información correctamente.

**Se cumple cuando:**
- Existe la clase con los campos mínimos del dominio (incluye identificador único y atributos clave).
- Se aplican validaciones básicas (campos obligatorios, formatos, rangos numéricos si aplica).

---

### HU-[ENT]-BE2 · Acceso a datos

> **Como** desarrollador, **quiero** implementar el acceso a la base de datos **para** poder crear y consultar registros de forma segura.

**Se cumple cuando:**
- Existen operaciones para: crear un registro (POST), consultar por identificador y consultar todos (GET).
- La capa de datos ejecuta las consultas y transforma la respuesta al formato esperado.
- Los errores de base de datos se controlan y devuelven una respuesta comprensible.

---

### HU-[ENT]-BE3 · Lógica de negocio

> **Como** desarrollador, **quiero** una capa intermedia que aplique las reglas del negocio **para** que la aplicación se comporte de forma coherente y predecible.

**Se cumple cuando:**
- Existen al menos los métodos: `crear()`, `listarTodos()` y `buscarPorId(id)`.
- Los errores de validación devuelven código 400 con un mensaje descriptivo.
- Los registros no encontrados devuelven código 404.

---

### HU-[ENT]-BE4 · API REST

> **Como** usuario del sistema, **quiero** que exista una interfaz de comunicación estándar **para** que la pantalla pueda enviar y recibir datos del servidor.

**Se cumple cuando:**
- Están disponibles los siguientes puntos de acceso:
  - `POST /[ruta]` — crear registro
  - `GET /[ruta]` — obtener todos
  - `GET /[ruta]/{id}` — obtener uno por identificador
  - `DELETE /[ruta]/{id}` — eliminar registro
- Las respuestas usan códigos HTTP correctos: 200, 201, 400, 404.
- El cuerpo de respuesta es consistente y contiene información útil.

---

### HU-[ENT]-BE5 · Pruebas de API

> **Como** desarrollador o QA, **quiero** verificar que la API funciona correctamente en todos sus casos **para** asegurar que no habrá errores en producción.

**Se cumple cuando:**
- Existe una colección de pruebas con los siguientes escenarios:
  - Crear registro válido → respuesta exitosa con los datos guardados.
  - Obtener todos → lista con el registro recién creado.
  - Obtener por ID existente → datos del registro.
  - Intentar obtener un ID inexistente → respuesta 404 con mensaje.
  - Intentar crear con datos inválidos → respuesta 400 con detalle del error.

---

### HU-[ENT]-FE1 · Formulario de captura

> **Como** usuario, **quiero** un formulario en pantalla **para** ingresar los datos y enviarlos al servidor.

**Se cumple cuando:**
- Los campos del formulario corresponden exactamente al modelo del servidor.
- Cada campo tiene validación propia con mensaje de error específico.
- Al enviar en modo creación, consume el endpoint POST.
- Muestra retroalimentación visible: mensaje de éxito con datos registrados o mensaje de error si falla.
- El botón muestra "Guardando..." mientras se procesa.

---

### HU-[ENT]-FE2 · Pantalla de listado

> **Como** usuario, **quiero** ver en pantalla todos los registros existentes **para** consultarlos y tomar decisiones.

**Se cumple cuando:**
- Se muestra una lista o tabla consumiendo el endpoint GET.
- Se manejan los tres estados: cargando (spinner), error (mensaje descriptivo) y vacío (mensaje + botón para crear).
- Desde el listado se puede seleccionar un registro para ver su detalle o ir a editarlo.
- Existe una barra de búsqueda que filtra los resultados por ID y campos relevantes del modelo.

---

### HU-[ENT]-FE3 · Navegación entre pantallas

> **Como** usuario, **quiero** poder moverme entre la lista y el formulario de forma natural **para** crear, editar o consultar registros sin perderme.

**Se cumple cuando:**
- Existen al menos las siguientes rutas:
  - `/[ruta]` — pantalla de listado
  - `/[ruta]/crear` — formulario para nuevo registro
  - `/[ruta]/editar/:id` — formulario pre-cargado para editar
- La navegación entre listado y formulario funciona en ambos sentidos.
- Una ruta no existente redirige al inicio (fallback configurado).
- Las rutas exclusivas de Profesor redirigen al estudiante a su home si intenta acceder directamente.

---

## 8 · Correcciones aplicadas durante el desarrollo

Durante la integración de los módulos se detectaron y resolvieron varios problemas. Se documentan aquí para referencia del equipo.

### Backend

| Módulo | Problema encontrado | Solución aplicada |
|---|---|---|
| Asistencias | Ruta con typo: `/w{id}` en lugar de `/{id}` | Corregida la anotación `@GetMapping` |
| Asistencias | Usaba stored procedures inexistentes en H2 | Reemplazados por métodos JPA estándar (`findAll`, `save`, `findById`) |
| Asistencias | Apuntaba a `localhost:8081` (puerto incorrecto) | Corregido a `localhost:8080` |
| Matrícula | Ruta base: `/apisurag8/` (con 'g' extra) | Unificada a `/apisura8/` igual que el resto |
| Matrícula | Sin `@CrossOrigin` — bloqueaba peticiones del navegador | Añadida la anotación con los orígenes permitidos |
| Matrícula | Sin endpoint `DELETE` | Añadido siguiendo el patrón de los demás módulos |
| Reportes | Campo `desempeÃ±o` — error de codificación (tildes en Java) | Renombrado a `desempeno` (sin tilde) |
| Reportes | Typo en campo: `cantidadUsarios` | Corregido a `cantidadUsuarios` |
| Todos | `@CrossOrigin` solo permitía `localhost:3000` | Extendido a `:3000`, `:3001` y `:5173` |

### Frontend

| Módulo | Problema encontrado | Solución aplicada |
|---|---|---|
| Matrícula | Construido en Next.js + TypeScript (framework incorrecto) | Convertido completamente a React JSX puro |
| Matrícula | Usaba componentes de librería externa (shadcn/ui) | Reemplazados por HTML/CSS estándar con el estilo Sura G8 |
| Notificaciones | Botón ✏️ Editar visible para Estudiantes | Condicionado con `{esProfesor && <button...>}` |
| Todos los listados | La búsqueda no filtraba por ID | Añadido `String(item.id).includes(q)` en cada filtro |
| Asistencias | El servicio apuntaba a `localhost:8081/api/asistencias` | Corregido a `localhost:8080/apisura8/v1/asistencias` |

---

## 9 · Estado final del proyecto

| # | Módulo | Estado | Roles con acceso |
|---|---|---|---|
| 1 | Usuarios | ✅ Activo | Solo Profesor |
| 2 | Notificaciones | ✅ Activo | Ver: ambos · Crear/Editar: solo Profesor |
| 3 | Profesores | ✅ Activo | Ver: ambos · Crear/Editar: solo Profesor |
| 4 | Cursos | ✅ Activo | Ver: ambos · Crear/Editar: solo Profesor |
| 5 | Asistencias | ✅ Activo | Ver: ambos (filtrado) · Registrar: solo Profesor |
| 6 | Notas | ✅ Activo | Ver: ambos · Crear/Editar: solo Profesor |
| 7 | Reportes Estadísticos | ✅ Activo | Solo Profesor |
| 8 | Matrícula | ✅ Activo | Ver: ambos (filtrado) · Crear/Editar: solo Profesor |

**8 de 8 módulos activos. Sistema completamente funcional.**

---

*Proyecto Integrador — Grupo 8 · Sura G8 · 2026*