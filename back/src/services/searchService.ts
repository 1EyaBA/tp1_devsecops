import { Injectable } from "@nestjs/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export interface SearchResult<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
}

@Injectable()
export class SearchService {

  async searchQuery<T extends ObjectLiteral>(
      queryBuilder: SelectQueryBuilder<T>,
      searchTerm: string,
      fields: string[] = [],
      page = 1,
      limit = 6,
  ): Promise<SearchResult<T>> {

    const whereConditions = fields.map(field => {
      return `${field} LIKE :searchTerm`;
    }).join(" OR ");

    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
        .where(whereConditions, { searchTerm: `%${searchTerm}%` })
        .skip(skip)
        .take(limit)
        .getManyAndCount();
    console.log("search result", data, total);
    return {
      data,
      totalItems: total,
      currentPage: page,
    };
  }
}