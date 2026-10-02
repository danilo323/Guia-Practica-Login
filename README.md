# CITRA — Login y Registro con HTML, CSS y JavaScript

Portal de acceso para **CITRA**, una marca inspirada en el emulador de Nintendo 3DS. Permite **iniciar sesión**, **registrarse** y **recuperar la contraseña**. Está hecho únicamente con **HTML5, CSS3 y JavaScript puro** (sin frameworks). Usa una paleta **negra y naranja** tomada del logo, pestañas animadas para cambiar entre formularios, diseño responsivo y validaciones en tiempo real.

## Paleta de colores

| Color | Hex | Uso |
|---|---|---|
| Naranja | `#FF8904` | Color principal, iconos, enlaces y foco de los campos |
| Ámbar | `#FFC503` | Inicio del degradado de botones y pestañas |
| Negro | `#0A0A0A` | Fondo de la página |
| Gris carbón | `#121212` / `#1B1B1B` | Tarjeta y campos |
| Verde | `#3DDC84` | Campo válido y mensajes de éxito |
| Rojo | `#FF5252` | Campo inválido y mensajes de error |

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura de los formularios (`form`, `label`, `input`, `select`, `button`) y atributos (`required`, `placeholder`, `min`, `max`, `minlength`, `maxlength`, `pattern`) |
| **CSS3** | Estilos, **Flexbox** (centrado y columnas), **CSS Grid** (filas de dos campos), transiciones, animaciones y *media queries* |
| **JavaScript (ES6+)** | Manipulación del DOM, eventos `input`, `blur`, `change`, `submit` y `click`, validaciones y almacenamiento en `localStorage` |
| **Google Fonts** | Tipografía *Montserrat* |
| **Boxicons** | Iconos de los campos y redes sociales |

---

## Estructura del proyecto

```
├── index.html     → Estructura: panel de marca, pestañas y los 3 formularios
├── bienvenida.html → Página que se muestra después de iniciar sesión
├── bienvenida.js  → Regresa al login si no hay sesión iniciada
├── style.css      → Paleta CITRA, estilos, animaciones y diseño responsivo
├── script.js      → Cambio de formularios, validaciones, registro y login
├── img/
│   ├── citra-logo.webp   → Logo con texto (panel de marca)
│   ├── citra-icono.png   → Icono de la naranja (decoración)
│   └── favicon.png       → Icono de la pestaña del navegador
└── README.md      → Documentación del proyecto
```

---

## Funcionalidades implementadas

- **Registro de usuarios** con 7 campos: nombre completo, correo, teléfono, edad, carrera (`select`), contraseña y confirmación.
- **Inicio de sesión** con correo y contraseña.
- **Recuperar contraseña** ("¿Olvidaste tu contraseña?") con validación del correo.
- **Panel de marca CITRA** con logo, eslogan y beneficios.
- **Pestañas animadas**: al pulsar *Iniciar sesión* o *Registrarse*, un indicador naranja se desliza a la pestaña elegida y el formulario cambia con una transición, sin recargar la página.
- **Validación en tiempo real**: cada campo se valida al salir de él (`blur`) y luego mientras se escribe (`input`), con borde **rojo** y mensaje de error si es inválido, o borde **verde** si es correcto.
- **Barra de fuerza de la contraseña**: cambia de rojo a naranja, amarillo y verde, y cada requisito se marca en verde cuando se cumple.
- **Mostrar/ocultar contraseña** con el icono del ojo.
- **Mensajes emergentes** (*toast*) de éxito (verde) o error (rojo).
- **Bloqueo temporal** del login tras 3 intentos fallidos.
- **Iconos de Google, GitHub y LinkedIn** solo como **elemento visual**: no tienen ninguna función.
- **Diseño responsivo**:
  - **Más de 900 px:** dos columnas (marca y formulario).
  - **Hasta 900 px:** el panel de marca se convierte en una cabecera compacta sobre el formulario.
  - **Hasta 480 px:** los campos en fila (teléfono y edad, contraseña y confirmación) pasan a una sola columna.

---

## ¿Cómo funciona el login?

Como el proyecto no tiene servidor (*backend*), los usuarios se guardan en el navegador usando **`localStorage`**, bajo la clave `usuarios`.

