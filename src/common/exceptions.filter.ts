import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const CODES_RESEAU = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'];

function estErreurConnexion(erreur: unknown): boolean {
  if (typeof erreur !== 'object' || erreur === null) return false;
  const { code, name, cause } = erreur as {
    code?: unknown;
    name?: unknown;
    cause?: unknown;
  };
  if (name === 'PrismaClientInitializationError') return true;
  if (
    typeof code === 'string' &&
    (/^P1\d{3}$/.test(code) || CODES_RESEAU.includes(code))
  ) {
    return true;
  }
  return cause ? estErreurConnexion(cause) : false;
}

@Catch()
export class ToutesExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ToutesExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const reponse = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const statut = exception.getStatus();
      const corps = exception.getResponse();
      return reponse
        .status(statut)
        .json(
          typeof corps === 'string'
            ? { statusCode: statut, message: corps }
            : corps,
        );
    }

    this.logger.error(exception);

    if (estErreurConnexion(exception)) {
      return reponse.status(503).json({
        statusCode: 503,
        message: 'Base de données indisponible, réessayez plus tard',
      });
    }

    return reponse.status(500).json({
      statusCode: 500,
      message: 'Erreur interne du serveur',
    });
  }
}