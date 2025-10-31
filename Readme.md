# Sistema Solar Interactivo en Three.js

Este proyecto es una simulación de un sistema solar interactivo, construido desde cero con la librería `three.js`. Permite a los usuarios explorar un sistema solar predefinido, volar una nave espacial y crear o destruir sus propios planetas de forma interactiva.

Este proyecto cumple con los requisitos de la tarea, incluyendo iluminación, texturas y dos vistas de cámara.



---

## Vídeo de Demostración (2 min)

Haz clic en la imagen para ver la demostración completa del proyecto:

[![Demostración del Proyecto](https://i.imgur.com/p7aUwfC.png)](https://youtu.be/WNeQUpehGMk)
---

## Características Principales

* **Sistema Solar Horizontal:** Todo el sistema orbita en el plano X-Z (horizontal), permitiendo una vista "desde arriba" (orbital) y una vista "desde dentro" (nave).
* **Texturas y Luces:** Todos los cuerpos celestes (Sol, planetas y lunas) usan texturas (`MeshStandardMaterial`) y reaccionan a una luz (`PointLight`) anidada en el Sol.
* **Fondo Inmersivo:** Un "skybox" 360º con una textura de galaxia elimina el vacío y crea una inmersión total.
* **Doble Cámara:**
    1.  **Vista Orbital:** Una cámara cenital controlada para ver todo el sistema.
    2.  **Vista de Nave:** Una cámara en tercera persona que va "enganchada" a una nave espacial.
* **Carga de Modelos 3D:** La nave espacial es un modelo `.glb` externo cargado con `GLTFLoader`.
* **Modo Creación/Destrucción:** El usuario puede añadir y quitar planetas.
* **Generación Aleatoria:** Los planetas creados por el usuario tienen una probabilidad (40%) de generarse con su propia luna.

---

## Controles

La interfaz de usuario en la parte superior de la pantalla explica todos los controles:

* **`Clic Izquierdo`:** (Solo en vista orbital) Crea un nuevo planeta en la ubicación del cursor.
* **`Clic Derecho`:** (Solo en vista orbital) Elimina el planeta sobre el que se pulsa (y su órbita).
* **`[C]`:** Cambia entre la **Vista Orbital** (general) y la **Vista de Nave** (3ª persona).
* **`[W], [A], [S], [D]`:** (Solo en vista de nave) Mueve y gira la nave espacial.
* **`Ratón (Vista Orbital)`:** Arrastra para rotar la cámara (`OrbitControls`) y usa la rueda para hacer zoom.

---



## Demo en Vivo

**[Enlace CodeSandbox Demo](https://codesandbox.io/p/sandbox/ig2526-s6-forked-7l3szz)**

---

## Autor


**Jesús Santacruz Martín-Delgado**