### 1. Registro
1. El usuario llena el formulario y pulsa **Registrarse**.
2. `script.js` evita el envío normal del formulario con `e.preventDefault()` y valida **todos** los campos.
3. Si algún campo es inválido, se marca en rojo, se muestra su mensaje y aparece el aviso *"Revisa los campos marcados en rojo"*. **El formulario no se envía.**
4. Si todo es válido:
   - El nombre se limpia (sin espacios repetidos) y el correo se guarda en minúsculas.
   - La contraseña **no se guarda en texto plano**: se convierte a un *hash* **SHA-256** con la API `crypto.subtle` del navegador.
   - El usuario se agrega a `localStorage`:
     ```json
     {
       "name": "Ana Pérez",
       "email": "ana@correo.com",
       "phone": "0991234567",
       "age": 21,
       "career": "software",
       "password": "0be562a1...e2ad43",
       "createdAt": "2026-10-02T18:57:29.350Z"
     }
     ```
5. Se muestra *"¡Cuenta creada con éxito!"*, se cambia a la pestaña de login y el correo ya queda escrito.

### 2. Inicio de sesión
1. El usuario escribe su correo y contraseña y pulsa **Entrar**.
2. Se valida que ambos campos estén llenos y que el correo tenga un formato válido.
3. Se busca el correo en `localStorage` y se compara el *hash* SHA-256 de la contraseña escrita con el guardado.
4. **Si coinciden:**
   - Aparece *"¡Bienvenido, {nombre}! Inicio de sesión exitoso"*.
   - Se guarda la sesión en `sessionStorage` (clave `sesion`).
   - Después de 1,2 segundos se redirige a **`bienvenida.html`**, que solo muestra el logo y el texto **BIENVENIDO**.
   - Si alguien abre `bienvenida.html` directamente sin haber iniciado sesión, la página lo regresa a `index.html`.
5. **Si no coinciden:** aparece *"Correo o contraseña incorrectos. Te quedan N intento(s)"*. El mensaje es genérico a propósito, para no revelar si el correo existe.
6. **Después de 3 intentos fallidos** el botón se bloquea durante **30 segundos** y muestra una cuenta regresiva.

### 3. Recuperar contraseña
1. Desde *"¿Olvidaste tu contraseña?"* se muestra el formulario de recuperación.
2. Se valida que el correo tenga un formato válido y que esté registrado.
3. Se muestra *"Se enviaron las instrucciones a {correo}"*. **El envío es simulado**: en un sistema real lo haría el servidor.

### 4. Cambio entre formularios (animación)
- Los tres formularios ocupan la **misma celda de un CSS Grid** (`grid-area: 1 / 1`), uno encima de otro.
- La función `showView()` de `script.js` agrega la clase `active` al formulario que se debe ver y se la quita a los demás. También actualiza el atributo `data-view` de la tarjeta y el título de la pestaña del navegador.
- En CSS, el formulario `active` aparece con `opacity` y `transform`. Los demás se ocultan con `visibility: hidden`, en lugar de `display: none`, para que el cambio tenga transición.
- El indicador naranja de las pestañas se mueve con `transform: translateX(100%)` cuando `data-view="register"`.
- Al cambiar de formulario, el anterior se limpia (valores, errores y contraseñas visibles).

---

## Validaciones

Todas las validaciones se hacen con JavaScript (el formulario usa `novalidate` para mostrar mensajes personalizados en español). Los atributos HTML (`required`, `min`, `max`, `maxlength`, `pattern`) también están definidos en cada campo.

### Formulario de registro

