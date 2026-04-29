This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run build
npm start
```

---

## 📧 Sistema de Email (Alta Performance)

O sistema de envio de emails foi implementado com foco em concorrência, tolerância a falhas e zero dependência de processos externos no servidor, rodando diretamente no Next.js (via `instrumentation.ts`).

### Funcionalidades
- **Workers Concorrentes**: Processamento de filas em background.
- **Backoff Exponencial + Jitter**: Retentativas inteligentes em caso de falha de rede/SMTP.
- **Dead Letter Queue (DLQ)**: Emails que excedem o limite de tentativas (`EMAIL_MAX_ATTEMPTS`) são salvos para auditoria.
- **Crash Recovery**: Jobs interrompidos no meio do processamento são recuperados automaticamente.
- **Proteção contra Race Condition**: Uso de `SELECT ... FOR UPDATE SKIP LOCKED` para que os workers não peguem o mesmo email.

### Como usar

Use o `emailService` para enviar emails assincronamente ou sincronamente:

```typescript
import { emailService } from '@/lib/email';

// Envio assíncrono (Recomendado) — Enfileira e processa em background
await emailService.sendEmail({
  to: 'usuario@exemplo.com',
  template: 'welcome',
  data: { name: 'João' }
});

// Envio síncrono (Bypassa a fila)
await emailService.sendEmailNow({
  to: 'usuario@exemplo.com',
  subject: 'Alerta Crítico',
  html: '<h1>Servidor offline!</h1>'
});
```

### Configuração (.env)

| Variável | Padrão | Descrição |
|---|---|---|
| `EMAIL_PROVIDER` | `smtp` | Provider (`smtp`, `sendgrid`, `ses`) |
| `EMAIL_WORKERS` | `5` | Número de workers concorrentes |
| `EMAIL_POLL_MS` | `500` | Intervalo de polling na fila (ms) |
| `EMAIL_MAX_ATTEMPTS` | `5` | Máximo de tentativas antes do Dead Letter |
| `EMAIL_RATE_LIMIT` | `14` | Limite de envio por segundo por worker |
| `EMAIL_POOL_SIZE` | `5` | Tamanho do connection pool do Nodemailer |

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
