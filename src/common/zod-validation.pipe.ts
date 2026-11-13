import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const resultat = this.schema.safeParse(value);
    if (!resultat.success) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Données invalides',
        errors: resultat.error.issues.map((probleme) => ({
          champ: probleme.path.map(String).join('.'),
          message: probleme.message,
        })),
      });
    }
    return resultat.data;
  }
}