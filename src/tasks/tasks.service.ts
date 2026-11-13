import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateTaskDto,
  ListTasksQuery,
  UpdateTaskDto,
} from './dto/task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaskDto) {
    return this.prisma.task.create({ data });
  }

  findAll(query: ListTasksQuery) {
    const where: Prisma.TaskWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    return this.prisma.task.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`La mission ${id} n'existe pas`);
    }
    return task;
  }

  async update(id: number, data: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Règle métier future (ex. interdire la suppression d'une mission COMPLETED) : ici
    await this.prisma.task.delete({ where: { id } });
  }

  async stats() {
    const maintenant = new Date();
    const [total, todo, enCours, terminees, enRetard] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'TODO' } }),
      this.prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { status: 'COMPLETED' } }),
      this.prisma.task.count({
        where: { status: { not: 'COMPLETED' }, due_date: { lt: maintenant } },
      }),
    ]);
    return {
      total,
      todo,
      in_progress: enCours,
      completed: terminees,
      overdue: enRetard,
    };
  }
}