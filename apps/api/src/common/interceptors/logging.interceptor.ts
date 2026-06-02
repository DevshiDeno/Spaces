import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import type { AppConfig } from '@/config/configuration';

const REDACT_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'invitetoken',
  'invitetokenexpiresat',
  'jwt',
  'authorization',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'apikey',
  'api_key',
  'secret',
  'phone',
]);

// Catches Bearer tokens / long base64-ish strings embedded in error messages.
const TOKEN_LIKE_PATTERN = /(Bearer\s+)?[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

const MAX_BODY_CHARS = 2000;

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.replace(TOKEN_LIKE_PATTERN, '[redacted-token]');
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = REDACT_KEYS.has(key.toLowerCase()) ? '[redacted]' : redact(val);
    }
    return out;
  }
  return value;
}

function stringify(body: unknown): string {
  if (body === undefined || body === null) return '';
  try {
    const text = typeof body === 'string' ? redact(body) as string : JSON.stringify(redact(body));
    return text.length > MAX_BODY_CHARS
      ? `${text.slice(0, MAX_BODY_CHARS)}…(truncated)`
      : text;
  } catch {
    return '[unserializable]';
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly logBodies: boolean;

  constructor(config: ConfigService<AppConfig>) {
    this.logBodies = config.get<boolean>('logRequestBodies', { infer: true }) ?? false;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const started = Date.now();
    const requestSnippet = this.logBodies ? stringify(req.body) : '';
    const url = req.originalUrl ?? req.url;

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const ms = Date.now() - started;
          const parts = [`${req.method} ${url}`, `→ ${res.statusCode}`, `${ms}ms`];
          if (requestSnippet) parts.push(`req=${requestSnippet}`);
          if (this.logBodies) parts.push(`res=${stringify(responseBody)}`);
          this.logger.log(parts.join(' '));
        },
        error: (err: unknown) => {
          const ms = Date.now() - started;
          const status =
            err instanceof HttpException
              ? err.getStatus()
              : (err as { status?: number })?.status ?? 500;
          const errorPayload =
            err instanceof HttpException
              ? err.getResponse()
              : (err as { message?: string })?.message ?? err;
          const parts = [`${req.method} ${url}`, `→ ${status}`, `${ms}ms`];
          if (requestSnippet) parts.push(`req=${requestSnippet}`);
          // Always log the error payload (small, useful, already passes through redact()).
          parts.push(`err=${stringify(errorPayload)}`);
          this.logger.error(parts.join(' '));
        },
      })
    );
  }
}