| Campo | Tipo | Reglas | Mensajes de error |
|---|---|---|---|
| **Nombre completo** | `text` | Obligatorio · 3 a 50 caracteres · solo letras (incluye tildes y ñ) y espacios · mínimo **nombre y apellido** · los espacios extra se eliminan | *El nombre es obligatorio* · *Debe tener al menos 3 caracteres* · *No puede superar los 50 caracteres* · *Solo se permiten letras y espacios* · *Ingresa nombre y apellido* |
| **Correo electrónico** | `email` | Obligatorio · formato `usuario@dominio.ext` · máximo 100 caracteres · **no debe estar ya registrado** · se guarda en minúsculas | *El correo es obligatorio* · *Formato de correo inválido* · *El correo es demasiado largo* · *Este correo ya está registrado* |
| **Teléfono** | `tel` | Obligatorio · **solo números** (las letras se borran automáticamente al escribir) · exactamente **10 dígitos** · debe empezar con **09** (celular de Ecuador) | *El teléfono es obligatorio* · *Solo se permiten números* · *Debe tener exactamente 10 dígitos* · *Debe empezar con 09* |
| **Edad** | `number` | Obligatorio · **campo numérico** entero · entre **16 y 99** (`min`/`max`) · se bloquean las teclas `e`, `+`, `-`, `.` y `,` | *La edad es obligatoria* · *Ingresa solo números* · *La edad debe ser un número entero* · *Debes tener al menos 16 años* · *La edad máxima es 99 años* |
| **Carrera** | `select` | Obligatorio · debe elegirse una opción | *Selecciona una carrera* |
| **Contraseña** | `password` | Obligatorio · **mínimo 8 caracteres** · máximo 64 · al menos **una mayúscula**, **una minúscula**, **un número** y **un carácter especial** · sin espacios | *La contraseña es obligatoria* · *La contraseña no puede contener espacios* · *No puede superar los 64 caracteres* · *La contraseña no cumple todos los requisitos* |
| **Confirmar contraseña** | `password` | Obligatorio · debe ser **igual** a la contraseña (se revisa de nuevo si la contraseña cambia) | *Confirma tu contraseña* · *Las contraseñas no coinciden* |

### Formulario de inicio de sesión

| Campo | Reglas | Mensajes de error |
|---|---|---|
| **Correo** | Obligatorio · formato válido · no distingue mayúsculas ni espacios al inicio o final | *El correo es obligatorio* · *Formato de correo inválido* |
| **Contraseña** | Obligatoria | *La contraseña es obligatoria* |
| **Credenciales** | El correo debe existir y la contraseña coincidir | *Correo o contraseña incorrectos. Te quedan N intento(s)* |
| **Intentos** | Máximo 3 intentos fallidos; luego, bloqueo de 30 s | *Demasiados intentos fallidos. Espera 30 segundos* |

### Formulario de recuperar contraseña

| Campo | Reglas | Mensajes de error |
|---|---|---|
| **Correo** | Obligatorio · formato válido · debe estar registrado | *El correo es obligatorio* · *Formato de correo inválido* · *No existe una cuenta con este correo* |

### ¿Cuándo se valida?

| Evento | Qué hace |
|---|---|
| `blur` | Al salir de un campo con datos, se valida y se muestra el error o el borde verde. |
| `input` | Cuando un campo ya fue tocado, se vuelve a validar con cada tecla. También actualiza la lista de requisitos de la contraseña y limpia el teléfono. |
| `change` | Valida el `select` de carrera al elegir una opción. |
| `submit` | Valida **todos** los campos. Si alguno es inválido, **no se envía** y se muestra un mensaje de error. |

---

## Despliegue

### Opción 1: abrir directamente (local)
1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
   ```
2. Abre `index.html` con doble clic en Chrome, Firefox o Edge.

### Opción 2: Live Server (Visual Studio Code)
1. Instala la extensión **Live Server**.
2. Clic derecho sobre `index.html` → **Open with Live Server**.
3. Se abrirá en `http://127.0.0.1:5500` y se recargará con cada cambio.

### Opción 3: GitHub Pages (en línea)
1. Sube el proyecto a un repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Formulario de login y registro"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repositorio>.git
   git push -u origin main
   ```
2. En GitHub ve a **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Pulsa **Save**.
4. En uno o dos minutos la página estará en `https://<tu-usuario>.github.io/<tu-repositorio>/`.

> **Nota:** la función `crypto.subtle`, que cifra las contraseñas, solo funciona en contextos seguros: archivo local (`file://`), `localhost` o `https://`. Las tres opciones anteriores lo cumplen.

---

## Limitaciones

- Es un proyecto **solo de frontend**: los usuarios se guardan en el `localStorage` **de cada navegador**, así que no se comparten entre equipos y se pierden si se borran los datos del navegador.
- La recuperación de contraseña es **simulada** (no se envía ningún correo).
- Los iconos de Google, GitHub y LinkedIn son **solo diseño** (no son enlaces ni botones).
- En un sistema real, la validación también debe hacerse en el **servidor**.

Para borrar los usuarios de prueba, abre la consola del navegador (F12) y ejecuta:
```js
localStorage.removeItem('usuarios');
```
