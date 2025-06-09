# VoteChain - Sistema de Votación Blockchain (Frontend)

Este es el **Frontend oficial** de la DApp **VoteChain**, un sistema de votación blockchain completo, transparente e inmutable.

VoteChain permite gestionar elecciones y realizar votaciones directamente en un contrato inteligente, con total transparencia y trazabilidad pública.

---

## 🚀 ¿Qué incluye este proyecto?

- 🗳️ **Votación en la blockchain** (con contrato inteligente)
- 🔐 **Login dual**:
  - Wallet + Contraseña
  - Firma de Nonce con MetaMask
- 🏛️ **Panel de Administración**:
  - Crear elecciones
  - Finalizar elecciones
  - Crear candidatos
- 👁️ **Panel de Observador**:
  - Ver elecciones finalizadas
  - Consultar resultados + Hash de integridad
  - Firmar resultados con MetaMask
  - Publicar firma en la blockchain (a través de backend)
- 🌐 **Auditoría Pública**:
  - Consultar resultados públicos
  - Consultar firmas de observadores
- 👤 **Gestión de Roles**:
  - Voter
  - Observer
  - Admin
- ⚡ **Resultados en tiempo real** (polling)
- 🔗 **Integración completa con contrato inteligente (smart contract)**

---

## 🗂️ Estructura del frontend

/src
├── components
│ ├── Admin
│ ├── Auth
│ ├── Common
│ ├── Elections
│ ├── Home
│ ├── Layout
│ ├── Observer
│ ├── Public
├── contexts
│ └── AuthContext.tsx
├── services
│ ├── api.ts → llamadas al backend REST
│ ├── AuthService.ts → login + nonce + firma
│ ├── blockchainService.ts → llamadas al contrato
│ ├── wallet.ts → integración con MetaMask
├── types → tipos de datos compartidos
├── App.tsx → configuración de rutas
├── main.tsx
├── index.css

---

## 🔑 Proceso de autenticación

### Login con Wallet + Contraseña

- Registro previo requerido
- Login tradicional → JWT

### Login con Firma de Nonce

- Solicita un `Nonce` al backend
- Firma el `Nonce` con MetaMask
- Envío de la firma al backend → validación → JWT

---

## 🔗 Contrato inteligente

VoteChain utiliza un contrato inteligente de tipo `Election` con las siguientes funciones:

- `startNewElection`  
- `vote`  
- `voteFor` (admin)
- `getResults`
- `getWinner`
- `endElection`
- `hasAddressVoted`
- ...

El contrato garantiza la inmutabilidad y transparencia del proceso.

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz de `frontend`:

```env
VITE_API_URL=https://localhost:7151

💻 Instalación y ejecución
1️⃣ Clonar el repo:
git clone <repo-url>

2️⃣ Instalar dependencias:
npm install

3️⃣ Ejecutar en modo desarrollo:
npm run dev

→ La app correrá en: http://localhost:5173

✅ Requisitos previos
Tener el backend VoteChain corriendo → https://localhost:7151

Tener MetaMask instalada y configurada

Tener el contrato Election.sol desplegado

Tener las direcciones de contratos configuradas correctamente en blockchainService.ts

📝 Notas técnicas
El frontend no almacena claves privadas → se firma con MetaMask.

El login de Observador y Admin está protegido.

Los resultados en tiempo real utilizan polling cada 5 seg.

Las firmas de observadores se registran en backend (y pueden publicarse en la blockchain en una mejora futura).

La auditoría pública está abierta.

✅ El sistema actualmente está desplegado en la testnet pública **Sepolia**, con contrato activo en la red:
https://sepolia.etherscan.io/address/0xFF29d447f04ce4c2D763B4936aD42cd66dDf138A

✅ El frontend interactúa con MetaMask, permitiendo a los usuarios conectarse a la testnet pública y participar en las elecciones reales sobre la blockchain distribuida.

Para acceder al contrato ir a https://sepolia.etherscan.io/address/[direccion_del_contrato]

🚧 Posibles mejoras futuras
Almacenamiento de firmas de observador también en el contrato.

Verificación de integridad completa en frontend.

Multi-network (testnet / mainnet).

Mejora UX con notificaciones.

✨ Créditos
Este proyecto ha sido desarrollado como parte del reto Herramientas - "Elijes Tú" del T-2 2025.

👉 Autores: Randielfi Guzmán, Enmanuel Villavizar, Emil Gonzáles
👉 Año: 2025


