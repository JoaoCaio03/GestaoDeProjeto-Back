import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno ao processar a solicitação.';
    let details: any = null;
    let errorCode: string | undefined = undefined;

    // --- 1. ERROS CONHECIDOS (Constraint Violations) ---
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorCode = exception.code;

      switch (exception.code) {
        // P2002: Violação de Unicidade (Duplicidade)
        case 'P2002':
          status = HttpStatus.CONFLICT; // 409

          // Pegamos o target como 'unknown' inicialmente
          let target = exception.meta?.target;

          // Se for array, converte para string
          if (Array.isArray(target)) {
            target = target.join(', ');
          }

          // Fallback: Se não achou no meta, tenta achar via Regex na mensagem
          if (!target) {
            const match = exception.message.match(/fields: \((.*?)\)/);
            if (match && match[1]) {
              target = match[1].replace(/["`]/g, ''); // Limpa aspas
            }
          }

          // LÓGICA CORRIGIDA AQUI:
          if (target) {
            // Forçamos a conversão para String() para o TypeScript não reclamar
            const targetStr = String(target);

            if (targetStr.includes('contractNum')) {
              message = 'Já existe um contrato registrado com este Número.';
            } else if (targetStr.includes('email')) {
              message = 'Este e-mail já está sendo usado por outro usuário.';
            } else {
              message = `O valor informado para o campo '${targetStr}' já existe no sistema.`;
            }
          } else {
            message =
              'Um dos dados informados já existe no sistema (Duplicidade).';
          }

          details = { field: target, type: 'unique_constraint' };
          break;

        // P2025: Registro não encontrado
        case 'P2025':
          status = HttpStatus.NOT_FOUND; // 404
          message =
            'O registro solicitado não foi encontrado (pode ter sido excluído).';
          break;

        // P2003: Chave Estrangeira Inválida
        case 'P2003':
          status = HttpStatus.BAD_REQUEST; // 400
          const fieldName = exception.meta?.field_name;
          message = `Erro de vínculo: O registro relacionado em '${fieldName || 'campo desconhecido'}' não existe.`;
          details = { field: fieldName, type: 'foreign_key_constraint' };
          break;

        // P2000: Valor muito longo
        case 'P2000':
          status = HttpStatus.BAD_REQUEST; // 400
          message =
            'O valor inserido é muito longo para o limite suportado pelo banco.';
          break;

        default:
          message = `Erro no banco de dados.`;
          details = { prismaError: exception.message.split('\n').pop() };
          break;
      }
    }

    // --- 2. ERROS DE VALIDAÇÃO ---
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY; // 422
      message = 'Os dados enviados não correspondem ao formato esperado.';
      details = { error: 'Verifique tipos de dados e campos obrigatórios.' };
    }

    // --- 3. ERROS DE CONEXÃO ---
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE; // 503
      message = 'O sistema de banco de dados está indisponível no momento.';
      errorCode = exception.errorCode;
    }

    // --- 4. ERROS CRÍTICOS ---
    else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro crítico no motor do banco de dados.';
    }

    // LOG TÉCNICO
    this.logger.error(
      `[Prisma] ${errorCode || exception.name} em ${request.method} ${request.url}`,
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? JSON.stringify(exception.meta)
        : exception.stack,
    );

    // RESPOSTA
    response.status(status).json({
      statusCode: status,
      message: message,
      code: errorCode,
      details: details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
