// src/reports/dto/report-pagination.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Report } from '../../report/entities/report.entity';

@ObjectType()
export class ReportPagination {
    @Field(() => [Report], { description: 'Liste des rapports de la page courante' })
    data: Report[];

    @Field(() => Int, { description: 'Nombre total d’éléments disponibles' })
    totalItems: number;

    @Field(() => Int, { description: 'Nombre total de pages' })
    totalPages: number;

    @Field(() => Int, { description: 'Page courante' })
    currentPage: number;
}