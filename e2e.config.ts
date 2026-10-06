import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export default {
  targets: [
    {
      name: 'web',
      engine: web({ browser: 'chromium' }),
      app: {
        url: 'http://127.0.0.1:3000',
        command: {
          executable: 'npx',
          args: ['serve', '-c', 'serve.json', '-l', '{port}'],
          startupTimeout: 30_000,
          log: '.e2e/logs/app.log',
        },
      },
    },
  ],
  agents: {
    default: {
      model: createOpenAICompatible({
        name: 'openai-compatible',
        baseURL: 'http://localhost:20128/v1',
      }).chatModel('ag/gemini-3.8-flash'),
      system: 'You are a thorough QA agent. Verify every outcome on screen.',
    },
  },
  workers: 1,
} satisfies E2EConfig;
