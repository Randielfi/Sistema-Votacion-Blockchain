# Sistema de Votación Blockchain

Este proyecto es un sistema de votación descentralizado que utiliza un contrato inteligente desplegado en Ethereum (compatible con redes de prueba como Sepolia o Ganache) y un backend en ASP.NET Core que gestiona la lógica de aplicación y sincronización con una base de datos relacional.

## 🧱 Arquitectura

- Solidity: Contrato inteligente `Election.sol`
- ASP.NET Core Web API
- Nethereum para comunicación con la blockchain
- Entity Framework Core + SQLite/PostgreSQL para persistencia local

## ✨ Funcionalidades

- Registro de elecciones con título y candidatos
- Votación segura desde wallets únicas
- Prevención de doble voto (a nivel de blockchain y base de datos)
- Resultados por elección
- Finalización de elecciones
- Obtención del estado y ganador (con validación de empate)
- Soporte para dos modos:
  - 🧪 Modo Prueba (el backend firma las transacciones)
  - 🔐 Modo Producción (el frontend firma y el backend solo registra)

## 🔧 Configuración

1. Configura el archivo `appsettings.json`:

```json
{
  "Blockchain": {
    "PrivateKey": "0x...",
    "RpcUrl": "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
    "ContractAddress": "0xABC..."
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=elections.db"
  }
}
```

2. Compila el contrato `Election.sol` y copia su ABI a:

```
/Contracts/Election.abi.json
```

3. Configura el modo de firma en `VoteController.cs`:

```csharp
private const bool USE_LOCAL_SIGNING = true; // o false en producción
```

## 🧪 Pruebas locales

Puedes iniciar una elección y emitir votos directamente desde Swagger o Postman. Asegúrate de:

- Iniciar una elección con candidatos válidos
- No repetir wallets para la misma elección
- Finalizar la elección antes de consultar el ganador

## 🗃️ Endpoints clave

- `POST /api/election/start` → Iniciar elección
- `POST /api/vote/submit` → Emitir voto
- `GET /api/election` → Obtener todas las elecciones
- `GET /api/election/{id}/status` → Estado de una elección
- `GET /api/election/{id}/results` → Resultados
- `GET /api/election/{id}/winner` → Ganador (solo si ha finalizado)
- `PUT /api/election/{id}/end` → Finalizar elección

## ✅ Validaciones

- ❌ No se puede votar por un candidato inexistente
- ❌ No se puede votar dos veces
- ❌ No se puede obtener ganador si la elección no ha terminado
- ✅ Todo voto exitoso queda registrado en la blockchain y la base de datos

## 🧠 Conclusiones

Este sistema demuestra cómo combinar tecnologías Web3 con aplicaciones tradicionales para lograr integridad, transparencia y auditabilidad en votaciones electrónicas. Es ideal para proyectos académicos, elecciones comunitarias, o prototipos descentralizados.