# 🎯 SlideJudge — Evaluador de Presentaciones con IA

Aplicación web basada en **Inteligencia Artificial** diseñada para analizar y evaluar presentaciones, proporcionando una valoración estructurada y recomendaciones para mejorar su calidad.

SlideJudge permite utilizar la IA como herramienta de apoyo para revisar una presentación antes de exponerla, identificando posibles puntos débiles y ofreciendo sugerencias orientadas a mejorar tanto el contenido como la comunicación.

## 🚀 Aplicación online

Puedes utilizar SlideJudge directamente desde el navegador:

👉 **[Abrir SlideJudge](https://evaluador-presentaciones-ia.pages.dev/)**

No es necesario instalar ninguna aplicación para utilizar la versión desplegada.

## 📁 Repositorio

Código fuente disponible en GitHub:

👉 **[cce087/evaluador-presentaciones-ia](https://github.com/cce087/evaluador-presentaciones-ia)**

---

# 🎯 Objetivo

El objetivo de **SlideJudge** es facilitar la evaluación y mejora de presentaciones mediante Inteligencia Artificial.

Preparar una buena presentación no consiste únicamente en incluir información. También es necesario conseguir que el contenido esté bien estructurado, sea comprensible para la audiencia y se comunique de forma clara.

SlideJudge busca convertir este proceso de revisión en un análisis estructurado mediante IA.

La herramienta puede utilizarse para:

* 📊 Revisar la calidad de una presentación.
* 🧠 Analizar el contenido.
* 📝 Detectar posibles puntos débiles.
* 💡 Obtener recomendaciones de mejora.
* 🎤 Preparar una exposición.
* 🔍 Realizar una revisión previa antes de presentar.
* 📈 Identificar aspectos que pueden reforzarse.

---

# 🤖 Evaluación mediante Inteligencia Artificial

La aplicación utiliza Inteligencia Artificial para analizar una presentación y generar una evaluación estructurada.

En lugar de limitarse a proporcionar una valoración general, el objetivo es obtener **feedback accionable** que permita al usuario saber qué aspectos puede mejorar.

El análisis puede entenderse como un proceso:

```text
          PRESENTACIÓN
               │
               ▼
      ┌─────────────────┐
      │ Análisis con IA │
      └────────┬────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
   Contenido  Diseño  Comunicación
       │       │        │
       └───────┼────────┘
               ▼
       EVALUACIÓN GLOBAL
               │
               ▼
      RECOMENDACIONES
         DE MEJORA
```

---

# 📋 Evaluación estructurada

Uno de los objetivos principales de SlideJudge es convertir el análisis de una presentación en información que resulte fácil de interpretar.

La evaluación puede utilizarse para detectar aspectos relacionados con:

### 🧠 Contenido

* Claridad de las ideas.
* Organización de la información.
* Coherencia del contenido.
* Relevancia de la información presentada.
* Capacidad para transmitir el mensaje principal.

### 🗂️ Estructura

* Organización de las diapositivas.
* Flujo lógico de la presentación.
* Introducción y contextualización.
* Desarrollo.
* Conclusiones.
* Transición entre contenidos.

### 🎨 Diseño y comunicación visual

* Claridad visual.
* Legibilidad.
* Organización de los elementos.
* Cantidad de información.
* Uso de elementos gráficos.
* Jerarquía visual.

### 🎤 Comunicación

* Claridad del mensaje.
* Capacidad de síntesis.
* Adaptación al público.
* Facilidad de comprensión.
* Capacidad de mantener la atención.

### 💡 Recomendaciones

El análisis busca proporcionar sugerencias concretas que permitan transformar el resultado de la evaluación en acciones de mejora.

---

# 🔄 Flujo de utilización

El funcionamiento general de la aplicación puede resumirse en cuatro etapas:

```text
┌──────────────────────┐
│ 1. Preparar          │
│    presentación      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. Introducir /      │
│    enviar contenido  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. Análisis mediante │
│    Inteligencia      │
│    Artificial        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. Resultados y      │
│    recomendaciones   │
└──────────────────────┘
```

---

# 🧑‍🎓 ¿Para quién está pensado?

SlideJudge puede ser especialmente útil para personas que necesitan preparar presentaciones y quieren obtener una revisión adicional antes de exponerlas.

### 🎓 Estudiantes

Puede utilizarse para revisar:

* Presentaciones universitarias.
* Trabajos académicos.
* Trabajos de fin de grado.
* Trabajos de fin de máster.
* Exposiciones de proyectos.

### 💼 Profesionales

También puede servir como herramienta de apoyo para:

* Presentaciones empresariales.
* Reuniones.
* Propuestas comerciales.
* Presentaciones de proyectos.
* Informes ejecutivos.
* Pitches.

### 🚀 Emprendedores

Puede utilizarse como apoyo para preparar:

* Pitch decks.
* Presentaciones para inversores.
* Presentaciones de proyectos.
* Propuestas de negocio.

---

# 🌐 Aplicación web

La aplicación está disponible online mediante Cloudflare Pages:

👉 **[evaluador-presentaciones-ia.pages.dev](https://evaluador-presentaciones-ia.pages.dev/)**

Esto permite acceder a SlideJudge directamente desde un navegador sin necesidad de configurar un entorno de desarrollo local.

---

# 🛠️ Tecnologías

El proyecto está orientado a la integración de:

* 🤖 Inteligencia Artificial.
* 🌐 Aplicación web.
* 📊 Análisis estructurado de presentaciones.
* 🧠 Procesamiento mediante modelos de IA.
* ☁️ Despliegue web.

> La arquitectura y las tecnologías concretas utilizadas por el backend, frontend y proveedor/modelo de IA deben consultarse directamente en el código fuente del repositorio.

---

# 📂 Estructura del proyecto

La estructura exacta del proyecto depende de la versión actualmente desplegada.

Una posible organización conceptual es:

```text
evaluador-presentaciones-ia/
│
├── Frontend
│   ├── Interfaz de usuario
│   ├── Formulario de evaluación
│   └── Visualización de resultados
│
├── Backend / API
│   ├── Procesamiento de solicitudes
│   └── Comunicación con el modelo de IA
│
├── Lógica de evaluación
│   ├── Análisis
│   ├── Criterios
│   └── Generación de recomendaciones
│
└── README.md
```

La estructura anterior representa la arquitectura funcional del proyecto y no pretende sustituir la estructura real de carpetas del repositorio.

---

# 🧠 Concepto de evaluación

Una de las ideas principales detrás de SlideJudge es utilizar la IA como un **evaluador asistido**, proporcionando una segunda perspectiva sobre la presentación.

El proceso puede plantearse de la siguiente manera:

```text
                 PRESENTACIÓN
                       │
                       ▼
              ┌────────────────┐
              │     SlideJudge │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Contenido      Diseño      Comunicación
        │             │             │
        └─────────────┼─────────────┘
                      ▼
               Análisis IA
                      │
                      ▼
             ┌────────────────┐
             │    Feedback    │
             └───────┬────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Fortalezas  Debilidades  Mejoras
```

Esto permite utilizar la herramienta no solamente como un sistema de puntuación, sino como una herramienta de **aprendizaje y mejora iterativa**.

---

# 🔁 Mejora iterativa

Una posible forma de utilizar SlideJudge es mediante un ciclo de revisión:

```text
     CREAR PRESENTACIÓN
             │
             ▼
       EVALUAR CON IA
             │
             ▼
       RECIBIR FEEDBACK
             │
             ▼
       APLICAR MEJORAS
             │
             ▼
      VOLVER A EVALUAR
             │
             └───────────────┐
                             ▼
                    PRESENTACIÓN FINAL
```

Este enfoque permite utilizar la aplicación durante el proceso de preparación y no únicamente justo antes de realizar la exposición.

---

# ⚠️ Consideraciones sobre la evaluación mediante IA

Los resultados proporcionados por una Inteligencia Artificial deben utilizarse como **herramienta de apoyo**.

Una evaluación automática puede ayudar a detectar problemas que quizá no se habían identificado durante la preparación, pero no sustituye necesariamente el criterio del autor, profesor, tutor, evaluador o profesional correspondiente.

Por este motivo, se recomienda:

* Revisar las recomendaciones.
* Comprobar que las sugerencias tienen sentido.
* Mantener el criterio propio.
* Adaptar el feedback al contexto de la presentación.
* No interpretar una puntuación automática como una medida absoluta de calidad.

La calidad de los resultados también puede depender del contenido proporcionado, del contexto disponible y del modelo de IA utilizado.

---

# 🔐 Privacidad y datos

Antes de utilizar una herramienta de IA para analizar una presentación, es recomendable comprobar qué información se envía al servicio de IA y cómo se procesa.

En presentaciones que contengan:

* Información empresarial confidencial.
* Datos personales.
* Información académica sensible.
* Propiedad intelectual.
* Información financiera.
* Información no pública.

se recomienda revisar las condiciones de privacidad y tratamiento de datos del servicio utilizado.

---

# 💻 Desarrollo local

Para ejecutar el proyecto localmente es necesario consultar primero la estructura y las instrucciones específicas incluidas en el repositorio.

De forma general, el proceso será:

```bash
git clone https://github.com/cce087/evaluador-presentaciones-ia.git
```

Acceder al proyecto:

```bash
cd evaluador-presentaciones-ia
```

Instalar las dependencias correspondientes al proyecto y ejecutar el entorno de desarrollo según las instrucciones incluidas en el código.

> Las instrucciones exactas de instalación deben mantenerse sincronizadas con el stack actualmente utilizado por el repositorio.

---

# 🚀 Despliegue

La versión pública de SlideJudge está disponible en:

👉 **[SlideJudge — Evaluador de Presentaciones con IA](https://evaluador-presentaciones-ia.pages.dev/)**

El proyecto utiliza un despliegue web que permite acceder a la aplicación desde cualquier navegador compatible.

---

# 🔮 Posibles mejoras futuras

Algunas funcionalidades que podrían incorporarse en futuras versiones:

* [ ] Evaluación mediante diferentes rúbricas.
* [ ] Rúbricas personalizadas por el usuario.
* [ ] Evaluación específica para presentaciones académicas.
* [ ] Evaluación específica para pitches empresariales.
* [ ] Análisis individual de cada diapositiva.
* [ ] Detección de diapositivas con exceso de texto.
* [ ] Análisis de coherencia entre diapositivas.
* [ ] Análisis de estructura narrativa.
* [ ] Evaluación de accesibilidad.
* [ ] Recomendaciones de diseño.
* [ ] Comparación entre versiones de una presentación.
* [ ] Historial de evaluaciones.
* [ ] Exportación del informe de evaluación a PDF.
* [ ] Exportación de resultados a Excel.
* [ ] Sistema de rúbricas personalizadas.
* [ ] Evaluación multimodal de texto e imágenes.
* [ ] Análisis del discurso oral.
* [ ] Evaluación de notas del presentador.
* [ ] Integración con PowerPoint.
* [ ] Integración con Google Slides.
* [ ] Evaluación de presentaciones en diferentes idiomas.

---

# 📚 Posibles aplicaciones educativas

SlideJudge puede utilizarse como herramienta complementaria dentro de procesos de aprendizaje.

Por ejemplo:

```text
       ALUMNO
          │
          ▼
   CREA PRESENTACIÓN
          │
          ▼
     SLIDEJUDGE
          │
          ▼
     RECIBE FEEDBACK
          │
          ▼
   REVISA Y MEJORA
          │
          ▼
     PRESENTACIÓN
        FINAL
```

Esto permite incorporar un proceso de **feedback → revisión → mejora** en la preparación de exposiciones.

Las rúbricas estructuradas son una herramienta habitual para descomponer la evaluación de una presentación en diferentes dimensiones, como contenido, estructura y comunicación.

---

# 🤝 Contribuciones

Las contribuciones son bienvenidas.

Si quieres proponer una mejora:

1. Realiza un fork del repositorio.
2. Crea una nueva rama:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Realiza los cambios.
4. Haz commit:

```bash
git commit -m "Añadir nueva funcionalidad"
```

5. Sube la rama:

```bash
git push origin feature/nueva-funcionalidad
```

6. Abre un **Pull Request**.

---

# 📄 Licencia

Consulta el repositorio para conocer la licencia actualmente asociada al proyecto.

Si el proyecto no dispone todavía de una licencia, se recomienda añadir un archivo `LICENSE` para definir las condiciones de uso, modificación y distribución del código.

---

# 👨‍💻 Proyecto

## SlideJudge

**Evaluador de Presentaciones con Inteligencia Artificial**

Una herramienta para analizar, revisar y mejorar presentaciones mediante IA.

### 🌐 Aplicación

**[Abrir SlideJudge](https://evaluador-presentaciones-ia.pages.dev/)**

### 💻 Código fuente

**[GitHub — cce087/evaluador-presentaciones-ia](https://github.com/cce087/evaluador-presentaciones-ia)**

---

⭐ Si SlideJudge te resulta útil, puedes darle una estrella al repositorio.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/cce087/evaluador-presentaciones-ia)

[![Web](https://img.shields.io/badge/Web-SlideJudge-blue)](https://evaluador-presentaciones-ia.pages.dev/)
