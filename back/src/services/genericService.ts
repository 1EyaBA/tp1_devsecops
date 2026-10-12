import { Injectable, NotFoundException } from '@nestjs/common';
import { Any, In, Repository } from 'typeorm';

@Injectable()
export class GenericService {
  constructor(
    private readonly repository: Repository<any>,  
  ) {}

  async create(createDto: any): Promise<any> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }
  

  async findAll(): Promise<any[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateDto: any): Promise<any> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async findByIds(ids: number[]): Promise<any[]> {
    const entities = await this.repository.find({
      where: { id: In(ids) }, 
    });

    if (!entities.length) {
      throw new NotFoundException(`Entities with IDs ${ids.join(', ')} not found`);
    }
    return entities;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }
  countAll() {
    return this.repository.count();
  }
}
